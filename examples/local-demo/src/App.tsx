import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { 
  GraphExplorer,
  GraphExplorerSigma,
  GraphControlPanel,
  ClusterAnalysis,
  RealTimeManager
} from '@trustin/txgraph'
import type { TxNode, TxGraph } from '@trustin/txgraph'
import { SUPPORTED_CHAINS, type ChainName } from '@trustin/txgraph-core'
import { exploreGraph, expandNode } from './api'
import type { DataSourceType } from './api'
import { SimpleExportButton } from './SimpleExportButton'

type Renderer = 'reactflow' | 'sigma'

const SAMPLE_ADDRESSES: Partial<Record<ChainName, string>> = {
  Ethereum: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  Tron: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9',
  BSC: '0x8894e0a0c962cb723c1ef8f1d0de620172a38596',
  Polygon: '0x8894e0a0c962cb723c1ef8f1d0de620172a38596',
  Arbitrum: '0x8894e0a0c962cb723c1ef8f1d0de620172a38596',
}

function detectChain(addr: string): ChainName | null {
  const trimmed = addr.trim()
  if (/^0x[0-9a-fA-F]{40}$/.test(trimmed)) return 'Ethereum'
  if (/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(trimmed)) return 'Tron'
  return null
}

function themeColors(isDark: boolean) {
  return isDark
    ? {
        bg: '#0f172a',
        text: '#e2e8f0',
        heading: '#f1f5f9',
        muted: '#94a3b8',
        dimmed: '#64748b',
        surface: '#1e293b',
        border: '#374151',
        errorBg: 'rgba(239,68,68,0.1)',
        errorBorder: 'rgba(239,68,68,0.3)',
        errorText: '#fca5a5',
        overlayBg: 'rgba(15,23,42,0.85)',
      }
    : {
        bg: '#f8fafc',
        text: '#1e293b',
        heading: '#0f172a',
        muted: '#64748b',
        dimmed: '#94a3b8',
        surface: '#ffffff',
        border: '#cbd5e1',
        errorBg: 'rgba(239,68,68,0.06)',
        errorBorder: 'rgba(239,68,68,0.2)',
        errorText: '#dc2626',
        overlayBg: 'rgba(255,255,255,0.85)',
      }
}

function useQueryParams() {
  const params = new URLSearchParams(window.location.search)
  return {
    address: params.get('address') || '',
    chain: (params.get('chain') as ChainName) || null,
    direction: (params.get('direction') as 'in' | 'out' | 'all') || null,
    token: params.get('token') || '',
    fromDate: params.get('from') || '',
    toDate: params.get('to') || '',
    autoExplore: params.has('address'),
  }
}

