# 📋 Examples

Complete examples demonstrating different TxGraph use cases and integration patterns.

## Basic Graph Visualization

Simple transaction graph with minimal setup:

```tsx
import { GraphExplorer } from '@trustin/txgraph'
import type { TxNode, TxEdge } from '@trustin/txgraph'

const nodes: TxNode[] = [
  {
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    depth: 0,
    is_root: true,
    risk_level: 'low',
    tags: [{ 
      name: 'Vitalik Buterin',
      primary_category: 'Individual',
      secondary_category: 'Public Figure'
    }],
    total_neighbors: 1,
    visible_neighbors: 1,
    is_stopped: false,
    chain: 'Ethereum'
  },
  {
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    depth: 1,
    is_root: false,
    risk_level: 'high',
    risk_score: 85,
    tags: [{ 
      name: 'Tornado Cash',
      primary_category: 'Mixer',
      secondary_category: 'Privacy Protocol'
    }],
    total_neighbors: 2,
    visible_neighbors: 1,
    is_stopped: true,
    stop_reason: 'Sanctioned entity',
    chain: 'Ethereum'
  }
]

const edges: TxEdge[] = [
  {
    from: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    direction: 'out',
    amount: '1500000000000000000',
    formatted_amount: '1.5 ETH',
    last_timestamp: 1704067200,
    tx_count: 1,
    token: 'ETH'
  }
]

export function BasicExample() {
  const handleNodeSelect = (node: TxNode | null) => {
    if (node) {
      console.log(`Selected: ${node.address}`)
      console.log(`Risk: ${node.risk_level}`)
    } else {
      console.log('Deselected')
    }
  }

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <GraphExplorer
        nodes={nodes}
        edges={edges}
        onNodeSelect={handleNodeSelect}
        onNodeExpand={(address) => console.log('Expand:', address)}
        onNodeDelete={(address) => console.log('Delete:', address)}
      />
    </div>
  )
}
```

## Search and Filter Dashboard

Interactive dashboard with search, filtering, and export capabilities:

```tsx
import { 
  GraphExplorer, 
  GraphControlPanel, 
  ExportToolbar 
} from '@trustin/txgraph'
import { useState, useRef } from 'react'

export function SearchFilterDashboard() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [originalNodes, setOriginalNodes] = useState(nodes)
  const [originalEdges, setOriginalEdges] = useState(edges)
  const [filteredNodes, setFilteredNodes] = useState(nodes)
  const [filteredEdges, setFilteredEdges] = useState(edges)
  const [selectedNode, setSelectedNode] = useState<TxNode | null>(null)

  const stats = {
    total_nodes: originalNodes.length,
    total_edges: originalEdges.length,
    max_depth_reached: Math.max(...originalNodes.map(n => n.depth)),
    stopped_nodes: originalNodes.filter(n => n.is_stopped).length
  }

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr 320px', 
      gap: '16px', 
      height: '100vh',
      padding: '16px'
    }}>
      {/* Main graph area */}
      <div 
        ref={containerRef} 
        style={{ position: 'relative', backgroundColor: '#f9fafb', borderRadius: '8px' }}
      >
        <GraphExplorer
          nodes={filteredNodes}
          edges={filteredEdges}
          stats={stats}
          selectedAddress={selectedNode?.address}
          onNodeSelect={setSelectedNode}
        />
        
        {/* Export toolbar */}
        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
          <ExportToolbar
            nodes={originalNodes}
            edges={originalEdges}
            stats={stats}
            containerRef={containerRef}
          />
        </div>
        
        {/* Selection info */}
        {selectedNode && (
          <div style={{
            position: 'absolute',
            top: 16,
            left: 16,
            background: 'white',
            padding: '12px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            maxWidth: '300px'
          }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
              Selected Address
            </h3>
            <p style={{ margin: '4px 0', fontFamily: 'monospace', fontSize: '12px' }}>
              {selectedNode.address.slice(0, 10)}...{selectedNode.address.slice(-8)}
            </p>
            <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
              <span style={{
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: selectedNode.risk_level === 'high' ? '#fef2f2' : 
                                selectedNode.risk_level === 'medium' ? '#fffbeb' :
                                selectedNode.risk_level === 'low' ? '#f0fdf4' : '#f9fafb',
                color: selectedNode.risk_level === 'high' ? '#dc2626' :
                       selectedNode.risk_level === 'medium' ? '#d97706' :
                       selectedNode.risk_level === 'low' ? '#16a34a' : '#6b7280'
              }}>
                {selectedNode.risk_level.toUpperCase()}
              </span>
              <span style={{ color: '#6b7280' }}>
                Depth: {selectedNode.depth}
              </span>
            </div>
            {selectedNode.tags.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                  Tags:
                </div>
                {selectedNode.tags.map((tag, i) => (
                  <span
                    key={i}
                    style={{
                      display: 'inline-block',
                      padding: '2px 6px',
                      margin: '2px 2px 2px 0',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '4px',
                      fontSize: '11px',
                      color: '#374151'
                    }}
                  >
                    {tag.name || tag.primary_category}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Control panel */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px',
        overflow: 'hidden'
      }}>
        <GraphControlPanel
          nodes={originalNodes}
          edges={originalEdges}
          stats={stats}
          onNodeSelect={setSelectedNode}
          onFilterChange={(nodes, edges) => {
            setFilteredNodes(nodes)
            setFilteredEdges(edges)
          }}
        />
      </div>
    </div>
  )
}
```

