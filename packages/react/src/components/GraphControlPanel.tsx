import React, { useState, useMemo } from 'react'
import SearchBar, { type SearchResult } from './SearchBar'
import FilterPanel, { type FilterConfig } from './FilterPanel'
import type { TxNode, TxEdge, TxGraphStats } from '../types'

export interface GraphControlPanelProps {
  nodes: TxNode[]
  edges: TxEdge[]
  stats?: TxGraphStats | null
  onNodeSelect?: (node: TxNode | null) => void
  onFilterChange?: (filteredNodes: TxNode[], filteredEdges: TxEdge[]) => void
  className?: string
}

const DEFAULT_FILTER: FilterConfig = {
  riskLevels: ['high', 'medium', 'low', 'unknown'],
  chains: [],
  depthRange: [0, 10],
  amountRange: [0, Number.MAX_SAFE_INTEGER],
  dateRange: [null, null],
  tokens: [],
  onlyRootNodes: false,
  onlyStoppedNodes: false,
  hideUntaggedNodes: false
}

export default function GraphControlPanel({
  nodes,
  edges,
  stats,
  onNodeSelect,
  onFilterChange,
  className = ''
}: GraphControlPanelProps) {
  const [filter, setFilter] = useState<FilterConfig>(DEFAULT_FILTER)
  const [selectedNode, setSelectedNode] = useState<TxNode | null>(null)

  // Apply filters to nodes and edges
  const filteredData = useMemo(() => {
    // Filter nodes
    let filteredNodes = nodes.filter(node => {
      // Risk level filter
      if (!filter.riskLevels.includes(node.risk_level)) return false
      
      // Chain filter
      if (filter.chains.length > 0 && node.chain && !filter.chains.includes(node.chain)) return false
      
      // Depth filter
      if (node.depth < filter.depthRange[0] || node.depth > filter.depthRange[1]) return false
      
      // Root nodes filter
      if (filter.onlyRootNodes && !node.is_root) return false
      
      // Stopped nodes filter
      if (filter.onlyStoppedNodes && !node.is_stopped) return false
      
      // Untagged nodes filter
      if (filter.hideUntaggedNodes && node.tags.length === 0) return false
      
      return true
    })

    // Get addresses of filtered nodes for edge filtering
    const nodeAddresses = new Set(filteredNodes.map(n => n.address))

    // Filter edges
    let filteredEdges = edges.filter(edge => {
      // Only include edges where both nodes are in filtered set
      if (!nodeAddresses.has(edge.from) || !nodeAddresses.has(edge.to)) return false
      
      // Amount filter (convert to number for comparison)
      const amount = parseFloat(edge.amount) || 0
      if (amount < filter.amountRange[0] || amount > filter.amountRange[1]) return false
      
      // Date filter
      if (filter.dateRange[0] && edge.last_timestamp < filter.dateRange[0].getTime() / 1000) return false
      if (filter.dateRange[1] && edge.last_timestamp > filter.dateRange[1].getTime() / 1000) return false
      
      // Token filter
      if (filter.tokens.length > 0 && edge.token && !filter.tokens.includes(edge.token)) return false
      
      return true
    })

    return { filteredNodes, filteredEdges }
  }, [nodes, edges, filter])

  // Notify parent of filter changes
  React.useEffect(() => {
    onFilterChange?.(filteredData.filteredNodes, filteredData.filteredEdges)
  }, [filteredData, onFilterChange])

  const handleSearchResultSelect = (result: SearchResult) => {
    if (result.type === 'node') {
      const node = result.item as TxNode
      setSelectedNode(node)
      onNodeSelect?.(node)
    } else if (result.type === 'edge') {
      const edge = result.item as TxEdge
      // Find the target node (to) for edge selection
      const targetNode = nodes.find(n => n.address === edge.to)
      if (targetNode) {
        setSelectedNode(targetNode)
        onNodeSelect?.(targetNode)
      }
    }
  }

  const handleSearchClear = () => {
    setSelectedNode(null)
    onNodeSelect?.(null)
  }

  const filterStats = useMemo(() => {
    const originalNodes = nodes.length
    const originalEdges = edges.length
    const filteredNodes = filteredData.filteredNodes.length
    const filteredEdges = filteredData.filteredEdges.length
    
    return {
      nodes: {
        original: originalNodes,
        filtered: filteredNodes,
        hidden: originalNodes - filteredNodes
      },
      edges: {
        original: originalEdges,
        filtered: filteredEdges,
        hidden: originalEdges - filteredEdges
      }
    }
  }, [nodes.length, edges.length, filteredData])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <SearchBar
        nodes={filteredData.filteredNodes}
        edges={filteredData.filteredEdges}
        onResultSelect={handleSearchResultSelect}
        onClear={handleSearchClear}
      />

      {/* Filter Panel */}
      <FilterPanel
        nodes={nodes}
        edges={edges}
        filter={filter}
        onChange={setFilter}
      />

      {/* Filter Statistics */}
      {(filterStats.nodes.hidden > 0 || filterStats.edges.hidden > 0) && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
          <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
            Filter Applied
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-300 space-y-0.5">
            {filterStats.nodes.hidden > 0 && (
              <div>
                Showing {filterStats.nodes.filtered} of {filterStats.nodes.original} nodes 
                ({filterStats.nodes.hidden} hidden)
              </div>
            )}
            {filterStats.edges.hidden > 0 && (
              <div>
                Showing {filterStats.edges.filtered} of {filterStats.edges.original} edges 
                ({filterStats.edges.hidden} hidden)
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Node Info */}
      {selectedNode && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
          <div className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
            Selected Node
          </div>
          <div className="text-xs text-green-700 dark:text-green-300 space-y-0.5">
            <div className="font-mono">
              {selectedNode.address.slice(0, 8)}...{selectedNode.address.slice(-6)}
            </div>
            <div>
              Risk: {selectedNode.risk_level.toUpperCase()} • Depth: {selectedNode.depth}
            </div>
            {selectedNode.tags.length > 0 && (
              <div>
                Tags: {selectedNode.tags.map(t => t.primary_category).join(', ')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}