export default function App() {
  const qp = useQueryParams()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDark, setIsDark] = useState(true)
  const [address, setAddress] = useState(qp.address)
  const [chain, setChain] = useState<ChainName>(qp.chain as ChainName || (detectChain(qp.address) ?? 'Ethereum'))
  const [direction, setDirection] = useState<'in' | 'out' | 'all'>(qp.direction || 'out')
  const [token, setToken] = useState(qp.token)
  const [fromDate, setFromDate] = useState(qp.fromDate)
  const [toDate, setToDate] = useState(qp.toDate)
  const [dataSource, setDataSource] = useState<DataSourceType>('trustin')
  const [renderer, setRenderer] = useState<Renderer>('reactflow')
  const [graph, setGraph] = useState<TxGraph | null>(null)
  const [loading, setLoading] = useState(false)
  const [expandingNode, setExpandingNode] = useState<string | null>(null)
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<TxNode | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [annotations, setAnnotations] = useState<Record<string, string>>({})
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([])
  const [watchList, setWatchList] = useState<string[]>([])
  const [realTimeEnabled, setRealTimeEnabled] = useState(false)

  // Filtered data for advanced features
  const [filteredNodes, setFilteredNodes] = useState<TxNode[]>([])
  const [filteredEdges, setFilteredEdges] = useState<any[]>([])

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  const c = themeColors(isDark)

  // Initialize filtered data when graph changes
  useEffect(() => {
    if (graph) {
      setFilteredNodes(graph.nodes)
      setFilteredEdges(graph.edges)
      // Add root addresses to watch list for real-time monitoring
      const rootAddresses = graph.nodes.filter(n => n.is_root).map(n => n.address)
      setWatchList(rootAddresses)
    }
  }, [graph])

  // Handle real-time updates
  const handleRealTimeUpdate = useCallback((update: any) => {
    console.log('Real-time update:', update)
    // Handle different types of updates
    switch (update.type) {
      case 'new_transaction':
        // Could extend graph with new transaction
        break
      case 'risk_update':
        // Update node risk levels
        setFilteredNodes(prev => prev.map(node => 
          node.address === update.address 
            ? { ...node, risk_level: update.data?.riskLevel || node.risk_level }
            : node
        ))
        break
    }
  }, [])

  // Handle filter changes from GraphControlPanel
  const handleFilterChange = useCallback((nodes: TxNode[], edges: any[]) => {
    setFilteredNodes(nodes)
    setFilteredEdges(edges)
  }, [])

  // Handle cluster selection
  const handleClusterSelect = useCallback((cluster: any) => {
    if (cluster && graph) {
      const centroidNode = graph.nodes.find(n => n.address === cluster.centroid)
      if (centroidNode) {
        setSelectedNode(centroidNode)
        setSelectedAddress(cluster.centroid)
      }
    }
  }, [graph])

  // Handle node highlighting from cluster analysis
  const handleHighlightNodes = useCallback((addresses: string[]) => {
    setHighlightedNodes(addresses)
  }, [])

  const LARGE_GRAPH_THRESHOLD = 200

  // Auto-switch to Sigma for large graphs
  useEffect(() => {
    if (graph && graph.nodes.length > LARGE_GRAPH_THRESHOLD && renderer === 'reactflow') {
      setRenderer('sigma')
    }
  }, [graph])

  // Handle node selection with enhanced state management
  const handleNodeSelect = useCallback((node: TxNode | null) => {
    setSelectedAddress(node?.address ?? null)
    setSelectedNode(node)
  }, [])

  // Extract unique token symbols from graph edges for dynamic filtering
  const availableTokens = useMemo(() => {
    if (!graph) return []
    const tokens = new Set<string>()
    for (const edge of graph.edges) {
      if (edge.token) tokens.add(edge.token)
    }
    return Array.from(tokens).sort()
  }, [graph])

  // Process nodes with highlighting for cluster analysis
  const processedNodes = useMemo(() => {
    return filteredNodes.map(node => ({
      ...node,
      isHighlighted: highlightedNodes.includes(node.address)
    }))
  }, [filteredNodes, highlightedNodes])

  const handleExplore = useCallback(async () => {
    // Clear query params after first explore to avoid re-triggering
    if (window.location.search) {
      window.history.replaceState({}, '', window.location.pathname)
    }
    const addr = address.trim()
    if (!addr) return
    setLoading(true)
    setError(null)
    setGraph(null)
    setSelectedAddress(null)
    try {
      const data = await exploreGraph({
        address: addr,
        chain,
        direction,
        token: token || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        dataSource,
      })
      setGraph(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [address, chain, direction, token, fromDate, toDate, dataSource])

  // Auto-explore when opened with query params
  const autoExploreRef = React.useRef(qp.autoExplore)
  useEffect(() => {
    if (autoExploreRef.current) {
      autoExploreRef.current = false
      handleExplore()
    }
  }, [handleExplore])

  const handleNodeExpand = useCallback(async (addr: string) => {
    if (!graph) return
    setExpandingNode(addr)
    try {
      const merged = await expandNode(
        {
          address: addr,
          chain,
          direction,
          token: token || undefined,
          maxDepth: 1,
          dataSource,
        },
        graph
      )
      setGraph(merged)
    } catch (e) {
      console.error('Expand failed:', e)
    } finally {
      setExpandingNode(null)
    }
  }, [graph, chain, direction, token, dataSource])

  const handleNodeDelete = useCallback((addr: string) => {
    if (!graph) return
    setGraph({
      nodes: graph.nodes.filter((n) => n.address !== addr),
      edges: graph.edges.filter((e) => e.from !== addr && e.to !== addr),
      stats: graph.stats,
    })
    if (selectedAddress === addr) setSelectedAddress(null)
  }, [graph, selectedAddress])


  const inputStyle: React.CSSProperties = {
    padding: '6px 10px',
    borderRadius: 6,
    border: `1px solid ${c.border}`,
    background: c.surface,
    color: c.text,
    fontSize: 13,
  }

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px',
    borderRadius: 6,
    border: active ? '1px solid #3b82f6' : `1px solid ${c.border}`,
    background: active ? '#3b82f6' : c.surface,
    color: active ? '#fff' : c.muted,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: active ? 600 : 400,
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: c.bg, color: c.text }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}`, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <span className="text-lg font-bold mr-2 bg-blue-500 text-white px-2 py-1 rounded">TxGraph Demo</span>

        {/* Address input */}
        <input
          type="text"
          placeholder="Enter address (or multiple separated by comma)…"
          value={address}
          onChange={(e) => {
            const val = e.target.value
            setAddress(val)
            const detected = detectChain(val)
            // Only auto-switch chain for Tron (unambiguous T prefix).
            // 0x addresses are valid on all EVM chains, so keep current selection.
            if (detected === 'Tron') setChain('Tron')
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleExplore()}
          style={{
            ...inputStyle,
            flex: 1,
            minWidth: 260,
            fontFamily: 'monospace',
          }}
        />

        {/* Chain selector */}
        <select
          value={chain}
          onChange={(e) => {
            setChain(e.target.value as ChainName)
            setAddress('')
          }}
          style={inputStyle}
        >
          {SUPPORTED_CHAINS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Data source */}
        <select
          value={dataSource}
          onChange={(e) => setDataSource(e.target.value as DataSourceType)}
          style={inputStyle}
        >
          <option value="trustin">TrustIn</option>
          <option value="onchain">On-Chain</option>
        </select>

        {/* Direction */}
        <select
          value={direction}
          onChange={(e) => setDirection(e.target.value as 'in' | 'out' | 'all')}
          style={inputStyle}
        >
          <option value="out">Outflow</option>
          <option value="in">Inflow</option>
          <option value="all">All</option>
        </select>

        {/* Token */}
        <select
          value={token}
          onChange={(e) => setToken(e.target.value)}
          style={inputStyle}
        >
          <option value="">All Tokens</option>
          {availableTokens.length > 0
            ? availableTokens.map((t) => (
                <option key={t} value={t.toLowerCase()}>{t}</option>
              ))
            : <>
                <option value="usdt">USDT</option>
                <option value="usdc">USDC</option>
              </>
          }
        </select>

        {/* Date range */}
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          style={{ ...inputStyle, fontSize: 12 }}
        />
        <span style={{ color: c.dimmed, fontSize: 12 }}>to</span>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          style={{ ...inputStyle, fontSize: 12 }}
        />

        {/* Sample button */}
        <button
          onClick={() => setAddress(SAMPLE_ADDRESSES[chain] || '')}
          style={{ ...inputStyle, cursor: 'pointer', fontSize: 12, color: c.muted }}
        >
          Sample
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          style={{
            ...inputStyle,
            cursor: 'pointer',
            fontSize: 14,
            padding: '4px 10px',
            color: c.muted,
          }}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? '\u2600' : '\u263E'}
        </button>

        {/* Explore button */}
        <button
          onClick={handleExplore}
          disabled={loading || !address.trim()}
          style={{
            padding: '6px 16px',
            borderRadius: 6,
            border: 'none',
            background: loading || !address.trim() ? (isDark ? '#374151' : '#cbd5e1') : '#3b82f6',
            color: '#fff',
            cursor: loading || !address.trim() ? 'not-allowed' : 'pointer',
            fontSize: 13,
            fontWeight: 600,
            marginLeft: 'auto',
          }}
        >
          {loading ? 'Exploring\u2026' : 'Explore'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '10px 16px', background: c.errorBg, borderBottom: `1px solid ${c.errorBorder}`, color: c.errorText, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Graph area */}
        <div ref={containerRef} style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {!graph && !loading && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: c.dimmed }}>
            <div style={{ fontSize: 48 }}>🔍</div>
            <div style={{ fontSize: 15 }}>Enter an address and click <strong>Explore</strong></div>
            <div style={{ fontSize: 12, color: c.dimmed }}>
              {dataSource === 'trustin' ? 'Powered by TrustIn API' : `On-Chain via ${chain === 'Tron' ? 'Tronscan' : chain === 'BSC' ? 'BscScan' : chain === 'Polygon' ? 'PolygonScan' : chain === 'Arbitrum' ? 'Arbiscan' : 'Etherscan'}`}
            </div>
          </div>
        )}
        
        {loading && !graph && (
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 20, 
            color: c.text 
          }}>
            {/* Animated loading spinner */}
            <div style={{
              width: 60,
              height: 60,
              border: `4px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            
            <div style={{ textAlign: 'center', gap: 8, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: c.heading }}>
                Exploring Transaction Graph
              </div>
              <div style={{ fontSize: 13, color: c.muted }}>
                Analyzing blockchain transactions for {address.slice(0, 6)}...{address.slice(-4)}
              </div>
              <div style={{ fontSize: 12, color: c.dimmed }}>
                Using {dataSource === 'trustin' ? 'TrustIn API' : `${chain === 'Tron' ? 'Tronscan' : chain === 'BSC' ? 'BscScan' : chain === 'Polygon' ? 'PolygonScan' : chain === 'Arbitrum' ? 'Arbiscan' : 'Etherscan'} API`}
              </div>
            </div>
            
            {/* Progress dots animation */}
            <div style={{ display: 'flex', gap: 6 }}>
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#3b82f6',
                    animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`
                  }}
                />
              ))}
            </div>
          </div>
        )}
        {graph && !loading && (
          <div className="fade-in" style={{ height: '100%', position: 'relative' }}>
            {/* Original graph components without custom wrapper */}
            {renderer === 'reactflow' ? (
              <GraphExplorer
                nodes={processedNodes}
                edges={filteredEdges}
                stats={graph?.stats}
                loading={loading}
                expandingNode={expandingNode}
                selectedAddress={selectedAddress}
                onNodeSelect={handleNodeSelect}
                onNodeExpand={handleNodeExpand}
                onNodeDelete={handleNodeDelete}
              />
            ) : (
              <GraphExplorerSigma
                nodes={processedNodes}
                edges={filteredEdges}
                stats={graph?.stats}
                loading={loading}
                expandingNode={expandingNode}
                selectedAddress={selectedAddress}
                onNodeSelect={handleNodeSelect}
                onNodeExpand={handleNodeExpand}
                onNodeDelete={handleNodeDelete}
              />
            )}

            {/* Direct export button overlay */}
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              zIndex: 10000
            }}>
              <SimpleExportButton 
                nodes={graph.nodes}
                edges={graph.edges}
                stats={graph.stats}
                containerRef={containerRef}
              />
            </div>
          </div>
        )}

        {/* Renderer toggle overlay */}
        {graph && (
          <div className="scale-in" style={{
            position: 'absolute',
            top: 10,
            left: 10,
            display: 'flex',
            gap: 2,
            background: c.overlayBg,
            borderRadius: 6,
            border: `1px solid ${c.border}`,
            padding: 2,
            zIndex: 10,
          }}>
            <button onClick={() => setRenderer('reactflow')} style={btnStyle(renderer === 'reactflow')}>ReactFlow</button>
            <button onClick={() => setRenderer('sigma')} style={btnStyle(renderer === 'sigma')}>Sigma</button>
          </div>
        )}


        </div>

        {/* Advanced features sidebar */}
        {graph && showAdvanced && (
          <div className="fade-in" style={{
            width: '360px',
            borderLeft: `1px solid ${c.border}`,
            background: c.bg,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Control Panel - Search and Filters */}
            <div style={{ flex: '0 0 auto', borderBottom: `1px solid ${c.border}` }}>
              <GraphControlPanel
                nodes={graph.nodes}
                edges={graph.edges}
                stats={graph.stats}
                onNodeSelect={handleNodeSelect}
                onFilterChange={handleFilterChange}
              />
            </div>

            {/* Cluster Analysis */}
            <div style={{ flex: '1 1 0', minHeight: 0, borderBottom: `1px solid ${c.border}` }}>
              <ClusterAnalysis
                nodes={graph.nodes}
                edges={graph.edges}
                onClusterSelect={handleClusterSelect}
                onHighlightNodes={handleHighlightNodes}
              />
            </div>

            {/* Real-time Monitoring */}
            <div style={{ flex: '0 0 200px', overflow: 'auto' }}>
              <RealTimeManager
                watchedAddresses={watchList}
                onUpdate={handleRealTimeUpdate}
                enabled={realTimeEnabled}
              />
            </div>
          </div>
        )}

        {/* Toggle advanced features */}
        {graph && (
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{
              position: 'absolute',
              top: '50%',
              right: showAdvanced ? '360px' : '0px',
              transform: 'translateY(-50%)',
              background: c.surface,
              border: `1px solid ${c.border}`,
              borderRight: showAdvanced ? 'none' : undefined,
              borderLeft: showAdvanced ? undefined : 'none',
              borderRadius: showAdvanced ? '6px 0 0 6px' : '0 6px 6px 0',
              padding: '12px 4px',
              cursor: 'pointer',
              fontSize: 14,
              color: c.muted,
              zIndex: 20,
              transition: 'all 0.3s ease-in-out',
              boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
            }}
            title={showAdvanced ? 'Hide advanced features' : 'Show advanced features'}
          >
            {showAdvanced ? '▶' : '◀'}
          </button>
        )}
      </div>

      {/* Selected node info panel */}
      {selectedAddress && graph && (
        <div className="scale-in" style={{ padding: '10px 16px', borderTop: `1px solid ${c.border}`, background: c.bg, fontSize: 12 }}>
          {(() => {
            const node = graph.nodes.find((n) => n.address === selectedAddress)
            if (!node) return null
            return (
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontFamily: 'monospace', color: c.muted }}>{node.address}</span>
                <span style={{ color: c.dimmed }}>Depth: {node.depth}</span>
                <span style={{ color: node.risk_level === 'high' ? '#ef4444' : node.risk_level === 'medium' ? '#f59e0b' : node.risk_level === 'low' ? '#22c55e' : '#6b7280' }}>
                  Risk: {node.risk_level}
                </span>
                {node.tags.length > 0 && (
                  <span style={{ color: '#818cf8' }}>{node.tags.map((t) => t.name || t.primaryCategory).join(', ')}</span>
                )}
                {node.is_stopped && <span style={{ color: '#f59e0b' }}>{node.stop_reason || 'Stopped'}</span>}
                <input
                  type="text"
                  placeholder="Add note…"
                  value={annotations[node.address] || ''}
                  onChange={(e) => setAnnotations(prev => ({ ...prev, [node.address]: e.target.value }))}
                  style={{ ...inputStyle, fontSize: 11, padding: '2px 8px', minWidth: 120 }}
                />
                <button
                  onClick={() => {
                    setSelectedAddress(null)
                    setSelectedNode(null)
                  }}
                  style={{ marginLeft: 'auto', padding: '2px 8px', borderRadius: 4, border: `1px solid ${c.border}`, background: 'transparent', color: c.dimmed, cursor: 'pointer', fontSize: 11 }}
                >
                  Close
                </button>
                <button
                  onClick={() => setRealTimeEnabled(!realTimeEnabled)}
                  style={{ 
                    padding: '2px 8px', 
                    borderRadius: 4, 
                    border: `1px solid ${c.border}`, 
                    background: realTimeEnabled ? '#3b82f6' : 'transparent', 
                    color: realTimeEnabled ? '#fff' : c.dimmed, 
                    cursor: 'pointer', 
                    fontSize: 11 
                  }}
                >
                  {realTimeEnabled ? '\u23f8 Stop Monitor' : '\u25b6 Monitor'}
                </button>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
