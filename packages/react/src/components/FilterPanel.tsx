import React, { useState, useMemo } from 'react'
import { Filter, X, Calendar, DollarSign, Layers, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import type { TxNode, TxEdge } from '../types'

export interface FilterConfig {
  riskLevels: string[]
  chains: string[]
  depthRange: [number, number]
  amountRange: [number, number]
  dateRange: [Date | null, Date | null]
  tokens: string[]
  onlyRootNodes: boolean
  onlyStoppedNodes: boolean
  hideUntaggedNodes: boolean
}

export interface FilterPanelProps {
  nodes: TxNode[]
  edges: TxEdge[]
  filter: FilterConfig
  onChange: (filter: FilterConfig) => void
  className?: string
}

const RISK_LEVELS = ['high', 'medium', 'low', 'unknown']
const RISK_COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#22c55e',
  unknown: '#6b7280'
}

export default function FilterPanel({
  nodes,
  edges,
  filter,
  onChange,
  className = ''
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Extract available options from data
  const availableOptions = useMemo(() => {
    const chains = [...new Set(nodes.map(n => n.chain).filter(Boolean))] as string[]
    const tokens = [...new Set(edges.map(e => e.token).filter(Boolean))] as string[]
    const depths = nodes.map(n => n.depth)
    const amounts = edges.map(e => parseFloat(e.amount) || 0).filter(a => a > 0)
    const timestamps = edges.map(e => e.last_timestamp)

    return {
      chains: chains.sort(),
      tokens: tokens.sort(),
      depthRange: depths.length > 0 ? [Math.min(...depths), Math.max(...depths)] as [number, number] : [0, 5] as [number, number],
      amountRange: amounts.length > 0 ? [Math.min(...amounts), Math.max(...amounts)] as [number, number] : [0, 1000000] as [number, number],
      dateRange: timestamps.length > 0 ? [Math.min(...timestamps), Math.max(...timestamps)] as [number, number] : [0, Date.now() / 1000] as [number, number]
    }
  }, [nodes, edges])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filter.riskLevels.length < RISK_LEVELS.length) count++
    if (filter.chains.length > 0 && filter.chains.length < availableOptions.chains.length) count++
    if (filter.depthRange[0] > availableOptions.depthRange[0] || filter.depthRange[1] < availableOptions.depthRange[1]) count++
    if (filter.amountRange[0] > availableOptions.amountRange[0] || filter.amountRange[1] < availableOptions.amountRange[1]) count++
    if (filter.dateRange[0] || filter.dateRange[1]) count++
    if (filter.tokens.length > 0) count++
    if (filter.onlyRootNodes) count++
    if (filter.onlyStoppedNodes) count++
    if (filter.hideUntaggedNodes) count++
    return count
  }, [filter, availableOptions])

  const updateFilter = (updates: Partial<FilterConfig>) => {
    onChange({ ...filter, ...updates })
  }

  const clearAllFilters = () => {
    onChange({
      riskLevels: RISK_LEVELS,
      chains: [],
      depthRange: availableOptions.depthRange,
      amountRange: availableOptions.amountRange,
      dateRange: [null, null],
      tokens: [],
      onlyRootNodes: false,
      onlyStoppedNodes: false,
      hideUntaggedNodes: false
    })
  }

  const formatAmount = (amount: number) => {
    if (amount >= 1e9) return `${(amount / 1e9).toFixed(1)}B`
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(1)}M`
    if (amount >= 1e3) return `${(amount / 1e3).toFixed(1)}K`
    return amount.toFixed(2)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toISOString().split('T')[0]
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 ${className}`}>
      {/* Filter Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-900 dark:text-gray-100">
            Filters
          </span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium text-white bg-blue-500 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear all
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Risk Levels */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Risk Levels
            </label>
            <div className="flex flex-wrap gap-2">
              {RISK_LEVELS.map(risk => (
                <button
                  key={risk}
                  onClick={() => {
                    const newRiskLevels = filter.riskLevels.includes(risk)
                      ? filter.riskLevels.filter(r => r !== risk)
                      : [...filter.riskLevels, risk]
                    updateFilter({ riskLevels: newRiskLevels })
                  }}
                  className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                    filter.riskLevels.includes(risk)
                      ? 'bg-opacity-20 border-current'
                      : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'
                  }`}
                  style={{
                    color: filter.riskLevels.includes(risk) ? RISK_COLORS[risk as keyof typeof RISK_COLORS] : undefined,
                    backgroundColor: filter.riskLevels.includes(risk) ? `${RISK_COLORS[risk as keyof typeof RISK_COLORS]}20` : undefined,
                    borderColor: filter.riskLevels.includes(risk) ? RISK_COLORS[risk as keyof typeof RISK_COLORS] : undefined
                  }}
                >
                  <AlertTriangle className="w-3 h-3" />
                  {risk.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Chains */}
          {availableOptions.chains.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Chains
              </label>
              <div className="flex flex-wrap gap-2">
                {availableOptions.chains.map(chain => (
                  <button
                    key={chain}
                    onClick={() => {
                      const newChains = filter.chains.includes(chain)
                        ? filter.chains.filter(c => c !== chain)
                        : [...filter.chains, chain]
                      updateFilter({ chains: newChains })
                    }}
                    className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                      filter.chains.length === 0 || filter.chains.includes(chain)
                        ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300'
                        : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <Layers className="w-3 h-3" />
                    {chain}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Depth Range */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Depth Range: {filter.depthRange[0]} - {filter.depthRange[1]}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={availableOptions.depthRange[0]}
                max={availableOptions.depthRange[1]}
                value={filter.depthRange[0]}
                onChange={(e) => {
                  const value = parseInt(e.target.value)
                  updateFilter({ depthRange: [value, Math.max(value, filter.depthRange[1])] })
                }}
                className="flex-1"
              />
              <input
                type="range"
                min={availableOptions.depthRange[0]}
                max={availableOptions.depthRange[1]}
                value={filter.depthRange[1]}
                onChange={(e) => {
                  const value = parseInt(e.target.value)
                  updateFilter({ depthRange: [Math.min(filter.depthRange[0], value), value] })
                }}
                className="flex-1"
              />
            </div>
          </div>

          {/* Amount Range */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Amount Range: {formatAmount(filter.amountRange[0])} - {formatAmount(filter.amountRange[1])}
            </label>
            <div className="flex items-center gap-3">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <input
                type="range"
                min={availableOptions.amountRange[0]}
                max={availableOptions.amountRange[1]}
                value={filter.amountRange[0]}
                onChange={(e) => {
                  const value = parseFloat(e.target.value)
                  updateFilter({ amountRange: [value, Math.max(value, filter.amountRange[1])] })
                }}
                className="flex-1"
                step={availableOptions.amountRange[1] / 100}
              />
            </div>
          </div>

          {/* Tokens */}
          {availableOptions.tokens.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Tokens
              </label>
              <div className="flex flex-wrap gap-2">
                {availableOptions.tokens.slice(0, 10).map(token => (
                  <button
                    key={token}
                    onClick={() => {
                      const newTokens = filter.tokens.includes(token)
                        ? filter.tokens.filter(t => t !== token)
                        : [...filter.tokens, token]
                      updateFilter({ tokens: newTokens })
                    }}
                    className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                      filter.tokens.length === 0 || filter.tokens.includes(token)
                        ? 'bg-green-100 border-green-300 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-300'
                        : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {token}
                  </button>
                ))}
                {availableOptions.tokens.length > 10 && (
                  <span className="px-3 py-1 text-xs text-gray-500">
                    +{availableOptions.tokens.length - 10} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Toggle Options */}
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filter.onlyRootNodes}
                onChange={(e) => updateFilter({ onlyRootNodes: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-900 dark:text-gray-100">
                Show only root nodes
              </span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filter.onlyStoppedNodes}
                onChange={(e) => updateFilter({ onlyStoppedNodes: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-900 dark:text-gray-100">
                Show only stopped nodes
              </span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filter.hideUntaggedNodes}
                onChange={(e) => updateFilter({ hideUntaggedNodes: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-900 dark:text-gray-100">
                Hide untagged nodes
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}