## Cluster Analysis Example

Advanced pattern detection and anomaly analysis:

```tsx
import { 
  GraphExplorer, 
  ClusterAnalysis, 
  SearchBar 
} from '@trustin/txgraph'
import { useState, useEffect } from 'react'

export function ClusterAnalysisExample() {
  const [nodes, setNodes] = useState(sampleNodes)
  const [edges, setEdges] = useState(sampleEdges)
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([])
  const [selectedCluster, setSelectedCluster] = useState(null)
  const [searchHighlight, setSearchHighlight] = useState<string[]>([])

  // Combine highlights from cluster analysis and search
  const processedNodes = nodes.map(node => ({
    ...node,
    // Add visual indicators for highlights
    className: [
      highlightedNodes.includes(node.address) && 'cluster-highlight',
      searchHighlight.includes(node.address) && 'search-highlight'
    ].filter(Boolean).join(' ')
  }))

  const handleSearchSelect = (result) => {
    if (result.type === 'node') {
      setSearchHighlight([result.item.address])
      // Auto-scroll to node or similar behavior
    } else {
      // Handle edge selection
      setSearchHighlight([result.item.from, result.item.to])
    }
  }

  const handleClusterSelect = (cluster) => {
    setSelectedCluster(cluster)
    if (cluster) {
      setHighlightedNodes(cluster.nodes.map(n => n.address))
    } else {
      setHighlightedNodes([])
    }
  }

  const clearHighlights = () => {
    setHighlightedNodes([])
    setSearchHighlight([])
    setSelectedCluster(null)
  }

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr 360px', 
      gap: '20px',
      height: '100vh',
      padding: '20px'
    }}>
      {/* Main visualization */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Search bar */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <SearchBar
              nodes={nodes}
              edges={edges}
              onResultSelect={handleSearchSelect}
              onClear={() => setSearchHighlight([])}
              placeholder="Search addresses, risk levels, or entity tags..."
            />
          </div>
          <button 
            onClick={clearHighlights}
            style={{
              padding: '8px 16px',
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Clear Highlights
          </button>
        </div>

        {/* Graph */}
        <div style={{ flex: 1, background: '#fafafa', borderRadius: '8px' }}>
          <GraphExplorer
            nodes={processedNodes}
            edges={edges}
            selectedAddress={selectedCluster?.centroid}
          />
        </div>

        {/* Cluster info */}
        {selectedCluster && (
          <div style={{
            background: 'white',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>
              {selectedCluster.type.charAt(0).toUpperCase() + selectedCluster.type.slice(1)} Cluster
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', fontSize: '14px' }}>
              <div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>Nodes</div>
                <div style={{ fontWeight: 600 }}>{selectedCluster.nodes.length}</div>
              </div>
              <div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>Risk</div>
                <div style={{ 
                  fontWeight: 600,
                  color: selectedCluster.riskLevel === 'high' ? '#dc2626' :
                         selectedCluster.riskLevel === 'medium' ? '#d97706' :
                         selectedCluster.riskLevel === 'low' ? '#16a34a' : '#6b7280'
                }}>
                  {selectedCluster.riskLevel.toUpperCase()}
                </div>
              </div>
              <div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>Total Value</div>
                <div style={{ fontWeight: 600 }}>${selectedCluster.totalValue.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>Confidence</div>
                <div style={{ fontWeight: 600 }}>{(selectedCluster.confidence * 100).toFixed(0)}%</div>
              </div>
            </div>
            <div style={{ marginTop: '12px', fontSize: '13px', color: '#6b7280' }}>
              Centroid: <code>{selectedCluster.centroid.slice(0, 10)}...{selectedCluster.centroid.slice(-8)}</code>
            </div>
          </div>
        )}
      </div>

      {/* Analysis panel */}
      <div>
        <ClusterAnalysis
          nodes={nodes}
          edges={edges}
          onClusterSelect={handleClusterSelect}
          onHighlightNodes={setHighlightedNodes}
        />
      </div>
    </div>
  )
}
```

