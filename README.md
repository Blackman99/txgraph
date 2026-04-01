<p align="center">
  <img src="docs/public/logo.svg" alt="TxGraph" width="80" />
</p>

<h1 align="center">TxGraph</h1>

<p align="center">Blockchain transaction tracing graph components for React.<br/>Trace, visualize, and analyze on-chain transaction flows.</p>

<p align="center">
  <img src="docs/public/hero-features.svg" alt="TxGraph feature overview" width="800" />
</p>

## [Live Demo](https://width-risk-comliance-database.github.io/txgraph/demo/)

## Features

### 🎯 Core Visualization
- **Risk-scored nodes** — color-coded risk levels (high / medium / low / unknown) with entity tags
- **Path highlighting** — click any node to trace the fund flow from root, dimming unrelated edges
- **Smooth bezier edges** — labeled with transfer amount, token, and timestamp (to the second)
- **Two renderers** — ReactFlow (DOM-based, up to 500 nodes) and Sigma.js (WebGL, 500+ nodes)
- **Dark / Light mode** — auto-detects `document.documentElement.classList` for `dark` class
- **Interactive** — expand nodes on-demand, delete nodes, zoom / pan / fit-view

### 📊 Advanced Analytics
- **Smart search** — intelligent address/hash detection with real-time results
- **Multi-dimensional filtering** — filter by risk, chain, depth, amount, and time ranges
- **Cluster analysis** — AI-powered detection of exchanges, mixers, and suspicious patterns
- **Anomaly detection** — identify unusual transaction patterns and potential risks
- **Real-time monitoring** — WebSocket integration for live transaction updates

### 🔄 Export & Integration
- **Multi-format export** — PNG/SVG images, JSON/CSV data, comprehensive PDF reports
- **Real-time alerts** — push notifications for high-risk transactions
- **AI-agent friendly** — REST API with self-registration, MCP-compatible tool definitions
- **Extensible** — modular architecture with TypeScript support

## Quick Start

```bash
pnpm add @trustin/txgraph
```

```tsx
import { 
  GraphExplorer, 
  GraphControlPanel,
  ClusterAnalysis,
  RealTimeManager 
} from '@trustin/txgraph'

// Basic usage
<GraphExplorer
  nodes={nodes}
  edges={edges}
  stats={stats}
  onNodeSelect={(node) => console.log(node)}
  onNodeExpand={(address) => fetchMore(address)}
  onNodeDelete={(address) => remove(address)}
/>

// Advanced usage with search, filtering, and analytics
<div style={{ display: 'flex', gap: '16px' }}>
  <div style={{ flex: 1 }}>
    <GraphExplorer nodes={nodes} edges={edges} stats={stats} />
  </div>
  <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
    <GraphControlPanel 
      nodes={nodes} 
      edges={edges}
      onNodeSelect={setSelectedNode}
      onFilterChange={setFilteredData}
    />
    <ClusterAnalysis 
      nodes={nodes} 
      edges={edges}
      onClusterSelect={highlightCluster}
    />
    <RealTimeManager 
      wsUrl="wss://api.example.com/ws"
      watchedAddresses={watchList}
      onUpdate={handleRealTimeUpdate}
    />
  </div>
</div>
```

## Project Structure

```
txgraph/
  packages/react/       # @trustin/txgraph — core React components
  examples/local-demo/  # Vite demo app connected to TrustIn API
  docs/                 # VitePress documentation site
```

## Development

```bash
# Install dependencies
pnpm install

# Build the core package
pnpm build

# Run the demo (requires VITE_TRUSTIN_API_KEY in examples/local-demo/.env)
pnpm dev:demo

# Run the docs site
pnpm dev:docs
```

## Four Layers

| Layer | Description | Link |
|-------|-------------|------|
| **Layer 1** | Use TrustIn Online Explorer at [v2.trustin.info](https://v2.trustin.info/explore) | [Guide](https://width-risk-comliance-database.github.io/txgraph/guide/layer1-product) |
| **Layer 2** | AI Agent API — self-register and trace addresses | [Guide](https://width-risk-comliance-database.github.io/txgraph/guide/layer2-agent) |
| **Layer 3** | Run the demo locally with your own API key | [Guide](https://width-risk-comliance-database.github.io/txgraph/guide/layer3-demo) |
| **Layer 4** | Install `@trustin/txgraph` and build your own UI | [Guide](https://width-risk-comliance-database.github.io/txgraph/guide/layer4-component) |

## Documentation

Full documentation: [width-risk-comliance-database.github.io/txgraph](https://width-risk-comliance-database.github.io/txgraph/)

## License

MIT
