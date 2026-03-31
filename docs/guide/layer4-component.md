# 🛠 Build Your Own

Install `@trustin/txgraph` and embed the graph components in your own React application.

## Installation

```bash
# npm
npm install @trustin/txgraph

# pnpm
pnpm add @trustin/txgraph

# yarn
yarn add @trustin/txgraph
```

## Peer Dependencies

```bash
npm install react react-dom
```

## Quick Example

```tsx
import { GraphExplorer } from '@trustin/txgraph'
import type { TxNode, TxEdge } from '@trustin/txgraph'

const nodes: TxNode[] = [
  {
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    depth: 0,
    is_root: true,
    risk_level: 'low',
    tags: [{ name: 'Vitalik Buterin' }],
    is_stopped: false,
  },
  {
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    depth: 1,
    is_root: false,
    risk_level: 'high',
    tags: [{ name: 'Mixer', primaryCategory: 'Money Laundering' }],
    is_stopped: true,
    stop_reason: 'Flagged mixer',
  },
]

const edges: TxEdge[] = [
  {
    from: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    formatted_amount: '1.5 ETH',
    last_timestamp: 1704067200,
    direction: 'out',
  },
]

export function MyGraph() {
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <GraphExplorer
        nodes={nodes}
        edges={edges}
        onNodeSelect={(node) => console.log('Selected:', node?.address)}
        onNodeExpand={(address) => console.log('Expand:', address)}
        onNodeDelete={(address) => console.log('Delete:', address)}
      />
    </div>
  )
}
```

## Using with TrustIn API

```tsx
import { useState, useEffect } from 'react'
import { GraphExplorer } from '@trustin/txgraph'
import type { TxGraph } from '@trustin/txgraph'

async function fetchGraph(address: string): Promise<TxGraph> {
  const res = await fetch('https://api.trustin.info/api/v1/graph_explore', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': process.env.TRUSTIN_API_KEY!,
    },
    body: JSON.stringify({ address, chain: 'Ethereum', direction: 'out', max_depth: 3 }),
  })
  const data = await res.json()
  return data.data
}

export function GraphPage({ address }: { address: string }) {
  const [graph, setGraph] = useState<TxGraph | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchGraph(address)
      .then(setGraph)
      .finally(() => setLoading(false))
  }, [address])

  return (
    <div style={{ height: '600px' }}>
      <GraphExplorer
        nodes={graph?.nodes ?? []}
        edges={graph?.edges ?? []}
        stats={graph?.stats}
        loading={loading}
      />
    </div>
  )
}
```

## Using the Sigma Renderer

For large graphs (500+ nodes), use `GraphExplorerSigma` for WebGL-accelerated rendering:

```tsx
import { GraphExplorerSigma } from '@trustin/txgraph'

// Same props as GraphExplorer
<GraphExplorerSigma
  nodes={nodes}
  edges={edges}
  loading={loading}
  onNodeSelect={handleSelect}
  onNodeExpand={handleExpand}
/>
```

## Dark Mode

Both components auto-detect dark mode via `document.documentElement.classList.contains('dark')`.

They observe class changes in real time, so toggling `dark` on `<html>` updates colors instantly — compatible with Tailwind, next-themes, and any other dark mode system.

For custom colors, use CSS variables with the `--tx-` prefix:

```css
:root {
  --tx-body: #94a3b8;
  --tx-heading: #ffffff;
  --tx-elevated: #1e293b;
  --tx-divider: rgba(51, 65, 85, 0.5);
  --tx-caption: #64748b;
}
```

## Container Sizing

The components fill their container (`width: 100%`, `height: 100%`). Always give the parent a fixed height:

```tsx
// ✅ Works
<div style={{ height: '600px' }}>
  <GraphExplorer nodes={nodes} edges={edges} />
</div>

// ✅ Works (flex)
<div style={{ display: 'flex', flex: 1 }}>
  <GraphExplorer nodes={nodes} edges={edges} />
</div>

// ❌ Will render 0px tall
<div>
  <GraphExplorer nodes={nodes} edges={edges} />
</div>
```