## Real-Time Monitoring Dashboard

Live transaction monitoring with WebSocket integration:

```tsx
import { 
  GraphExplorer,
  RealTimeManager,
  FilterPanel
} from '@trustin/txgraph'
import { useState, useCallback, useEffect } from 'react'

export function RealTimeMonitoringExample() {
  const [nodes, setNodes] = useState(initialNodes)
  const [edges, setEdges] = useState(initialEdges)
  const [watchList, setWatchList] = useState([
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
  ])
  const [recentUpdates, setRecentUpdates] = useState([])
  const [alertMode, setAlertMode] = useState(true)

  const handleRealTimeUpdate = useCallback((update) => {
    // Add to recent updates list
    setRecentUpdates(prev => [
      { ...update, id: Date.now() },
      ...prev.slice(0, 99) // Keep last 100 updates
    ])

    switch (update.type) {
      case 'new_transaction':
        console.log('New transaction detected:', update.data)
        
        // Show alert for high-value transactions
        if (alertMode && parseFloat(update.data.amount) > 1000000) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('High Value Transaction', {
              body: `${update.data.formatted_amount} from ${update.address?.slice(0, 10)}...`,
              icon: '⚠️'
            })
          }
        }
        
        // Potentially add new edges to graph
        // This would require implementing proper graph update logic
        break

      case 'risk_update':
        console.log('Risk level updated:', update.address, update.data.riskLevel)
        
        // Update node risk levels
        setNodes(prev => prev.map(node => 
          node.address === update.address 
            ? { ...node, risk_level: update.data.riskLevel, risk_score: update.data.riskScore }
            : node
        ))
        
        // Alert on new high-risk addresses
        if (alertMode && update.data.riskLevel === 'high') {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('High Risk Alert', {
              body: `Address ${update.address?.slice(0, 10)}... flagged as high risk`,
              icon: '🚨'
            })
          }
        }
        break

      case 'graph_update':
        console.log('Graph structure updated')
        // Handle graph structure changes
        if (update.data.nodes) {
          setNodes(prev => [...prev, ...update.data.nodes])
        }
        if (update.data.edges) {
          setEdges(prev => [...prev, ...update.data.edges])
        }
        break
    }
  }, [alertMode])

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  return (
    <div style={{
      display: 'grid',
      gridTemplateRows: '1fr auto',
      gap: '16px',
      height: '100vh',
      padding: '16px'
    }}>
      {/* Main graph area */}
      <div style={{ display: 'flex', gap: '16px', minHeight: 0 }}>
        <div style={{ flex: 1, background: '#f8fafc', borderRadius: '8px' }}>
          <GraphExplorer nodes={nodes} edges={edges} />
        </div>
        
        {/* Monitoring sidebar */}
        <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <RealTimeManager
            wsUrl={process.env.REACT_APP_WS_URL || 'wss://api.example.com/ws'}
            watchedAddresses={watchList}
            onUpdate={handleRealTimeUpdate}
          />
          
          {/* Watch list management */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
              Watch List ({watchList.length})
            </h3>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {watchList.map((address, index) => (
                <div
                  key={address}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 0',
                    borderBottom: index < watchList.length - 1 ? '1px solid #f3f4f6' : 'none'
                  }}
                >
                  <code style={{ fontSize: '11px', color: '#6b7280' }}>
                    {address.slice(0, 8)}...{address.slice(-6)}
                  </code>
                  <button
                    onClick={() => setWatchList(prev => prev.filter(a => a !== address))}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                <input
                  type="checkbox"
                  checked={alertMode}
                  onChange={(e) => setAlertMode(e.target.checked)}
                />
                Browser alerts
              </label>
            </div>
          </div>

          {/* Recent updates */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '12px',
            flex: 1,
            minHeight: 0
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
              Recent Updates ({recentUpdates.length})
            </h3>
            <div style={{ maxHeight: '100%', overflowY: 'auto' }}>
              {recentUpdates.length === 0 ? (
                <div style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                  No updates yet
                </div>
              ) : (
                recentUpdates.slice(0, 20).map((update, index) => (
                  <div
                    key={update.id}
                    style={{
                      padding: '8px 0',
                      borderBottom: index < Math.min(recentUpdates.length, 20) - 1 ? '1px solid #f3f4f6' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: update.type === 'new_transaction' ? '#059669' :
                               update.type === 'risk_update' ? '#dc2626' :
                               '#6b7280'
                      }}>
                        {update.type.replace('_', ' ').toUpperCase()}
                      </span>
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                        {new Date(update.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {update.address && (
                      <div style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'monospace', marginTop: '2px' }}>
                        {update.address.slice(0, 10)}...{update.address.slice(-8)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## Large Graph Performance Example

Optimized handling for large datasets with the Sigma.js renderer:

```tsx
import { 
  GraphExplorerSigma, 
  FilterPanel,
  ExportToolbar 
} from '@trustin/txgraph'
import { useState, useMemo, useRef } from 'react'

