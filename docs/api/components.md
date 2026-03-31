# Components

## `GraphExplorer`

ReactFlow-based interactive graph renderer. Best for small-to-medium graphs (up to ~500 nodes).

```tsx
import { GraphExplorer } from '@trustin/txgraph'
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `nodes` | `TxNode[]` | required | Array of graph nodes |
| `edges` | `TxEdge[]` | required | Array of graph edges |
| `stats` | `TxGraphStats` | — | Optional stats (shown in panel) |
| `loading` | `boolean` | `false` | Show full-screen loading overlay |
| `expandingNode` | `string \| null` | `null` | Address of node currently being expanded (shows spinner) |
| `selectedAddress` | `string \| null` | `null` | Highlight the path from root to this address |
| `onNodeSelect` | `(node: TxNode \| null) => void` | — | Called when user clicks a node (or background) |
| `onNodeExpand` | `(address: string) => void` | — | Called when user clicks the **+** expand button |
| `onNodeDelete` | `(address: string) => void` | — | Called when user clicks the **✕** delete button |

### Layout

The graph uses **Dagre** for automatic left-to-right hierarchical layout. Nodes are arranged by transaction depth. Layout is recomputed whenever `nodes` or `edges` change.

### Selection & Path Highlighting

When `selectedAddress` is set, the component:
1. Finds all paths from the root node to the selected address (DFS with backtracking)
2. Highlights nodes and edges on any path
3. Dims all other nodes and edges (opacity 0.25)

### Node Appearance

| State | Visual |
|-------|--------|
| Root node | Blue border + glow |
| High risk | Red border + red background |
| Medium risk | Yellow border + yellow background |
| Low risk | Green border + green background |
| Unknown risk | Gray border |
| Stopped node | Dashed border + warning icon |
| Selected | Blue glow ring |
| Dimmed (not on path) | 25% opacity |
| Expanding | Spinner overlay |

---

## `GraphExplorerSigma`

Sigma.js + WebGL-based renderer. Best for large graphs (500+ nodes). Uses canvas for labels, WebGL for nodes/edges.

```tsx
import { GraphExplorerSigma } from '@trustin/txgraph'
```

### Props

Same props as `GraphExplorer` — both components implement `GraphExplorerProps`.

### Interactions

| Action | Result |
|--------|--------|
| Click node | `onNodeSelect(node)` |
| Click background | `onNodeSelect(null)` |
| Double-click node | `onNodeExpand(address)` |
| Right-click node | `onNodeDelete(address)` |
| Scroll | Zoom in/out |
| Drag | Pan |

### Built-in Controls

The Sigma renderer includes floating controls:
- **+** / **−** — Zoom in/out
- **⊡** — Fit all nodes in view

### Layout

Uses a custom depth-based left-to-right layout:
- X position = `depth × 3.5` (graph coordinates)
- Y position = evenly spaced within each depth level
- No overlap guaranteed

### Camera

On mount, the camera auto-fits to show all nodes at a comfortable ~38px radius. The camera ratio adapts to graph size.

---

## `ExportToolbar`

Export functionality toolbar with support for multiple formats (PNG, SVG, JSON, CSV, PDF).

```tsx
import { ExportToolbar } from '@trustin/txgraph'
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `nodes` | `TxNode[]` | required | Array of graph nodes |
| `edges` | `TxEdge[]` | required | Array of graph edges |
| `stats` | `TxGraphStats \| null` | — | Optional stats for export |
| `containerRef` | `React.RefObject<HTMLElement>` | required | Reference to graph container for image export |
| `className` | `string` | `''` | Additional CSS classes |

### Export Formats

| Format | Description | Use Case |
|--------|-------------|----------|
| **PNG** | High-quality raster image (html2canvas) | Presentations, reports |
| **SVG** | Scalable vector graphics | Print, high-resolution displays |
| **JSON** | Complete graph data with metadata | Data backup, API integration |
| **CSV** | Tabular format (nodes + edges) | Excel analysis, databases |
| **PDF** | Comprehensive report with graph + stats | Executive reports, compliance |

---

## `SearchBar`

Intelligent search component with address/hash detection and real-time results.

```tsx
import { SearchBar } from '@trustin/txgraph'
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `nodes` | `TxNode[]` | required | Array of nodes to search |
| `edges` | `TxEdge[]` | required | Array of edges to search |
| `onResultSelect` | `(result: SearchResult) => void` | — | Called when user selects a result |
| `onClear` | `() => void` | — | Called when search is cleared |
| `placeholder` | `string` | `"Search addresses..."` | Input placeholder text |
| `className` | `string` | `''` | Additional CSS classes |

### Search Capabilities

- **Address detection**: Ethereum (0x...) and Tron (T...) addresses
- **Transaction hash detection**: 64-character hex strings
- **Risk level search**: "high", "medium", "low", "unknown"
- **Entity tag search**: "exchange", "defi", "mixer", etc.
- **Token search**: "USDT", "ETH", "BTC", etc.
- **Amount search**: "100 USDT", "1.5 ETH", etc.

---

## `FilterPanel`

Advanced filtering panel with multi-dimensional controls.

```tsx
import { FilterPanel } from '@trustin/txgraph'
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `nodes` | `TxNode[]` | required | Array of nodes for filter options |
| `edges` | `TxEdge[]` | required | Array of edges for filter options |
| `filter` | `FilterConfig` | required | Current filter configuration |
| `onChange` | `(filter: FilterConfig) => void` | required | Called when filters change |
| `className` | `string` | `''` | Additional CSS classes |

