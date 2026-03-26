import type { TxGraph, TxNode, TxEdge, TxGraphStats } from '../types'

/**
 * Merge multiple TxGraph results into one, deduplicating nodes and edges.
 * For duplicate nodes, keeps the one with smaller depth.
 * For duplicate edges (same from→to), keeps the one with more tx_count.
 */
export function mergeGraphs(graphs: TxGraph[]): TxGraph {
  if (graphs.length === 0) {
    return { nodes: [], edges: [], stats: { total_nodes: 0, total_edges: 0, max_depth_reached: 0, stopped_nodes: 0 } }
  }
  if (graphs.length === 1) return graphs[0]

  // Merge nodes — deduplicate by address, prefer smaller depth
  const nodeMap = new Map<string, TxNode>()
  for (const g of graphs) {
    for (const node of g.nodes) {
      const key = node.address.toLowerCase()
      const existing = nodeMap.get(key)
      if (!existing || node.depth < existing.depth) {
        nodeMap.set(key, node)
      }
    }
  }

  // Merge edges — deduplicate by from+to+token, prefer higher tx_count
  const edgeMap = new Map<string, TxEdge>()
  for (const g of graphs) {
    for (const edge of g.edges) {
      const key = `${edge.from.toLowerCase()}->${edge.to.toLowerCase()}:${edge.token || ''}`
      const existing = edgeMap.get(key)
      if (!existing || (edge.tx_count ?? 0) > (existing.tx_count ?? 0)) {
        edgeMap.set(key, edge)
      }
    }
  }

  const nodes = Array.from(nodeMap.values())
  const edges = Array.from(edgeMap.values())

  const stats: TxGraphStats = {
    total_nodes: nodes.length,
    total_edges: edges.length,
    max_depth_reached: Math.max(...graphs.map(g => g.stats.max_depth_reached)),
    stopped_nodes: nodes.filter(n => n.is_stopped).length,
  }

  return { nodes, edges, stats }
}