export function LargeGraphExample() {
  const containerRef = useRef(null)
  const [allNodes] = useState(generateLargeDataset(1000)) // 1000 nodes
  const [allEdges] = useState(generateEdgesForNodes(allNodes))
  const [filter, setFilter] = useState({
    riskLevels: ['high', 'medium', 'low', 'unknown'],
    chains: [],
    depthRange: [0, 10],
    amountRange: [0, Number.MAX_SAFE_INTEGER],
    dateRange: [null, null],
    tokens: [],
    onlyRootNodes: false,
    onlyStoppedNodes: false,
    hideUntaggedNodes: false
  })

  // Apply filters with useMemo for performance
  const { filteredNodes, filteredEdges } = useMemo(() => {
    console.log('Filtering large dataset...')
    const start = performance.now()
    
    // Filter nodes
    const nodes = allNodes.filter(node => {
      if (!filter.riskLevels.includes(node.risk_level)) return false
      if (filter.chains.length > 0 && node.chain && !filter.chains.includes(node.chain)) return false
      if (node.depth < filter.depthRange[0] || node.depth > filter.depthRange[1]) return false
      if (filter.onlyRootNodes && !node.is_root) return false
      if (filter.onlyStoppedNodes && !node.is_stopped) return false
      if (filter.hideUntaggedNodes && node.tags.length === 0) return false
      return true
    })

    // Filter edges based on remaining nodes
    const nodeAddresses = new Set(nodes.map(n => n.address))
    const edges = allEdges.filter(edge => 
      nodeAddresses.has(edge.from) && nodeAddresses.has(edge.to)
    )

    const elapsed = performance.now() - start
    console.log(`Filtered ${allNodes.length} nodes → ${nodes.length} in ${elapsed.toFixed(2)}ms`)

    return { filteredNodes: nodes, filteredEdges: edges }
  }, [allNodes, allEdges, filter])

  const stats = useMemo(() => ({
    total_nodes: filteredNodes.length,
    total_edges: filteredEdges.length,
    max_depth_reached: Math.max(...filteredNodes.map(n => n.depth)),
    stopped_nodes: filteredNodes.filter(n => n.is_stopped).length
  }), [filteredNodes, filteredEdges])

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 280px',
      gap: '16px',
      height: '100vh',
      padding: '16px'
    }}>
      {/* Performance-optimized graph */}
      <div ref={containerRef} style={{ position: 'relative' }}>
        {/* Performance indicator */}
        <div style={{
          position: 'absolute',
          top: 16,
          left: 16,
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          zIndex: 10
        }}>
          {filteredNodes.length.toLocaleString()} nodes • {filteredEdges.length.toLocaleString()} edges
          <br />
          Renderer: {filteredNodes.length > 500 ? 'Sigma.js (WebGL)' : 'ReactFlow (DOM)'}
        </div>

        <ExportToolbar
          nodes={filteredNodes}
          edges={filteredEdges}
          stats={stats}
          containerRef={containerRef}
          className="absolute top-16 right-16 z-10"
        />

        {/* Use Sigma for large graphs, ReactFlow for smaller ones */}
        <GraphExplorerSigma
          nodes={filteredNodes}
          edges={filteredEdges}
          stats={stats}
          onNodeSelect={(node) => console.log('Selected large graph node:', node?.address)}
        />
      </div>

      {/* Control panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <FilterPanel
          nodes={allNodes}
          edges={allEdges}
          filter={filter}
          onChange={setFilter}
        />

        {/* Performance tips */}
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '8px',
          padding: '12px'
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#0369a1' }}>
            Performance Tips
          </h4>
          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#0369a1' }}>
            <li>Filtering {allNodes.length.toLocaleString()} total nodes</li>
            <li>WebGL renderer active for large datasets</li>
            <li>Use filters to reduce visible nodes</li>
            <li>Consider pagination for massive datasets</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// Helper functions for generating test data