### Filter Options

| Filter | Type | Description |
|--------|------|-------------|
| **Risk Levels** | `string[]` | Filter by risk: high, medium, low, unknown |
| **Chains** | `string[]` | Filter by blockchain networks |
| **Depth Range** | `[number, number]` | Filter by transaction depth (0-N) |
| **Amount Range** | `[number, number]` | Filter by transaction amounts |
| **Date Range** | `[Date \| null, Date \| null]` | Filter by transaction timestamps |
| **Tokens** | `string[]` | Filter by token types |
| **Only Root Nodes** | `boolean` | Show only root/starting nodes |
| **Only Stopped Nodes** | `boolean` | Show only exploration-stopped nodes |
| **Hide Untagged** | `boolean` | Hide nodes without entity tags |

---

## `GraphControlPanel`

Comprehensive control panel combining search and filtering functionality.

```tsx
import { GraphControlPanel } from '@trustin/txgraph'
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `nodes` | `TxNode[]` | required | Array of graph nodes |
| `edges` | `TxEdge[]` | required | Array of graph edges |
| `stats` | `TxGraphStats \| null` | — | Optional graph statistics |
| `onNodeSelect` | `(node: TxNode \| null) => void` | — | Called when user selects a node |
| `onFilterChange` | `(nodes: TxNode[], edges: TxEdge[]) => void` | — | Called when filtered data changes |
| `className` | `string` | `''` | Additional CSS classes |

### Features

- Integrated search and filtering
- Real-time filter statistics
- Selected node information panel
- Automatic data synchronization

---

## `ClusterAnalysis`

AI-powered clustering analysis for detecting related addresses and suspicious patterns.

```tsx
import { ClusterAnalysis } from '@trustin/txgraph'
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `nodes` | `TxNode[]` | required | Array of nodes to analyze |
| `edges` | `TxEdge[]` | required | Array of edges to analyze |
| `onClusterSelect` | `(cluster: Cluster \| null) => void` | — | Called when user selects a cluster |
| `onHighlightNodes` | `(addresses: string[]) => void` | — | Called to highlight specific nodes |
| `className` | `string` | `''` | Additional CSS classes |

### Cluster Types

| Type | Description | Detection Method |
|------|-------------|------------------|
| **Exchange** | Trading platform addresses | Tag analysis + transaction patterns |
| **Mixer** | Privacy/tumbling services | High fan-in/fan-out patterns |
| **Pool** | Liquidity pools, staking | DeFi tags + concentrated activity |
| **Bridge** | Cross-chain bridges | Bridge tags + multi-chain activity |
| **Unknown** | Unclassified clusters | Pattern-based grouping only |

### Anomaly Detection

| Anomaly Type | Description |
|--------------|-------------|
| **Rapid Succession** | Many transactions in short time periods |
| **Round Amounts** | Frequent use of round numbers (potential structuring) |
| **Concentration** | Collection/distribution patterns |
| **Unusual Pattern** | Statistical outliers in behavior |

---

## `RealTimeManager`

WebSocket-based real-time transaction monitoring and notification system.

```tsx
import { RealTimeManager } from '@trustin/txgraph'
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `wsUrl` | `string` | `'wss://api.trustin.info/ws'` | WebSocket server URL |
| `watchedAddresses` | `string[]` | `[]` | Addresses to monitor |
| `onUpdate` | `(update: RealTimeUpdate) => void` | — | Called for all real-time updates |
| `onGraphUpdate` | `(graph: Partial<TxGraph>) => void` | — | Called for graph data updates |
| `onNewTransaction` | `(tx: any) => void` | — | Called for new transactions |
| `onRiskUpdate` | `(address: string, riskLevel: string) => void` | — | Called for risk level changes |
| `className` | `string` | `''` | Additional CSS classes |

### Update Types

| Type | Description | Triggers |
|------|-------------|----------|
| **new_transaction** | New transaction detected | Transaction monitoring |
| **risk_update** | Risk level changed | Risk assessment updates |
| **node_update** | Node data updated | Entity classification changes |
| **graph_update** | Graph structure changed | New connections discovered |

### Connection Management

- **Auto-reconnection**: Automatic retry with exponential backoff
- **Heartbeat**: Ping/pong keepalive messages
- **Status monitoring**: Connection state and error tracking
- **Notification support**: Browser push notifications for alerts
