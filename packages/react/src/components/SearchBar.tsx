import React, { useState, useMemo } from 'react'
import { Search, X, Hash, Wallet, AlertTriangle } from 'lucide-react'
import type { TxNode, TxEdge } from '../types'

export interface SearchResult {
  type: 'node' | 'edge'
  item: TxNode | TxEdge
  matchField: string
  matchValue: string
}

export interface SearchBarProps {
  nodes: TxNode[]
  edges: TxEdge[]
  onResultSelect?: (result: SearchResult) => void
  onClear?: () => void
  placeholder?: string
  className?: string
}

function isValidAddress(address: string): boolean {
  // Ethereum address
  if (/^0x[0-9a-fA-F]{40}$/.test(address)) return true
  // Tron address
  if (/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address)) return true
  return false
}

function isValidTxHash(hash: string): boolean {
  // Standard transaction hash (64 hex chars)
  return /^0x[0-9a-fA-F]{64}$/.test(hash) || /^[0-9a-fA-F]{64}$/.test(hash)
}

export default function SearchBar({
  nodes,
  edges,
  onResultSelect,
  onClear,
  placeholder = "Search addresses, transaction hashes, or risk levels...",
  className = ''
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const searchResults = useMemo(() => {
    if (!query || query.length < 2) return []

    const results: SearchResult[] = []
    const lowerQuery = query.toLowerCase()

    // Search nodes
    nodes.forEach(node => {
      // Address search (exact match or partial for display purposes)
      if (node.address.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'node',
          item: node,
          matchField: 'address',
          matchValue: node.address
        })
      }

      // Risk level search
      if (node.risk_level.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'node',
          item: node,
          matchField: 'risk_level',
          matchValue: node.risk_level
        })
      }

      // Tag search
      node.tags.forEach(tag => {
        if (tag.primary_category.toLowerCase().includes(lowerQuery) ||
            tag.name?.toLowerCase().includes(lowerQuery)) {
          results.push({
            type: 'node',
            item: node,
            matchField: 'tag',
            matchValue: tag.name || tag.primary_category
          })
        }
      })

      // Chain search
      if (node.chain?.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'node',
          item: node,
          matchField: 'chain',
          matchValue: node.chain
        })
      }
    })

    // Search edges
    edges.forEach(edge => {
      // From/To address search
      if (edge.from.toLowerCase().includes(lowerQuery) ||
          edge.to.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'edge',
          item: edge,
          matchField: 'addresses',
          matchValue: `${edge.from} → ${edge.to}`
        })
      }

      // Token search
      if (edge.token?.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'edge',
          item: edge,
          matchField: 'token',
          matchValue: edge.token
        })
      }

      // Amount search (formatted)
      if (edge.formatted_amount.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'edge',
          item: edge,
          matchField: 'amount',
          matchValue: edge.formatted_amount
        })
      }
    })

    // Remove duplicates and limit results
    const uniqueResults = results.filter((result, index, self) => 
      index === self.findIndex(r => 
        r.type === result.type && 
        JSON.stringify(r.item) === JSON.stringify(result.item) &&
        r.matchField === result.matchField
      )
    )

    return uniqueResults.slice(0, 10) // Limit to 10 results
  }, [query, nodes, edges])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setIsOpen(value.length >= 2)
  }

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false)
    onResultSelect?.(result)
  }

  const handleClear = () => {
    setQuery('')
    setIsOpen(false)
    onClear?.()
  }

  const getResultIcon = (result: SearchResult) => {
    if (result.type === 'node') {
      const node = result.item as TxNode
      if (result.matchField === 'risk_level') {
        return <AlertTriangle className="w-4 h-4 text-amber-500" />
      }
      return <Wallet className="w-4 h-4 text-blue-500" />
    } else {
      return <Hash className="w-4 h-4 text-green-500" />
    }
  }

  const formatResultText = (result: SearchResult) => {
    const node = result.item as TxNode
    const edge = result.item as TxEdge

    switch (result.matchField) {
      case 'address':
        return {
          primary: `${node.address.slice(0, 8)}...${node.address.slice(-6)}`,
          secondary: `${node.risk_level} risk • Depth ${node.depth}`
        }
      case 'risk_level':
        return {
          primary: `${node.risk_level.toUpperCase()} Risk`,
          secondary: `${node.address.slice(0, 8)}...${node.address.slice(-6)}`
        }
      case 'tag':
        return {
          primary: result.matchValue,
          secondary: `${node.address.slice(0, 8)}...${node.address.slice(-6)}`
        }
      case 'chain':
        return {
          primary: `${result.matchValue} Chain`,
          secondary: `${node.address.slice(0, 8)}...${node.address.slice(-6)}`
        }
      case 'addresses':
        return {
          primary: `Transaction Edge`,
          secondary: `${edge.from.slice(0, 6)}...${edge.from.slice(-4)} → ${edge.to.slice(0, 6)}...${edge.to.slice(-4)}`
        }
      case 'token':
        return {
          primary: `${result.matchValue} Transfer`,
          secondary: edge.formatted_amount
        }
      case 'amount':
        return {
          primary: result.matchValue,
          secondary: `${edge.from.slice(0, 6)}...${edge.from.slice(-4)} → ${edge.to.slice(0, 6)}...${edge.to.slice(-4)}`
        }
      default:
        return {
          primary: result.matchValue,
          secondary: ''
        }
    }
  }

  const showSearchHints = query.length > 0 && query.length < 2
  const queryType = useMemo(() => {
    if (isValidAddress(query)) return 'address'
    if (isValidTxHash(query)) return 'transaction'
    return 'general'
  }, [query])

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(query.length >= 2)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {(isOpen || showSearchHints) && (
        <div className="absolute z-30 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700">
          {showSearchHints && (
            <div className="p-3">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 dark:text-gray-400">
                Search Tips
              </div>
              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                <div>• Enter at least 2 characters to search</div>
                <div>• Search addresses: 0x1234... or TN3W4H...</div>
                <div>• Search risk levels: high, medium, low</div>
                <div>• Search entity tags: exchange, defi, etc.</div>
                <div>• Search amounts: 100 USDT, 1.5 ETH</div>
              </div>
            </div>
          )}

          {isOpen && searchResults.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              No results found for "{query}"
            </div>
          )}

          {isOpen && searchResults.length > 0 && (
            <>
              <div className="p-2">
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400">
                  {searchResults.length} result{searchResults.length > 1 ? 's' : ''} 
                  {queryType !== 'general' && ` • ${queryType} detected`}
                </div>
                
                <div className="mt-1 space-y-1">
                  {searchResults.map((result, index) => {
                    const { primary, secondary } = formatResultText(result)
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleResultClick(result)}
                        className="w-full flex items-center gap-3 px-2 py-2 text-left text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {getResultIcon(result)}
                        
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {primary}
                          </div>
                          {secondary && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {secondary}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {result.type}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}