function generateLargeDataset(count: number): TxNode[] {
  const nodes: TxNode[] = []
  const riskLevels = ['high', 'medium', 'low', 'unknown']
  const chains = ['Ethereum', 'Bitcoin', 'Tron', 'BSC', 'Polygon']
  
  for (let i = 0; i < count; i++) {
    nodes.push({
      address: `0x${Math.random().toString(16).substring(2).padStart(40, '0')}`,
      depth: Math.floor(Math.random() * 6),
      is_root: i === 0,
      risk_level: riskLevels[Math.floor(Math.random() * riskLevels.length)],
      risk_score: Math.floor(Math.random() * 100),
      tags: Math.random() > 0.7 ? [{
        primary_category: ['Exchange', 'DeFi', 'Mixer', 'Bridge'][Math.floor(Math.random() * 4)],
        name: `Entity ${i}`
      }] : [],
      total_neighbors: Math.floor(Math.random() * 10) + 1,
      visible_neighbors: Math.floor(Math.random() * 5) + 1,
      is_stopped: Math.random() > 0.8,
      chain: chains[Math.floor(Math.random() * chains.length)]
    })
  }
  
  return nodes
}

function generateEdgesForNodes(nodes: TxNode[]): TxEdge[] {
  const edges: TxEdge[] = []
  
  for (let i = 1; i < nodes.length; i++) {
    // Connect each node to a random earlier node
    const targetIndex = Math.floor(Math.random() * i)
    
    edges.push({
      from: nodes[targetIndex].address,
      to: nodes[i].address,
      direction: 'out',
      amount: (Math.random() * 1000000).toFixed(0),
      formatted_amount: `${(Math.random() * 1000).toFixed(2)} ETH`,
      last_timestamp: Date.now() / 1000 - Math.random() * 86400 * 30, // Last 30 days
      tx_count: Math.floor(Math.random() * 10) + 1,
      token: ['ETH', 'USDT', 'USDC', 'BTC'][Math.floor(Math.random() * 4)]
    })
  }
  
  return edges
}
```

These examples demonstrate the full capabilities of TxGraph across different use cases, from simple visualization to enterprise-grade monitoring dashboards.