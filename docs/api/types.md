# Types

All types are exported from `@trustin/txgraph`:

```ts
import type { 
  TxNode, TxEdge, TxGraph, TxGraphStats, TxTag, GraphExplorerProps,
  ExportData, SearchResult, FilterConfig, Cluster, ClusteringOptions,
  RealTimeUpdate 
} from '@trustin/txgraph'
```

---

## `TxNode`

Represents a blockchain address (wallet or contract) in the transaction graph.

```typescript
interface TxNode {
  address: string               // Full blockchain address
  chain?: string                // 'Ethereum' | 'Tron' | ...
  depth: number                 // Distance from root (0 = root)
  is_root: boolean              // Whether this is the starting address
  risk_level: 'high' | 'medium' | 'low' | 'unknown'
  risk_score?: number           // 0–100 numeric score
  tags: TxTag[]                 // Entity labels
  is_stopped: boolean           // Graph traversal stopped at this node
  stop_reason?: string          // Why traversal stopped
}
```

### Risk Levels

| Value | Color | Meaning |
|-------|-------|---------|
| `'high'` | 🔴 Red | Sanctioned / dark market / mixer |
| `'medium'` | 🟡 Yellow | Suspicious patterns |
| `'low'` | 🟢 Green | Known safe entity |
| `'unknown'` | ⚫ Gray | No data |

### Stopped Nodes

When `is_stopped: true`, the graph renderer shows a dashed border and warning icon. Traversal was halted (e.g., node is a well-known exchange, or reached max depth).

---

## `TxTag`

Entity label attached to a node.

```typescript
interface TxTag {
  name: string                  // Entity name (e.g., "Binance Hot Wallet")
  primaryCategory?: string      // e.g., "Exchange"
  secondaryCategory?: string    // e.g., "Centralized Exchange"
}
```

---

## `TxEdge`

Represents a group of transactions between two addresses.

```typescript
interface TxEdge {
  from: string                  // Source address
  to: string                    // Destination address
  formatted_amount: string      // Human-readable amount (e.g., "1,234.56 USDT")
  amount?: number               // Raw numeric amount
  token?: string                // Token symbol (e.g., "USDT", "ETH")
  last_timestamp: number        // Unix timestamp (seconds) of most recent tx
  direction: 'in' | 'out' | 'all'
  tx_count?: number             // Number of transactions aggregated
}
```

---

## `TxGraphStats`

Summary statistics returned alongside the graph.

```typescript
interface TxGraphStats {
  total_nodes: number
  total_edges: number
  stopped_nodes: number
}
```

---

## `TxGraph`

The complete graph data structure.

```typescript
interface TxGraph {
  nodes: TxNode[]
  edges: TxEdge[]
  stats: TxGraphStats
}
```

---

## `GraphExplorerProps`

Props shared by both `GraphExplorer` and `GraphExplorerSigma`.

```typescript
interface GraphExplorerProps {
  nodes: TxNode[]
  edges: TxEdge[]
  stats?: TxGraphStats
  loading?: boolean
  expandingNode?: string | null
  selectedAddress?: string | null
  onNodeSelect?: (node: TxNode | null) => void
  onNodeExpand?: (address: string) => void
  onNodeDelete?: (address: string) => void
  className?: string
}
```

---

## `ExportData`

Data structure for exporting graph information with metadata.

```typescript
interface ExportData {
  nodes: TxNode[]
  edges: TxEdge[]
  stats?: TxGraphStats | null
  timestamp: string           // ISO string of export time
  exportedBy: string         // Tool version identifier
}
```

---

## `SearchResult`

Search result item returned by SearchBar component.

```typescript
interface SearchResult {
  type: 'node' | 'edge'
  item: TxNode | TxEdge       // The matched node or edge
  matchField: string          // Field that matched (e.g., 'address', 'risk_level')
  matchValue: string          // Value that matched the search
}
```

---

## `FilterConfig`

Configuration object for graph filtering.

```typescript
interface FilterConfig {
  riskLevels: string[]                    // ['high', 'medium', 'low', 'unknown']
  chains: string[]                        // Chain names to include
  depthRange: [number, number]            // [minDepth, maxDepth]
  amountRange: [number, number]           // [minAmount, maxAmount]
  dateRange: [Date | null, Date | null]   // [startDate, endDate]
  tokens: string[]                        // Token symbols to include
  onlyRootNodes: boolean                  // Show only root nodes
  onlyStoppedNodes: boolean               // Show only stopped nodes
  hideUntaggedNodes: boolean              // Hide nodes without tags
}
```

---

## `Cluster`

Detected cluster of related addresses.

```typescript
interface Cluster {
  id: string                              // Unique cluster identifier
  nodes: ClusterNode[]                    // Nodes in this cluster
  centroid: string                        // Address of central node
  type: 'exchange' | 'mixer' | 'pool' | 'bridge' | 'unknown'
  riskLevel: 'high' | 'medium' | 'low' | 'unknown'
  totalValue: number                      // Total transaction value
  confidence: number                      // Clustering confidence (0-1)
}

interface ClusterNode extends TxNode {
  clusterId?: string                      // ID of assigned cluster
  clusterScore?: number                   // Similarity score to cluster
}
```

---

## `ClusteringOptions`

Configuration for clustering algorithm.

```typescript
interface ClusteringOptions {
  minClusterSize: number                  // Minimum nodes per cluster
  maxDistance: number                     // Maximum similarity threshold (0-1)
  riskThreshold: number                   // Risk-based clustering weight
  valueThreshold: number                  // Minimum value for consideration
  useTemporalClustering: boolean          // Include time-based similarity
  timeWindowHours: number                 // Time window for temporal clustering
}
```

---

## `RealTimeUpdate`

Real-time update event from WebSocket connection.

```typescript
interface RealTimeUpdate {
  type: 'new_transaction' | 'risk_update' | 'node_update' | 'graph_update'
  timestamp: number                       // Event timestamp (ms)
  data: any                              // Update payload
  address?: string                       // Related address (if applicable)
  chain?: string                         // Related chain (if applicable)
}
```

### Update Types

| Type | Description | Data Payload |
|------|-------------|--------------|
| `new_transaction` | New transaction detected | Transaction details |
| `risk_update` | Address risk level changed | `{ riskLevel: string, riskScore?: number }` |
| `node_update` | Node metadata updated | Updated node data |
| `graph_update` | Graph structure changed | Partial graph updates |