## Next.js Notes

For Next.js App Router, wrap in a client component:

```tsx
'use client'
import { GraphExplorer } from '@trustin/txgraph'
// ... rest of your component
```

Add to `next.config.js` if you encounter transpilation issues:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@trustin/txgraph'],
}
module.exports = nextConfig
```

## Advanced Features

### Search and Filtering

Add search and filtering capabilities to your graph:

```tsx
import { GraphControlPanel, GraphExplorer } from '@trustin/txgraph'
import { useState } from 'react'

export function AdvancedGraph() {
  const [originalNodes, setOriginalNodes] = useState(nodes)
  const [originalEdges, setOriginalEdges] = useState(edges)
  const [filteredNodes, setFilteredNodes] = useState(nodes)
  const [filteredEdges, setFilteredEdges] = useState(edges)
  const [selectedNode, setSelectedNode] = useState(null)

  return (
    <div style={{ display: 'flex', gap: '16px', height: '600px' }}>
      {/* Main graph */}
      <div style={{ flex: 1 }}>
        <GraphExplorer 
          nodes={filteredNodes} 
          edges={filteredEdges}
          selectedAddress={selectedNode?.address}
          onNodeSelect={setSelectedNode}
        />
      </div>
      
      {/* Control panel */}
      <div style={{ width: '320px' }}>
        <GraphControlPanel
          nodes={originalNodes}
          edges={originalEdges}
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

### Export Functionality

Add export capabilities to save graphs in multiple formats:

```tsx
import { ExportToolbar, GraphExplorer } from '@trustin/txgraph'
import { useRef } from 'react'

export function ExportableGraph() {
  const containerRef = useRef(null)

  return (
    <div ref={containerRef} style={{ height: '600px', position: 'relative' }}>
      <GraphExplorer nodes={nodes} edges={edges} />
      
      {/* Export toolbar in top-right */}
      <div style={{ position: 'absolute', top: 16, right: 16 }}>
        <ExportToolbar
          nodes={nodes}
          edges={edges}
          stats={stats}
          containerRef={containerRef}
        />
      </div>
    </div>
  )
}
```

### Cluster Analysis

Detect patterns and anomalies in your transaction graphs:

```tsx
import { ClusterAnalysis, GraphExplorer } from '@trustin/txgraph'
import { useState } from 'react'

export function AnalyticalGraph() {
  const [highlightedNodes, setHighlightedNodes] = useState([])
  const [selectedCluster, setSelectedCluster] = useState(null)

  const processedNodes = nodes.map(node => ({
    ...node,
    // Highlight nodes based on cluster selection or anomalies
    isHighlighted: highlightedNodes.includes(node.address)
  }))

  return (
    <div style={{ display: 'flex', gap: '16px', height: '600px' }}>
      <div style={{ flex: 1 }}>
        <GraphExplorer 
          nodes={processedNodes} 
          edges={edges}
          selectedAddress={selectedCluster?.centroid}
        />
      </div>
      
      <div style={{ width: '320px' }}>
        <ClusterAnalysis
          nodes={nodes}
          edges={edges}
          onClusterSelect={setSelectedCluster}
          onHighlightNodes={setHighlightedNodes}
        />
      </div>
    </div>
  )
}
```

### Real-Time Monitoring

Monitor live transaction updates:

```tsx
import { RealTimeManager, GraphExplorer } from '@trustin/txgraph'
import { useState, useCallback } from 'react'

export function LiveGraph() {
  const [nodes, setNodes] = useState(initialNodes)
  const [edges, setEdges] = useState(initialEdges)
  const [watchList, setWatchList] = useState([
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
  ])

  const handleRealTimeUpdate = useCallback((update) => {
    switch (update.type) {
      case 'new_transaction':
        // Add new transaction to graph
        console.log('New transaction:', update.data)
        break
      case 'risk_update':
        // Update node risk level
        setNodes(prev => prev.map(node => 
          node.address === update.address 
            ? { ...node, risk_level: update.data.riskLevel }
            : node
        ))
        break
    }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '600px' }}>
      <div style={{ flex: 1 }}>
        <GraphExplorer nodes={nodes} edges={edges} />
      </div>
      
      <div style={{ height: '200px', borderTop: '1px solid #e5e7eb' }}>
        <RealTimeManager
          wsUrl="wss://api.example.com/ws"
          watchedAddresses={watchList}
          onUpdate={handleRealTimeUpdate}
        />
      </div>
    </div>
  )
}
```

### Complete Integration Example

Combine all features for a comprehensive transaction analysis dashboard:

```tsx
import { 
  GraphExplorer, GraphControlPanel, ClusterAnalysis, 
  RealTimeManager, ExportToolbar 
} from '@trustin/txgraph'
import { useState, useRef, useCallback } from 'react'

export function ComprehensiveDashboard() {
  const containerRef = useRef(null)
  const [originalData, setOriginalData] = useState({ nodes, edges, stats })
  const [filteredData, setFilteredData] = useState({ nodes, edges })
  const [selectedNode, setSelectedNode] = useState(null)
  const [highlightedNodes, setHighlightedNodes] = useState([])

  const handleRealTimeUpdate = useCallback((update) => {
    // Handle real-time updates
    if (update.type === 'new_transaction') {
      // Update graph data
      console.log('Live update:', update)
    }
  }, [])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px', height: '100vh', padding: '16px' }}>
      {/* Main graph area */}
      <div ref={containerRef} style={{ position: 'relative', minHeight: 0 }}>
        <GraphExplorer 
          nodes={filteredData.nodes}
          edges={filteredData.edges}
          stats={originalData.stats}
          selectedAddress={selectedNode?.address}
          onNodeSelect={setSelectedNode}
        />
        
        {/* Export toolbar */}
        <div style={{ position: 'absolute', top: 16, right: 16 }}>
          <ExportToolbar
            nodes={originalData.nodes}
            edges={originalData.edges}
            stats={originalData.stats}
            containerRef={containerRef}
          />
        </div>
      </div>

      {/* Control sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 0 }}>
        {/* Search and filter controls */}
        <GraphControlPanel
          nodes={originalData.nodes}
          edges={originalData.edges}
          stats={originalData.stats}
          onNodeSelect={setSelectedNode}
          onFilterChange={(nodes, edges) => setFilteredData({ nodes, edges })}
        />

        {/* Cluster analysis */}
        <ClusterAnalysis
          nodes={originalData.nodes}
          edges={originalData.edges}
          onClusterSelect={(cluster) => {
            if (cluster) {
              setSelectedNode(originalData.nodes.find(n => n.address === cluster.centroid))
            }
          }}
          onHighlightNodes={setHighlightedNodes}
        />

        {/* Real-time monitoring */}
        <RealTimeManager
          watchedAddresses={originalData.nodes.filter(n => n.is_root).map(n => n.address)}
          onUpdate={handleRealTimeUpdate}
        />
      </div>
    </div>
  )
}
```

## TypeScript

Full TypeScript support is included. See [Types Reference](/api/types) for all exported interfaces.

## Performance Tips

### Large Graphs
- Use `GraphExplorerSigma` for 500+ nodes (WebGL acceleration)
- Implement virtualization for very large datasets
- Consider data pagination or streaming for massive graphs

### Optimization
- Memoize expensive computations with `useMemo`
- Debounce search and filter inputs
- Use `React.memo` for static components
- Implement proper cleanup for WebSocket connections

### Memory Management
- Clean up WebSocket connections on unmount
- Avoid storing large graphs in React state unnecessarily
- Use refs for DOM-heavy operations
