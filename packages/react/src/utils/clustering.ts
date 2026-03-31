import type { TxNode, TxEdge } from '../types'

export interface ClusterNode extends TxNode {
  clusterId?: string
  clusterScore?: number
}

export interface Cluster {
  id: string
  nodes: ClusterNode[]
  centroid: string // address of centroid node
  type: 'exchange' | 'mixer' | 'pool' | 'bridge' | 'unknown'
  riskLevel: 'high' | 'medium' | 'low' | 'unknown'
  totalValue: number
  confidence: number
}

export interface ClusteringOptions {
  minClusterSize: number
  maxDistance: number
  riskThreshold: number
  valueThreshold: number
  useTemporalClustering: boolean
  timeWindowHours: number
}

const DEFAULT_OPTIONS: ClusteringOptions = {
  minClusterSize: 3,
  maxDistance: 0.7,
  riskThreshold: 0.6,
  valueThreshold: 1000,
  useTemporalClustering: true,
  timeWindowHours: 24
}

/**
 * Calculate similarity between two nodes based on various factors
 */
function calculateNodeSimilarity(
  node1: TxNode,
  node2: TxNode,
  edges: TxEdge[],
  options: ClusteringOptions
): number {
  let similarity = 0
  let factors = 0

  // Risk level similarity (high weight)
  if (node1.risk_level === node2.risk_level) {
    similarity += 0.3
  }
  factors += 0.3

  // Tag similarity
  const tags1 = new Set(node1.tags.map(t => t.primary_category))
  const tags2 = new Set(node2.tags.map(t => t.primary_category))
  const commonTags = [...tags1].filter(t => tags2.has(t))
  if (tags1.size > 0 && tags2.size > 0) {
    similarity += (commonTags.length / Math.max(tags1.size, tags2.size)) * 0.25
  }
  factors += 0.25

  // Transaction pattern similarity
  const edges1 = edges.filter(e => e.from === node1.address || e.to === node1.address)
  const edges2 = edges.filter(e => e.from === node2.address || e.to === node2.address)
  
  // Common counterparties
  const counterparties1 = new Set(edges1.map(e => e.from === node1.address ? e.to : e.from))
  const counterparties2 = new Set(edges2.map(e => e.from === node2.address ? e.to : e.from))
  const commonCounterparties = [...counterparties1].filter(c => counterparties2.has(c))
  
  if (counterparties1.size > 0 && counterparties2.size > 0) {
    similarity += (commonCounterparties.length / Math.max(counterparties1.size, counterparties2.size)) * 0.2
  }
  factors += 0.2

  // Value range similarity
  const totalValue1 = edges1.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
  const totalValue2 = edges2.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
  
  if (totalValue1 > 0 && totalValue2 > 0) {
    const valueRatio = Math.min(totalValue1, totalValue2) / Math.max(totalValue1, totalValue2)
    similarity += valueRatio * 0.15
  }
  factors += 0.15

  // Temporal similarity (if enabled)
  if (options.useTemporalClustering) {
    const timestamps1 = edges1.map(e => e.last_timestamp).sort()
    const timestamps2 = edges2.map(e => e.last_timestamp).sort()
    
    if (timestamps1.length > 0 && timestamps2.length > 0) {
      const timeDiff = Math.abs(timestamps1[0] - timestamps2[0])
      const timeWindow = options.timeWindowHours * 3600 // Convert to seconds
      const temporalSimilarity = Math.max(0, 1 - (timeDiff / timeWindow))
      similarity += temporalSimilarity * 0.1
    }
    factors += 0.1
  }

  return factors > 0 ? similarity / factors : 0
}

/**
 * Detect clusters of related addresses using graph-based clustering
 */
export function detectClusters(
  nodes: TxNode[],
  edges: TxEdge[],
  options: Partial<ClusteringOptions> = {}
): Cluster[] {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const clusters: Cluster[] = []
  const clusteredNodes = new Set<string>()

  // Build similarity matrix
  const similarities: Map<string, Map<string, number>> = new Map()
  
  for (let i = 0; i < nodes.length; i++) {
    const node1 = nodes[i]
    similarities.set(node1.address, new Map())
    
    for (let j = i + 1; j < nodes.length; j++) {
      const node2 = nodes[j]
      const sim = calculateNodeSimilarity(node1, node2, edges, opts)
      
      similarities.get(node1.address)!.set(node2.address, sim)
      if (!similarities.has(node2.address)) {
        similarities.set(node2.address, new Map())
      }
      similarities.get(node2.address)!.set(node1.address, sim)
    }
  }

  // Find clusters using density-based approach
  for (const seedNode of nodes) {
    if (clusteredNodes.has(seedNode.address)) continue

    const clusterNodes: ClusterNode[] = []
    const candidates = [seedNode]
    const visited = new Set<string>()

    while (candidates.length > 0) {
      const currentNode = candidates.pop()!
      if (visited.has(currentNode.address)) continue
      visited.add(currentNode.address)

      // Check if current node should be in cluster
      let shouldInclude = clusterNodes.length === 0 // Always include seed
      
      if (!shouldInclude) {
        const avgSimilarity = clusterNodes.reduce((sum, clusterNode) => {
          return sum + (similarities.get(currentNode.address)?.get(clusterNode.address) || 0)
        }, 0) / clusterNodes.length
        
        shouldInclude = avgSimilarity >= opts.maxDistance
      }

      if (shouldInclude) {
        clusterNodes.push({
          ...currentNode,
          clusterId: `cluster_${clusters.length}`,
          clusterScore: clusterNodes.length > 0 ? 
            clusterNodes.reduce((sum, n) => sum + (similarities.get(currentNode.address)?.get(n.address) || 0), 0) / clusterNodes.length : 1
        })

        // Add neighbors as candidates
        for (const neighbor of nodes) {
          if (!visited.has(neighbor.address) && !clusteredNodes.has(neighbor.address)) {
            const sim = similarities.get(currentNode.address)?.get(neighbor.address) || 0
            if (sim >= opts.maxDistance) {
              candidates.push(neighbor)
            }
          }
        }
      }
    }

    // Create cluster if it meets minimum size requirement
    if (clusterNodes.length >= opts.minClusterSize) {
      // Mark nodes as clustered
      clusterNodes.forEach(node => clusteredNodes.add(node.address))

      // Determine cluster type and centroid
      const { type, centroid } = determineClusterType(clusterNodes, edges)
      
      // Calculate cluster risk level
      const riskCounts = clusterNodes.reduce((counts, node) => {
        counts[node.risk_level] = (counts[node.risk_level] || 0) + 1
        return counts
      }, {} as Record<string, number>)
      
      const dominantRisk = Object.entries(riskCounts)
        .reduce((a, b) => riskCounts[a[0]] > riskCounts[b[0]] ? a : b)[0] as 'high' | 'medium' | 'low' | 'unknown'

      // Calculate total value
      const clusterAddresses = new Set(clusterNodes.map(n => n.address))
      const clusterEdges = edges.filter(e => 
        clusterAddresses.has(e.from) || clusterAddresses.has(e.to)
      )
      const totalValue = clusterEdges.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)

      // Calculate confidence based on various factors
      const avgClusterScore = clusterNodes.reduce((sum, n) => sum + (n.clusterScore || 0), 0) / clusterNodes.length
      const sizeConfidence = Math.min(1, clusterNodes.length / 10) // Larger clusters are more confident
      const riskConfidence = dominantRisk === 'high' ? 0.9 : dominantRisk === 'medium' ? 0.7 : 0.5
      const confidence = (avgClusterScore + sizeConfidence + riskConfidence) / 3

      clusters.push({
        id: `cluster_${clusters.length}`,
        nodes: clusterNodes,
        centroid,
        type,
        riskLevel: dominantRisk,
        totalValue,
        confidence
      })
    }
  }

  return clusters.sort((a, b) => b.confidence - a.confidence)
}

/**
 * Determine cluster type based on node characteristics
 */
function determineClusterType(
  nodes: ClusterNode[],
  edges: TxEdge[]
): { type: Cluster['type'], centroid: string } {
  // Analyze tags to determine cluster type
  const allTags = nodes.flatMap(n => n.tags.map(t => t.primary_category.toLowerCase()))
  const tagCounts = allTags.reduce((counts, tag) => {
    counts[tag] = (counts[tag] || 0) + 1
    return counts
  }, {} as Record<string, number>)

  const dominantTag = Object.entries(tagCounts)
    .reduce((a, b) => a[1] > b[1] ? a : b, ['', 0])[0]

  let type: Cluster['type'] = 'unknown'
  
  if (dominantTag.includes('exchange') || dominantTag.includes('trading')) {
    type = 'exchange'
  } else if (dominantTag.includes('mixer') || dominantTag.includes('tumbler')) {
    type = 'mixer'
  } else if (dominantTag.includes('pool') || dominantTag.includes('liquidity')) {
    type = 'pool'
  } else if (dominantTag.includes('bridge')) {
    type = 'bridge'
  }

  // Find centroid (most connected node)
  const nodeConnections = nodes.map(node => {
    const connections = edges.filter(e => e.from === node.address || e.to === node.address).length
    return { address: node.address, connections }
  })

  const centroid = nodeConnections.reduce((a, b) => a.connections > b.connections ? a : b).address

  return { type, centroid }
}

/**
 * Detect anomalous patterns in transaction behavior
 */
export function detectAnomalies(
  nodes: TxNode[],
  edges: TxEdge[]
): Array<{
  type: 'rapid_succession' | 'round_amounts' | 'unusual_pattern' | 'concentration'
  addresses: string[]
  description: string
  severity: 'high' | 'medium' | 'low'
  confidence: number
}> {
  const anomalies: Array<{
    type: 'rapid_succession' | 'round_amounts' | 'unusual_pattern' | 'concentration'
    addresses: string[]
    description: string
    severity: 'high' | 'medium' | 'low'
    confidence: number
  }> = []

  // Detect rapid succession transactions
  const addressTimestamps = new Map<string, number[]>()
  edges.forEach(edge => {
    if (!addressTimestamps.has(edge.from)) addressTimestamps.set(edge.from, [])
    if (!addressTimestamps.has(edge.to)) addressTimestamps.set(edge.to, [])
    addressTimestamps.get(edge.from)!.push(edge.last_timestamp)
    addressTimestamps.get(edge.to)!.push(edge.last_timestamp)
  })

  addressTimestamps.forEach((timestamps, address) => {
    if (timestamps.length < 5) return
    
    timestamps.sort((a, b) => a - b)
    const intervals = []
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1])
    }
    
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
    const rapidCount = intervals.filter(interval => interval < 300).length // Less than 5 minutes
    
    if (rapidCount > intervals.length * 0.5 && avgInterval < 600) { // More than 50% rapid, avg < 10 min
      anomalies.push({
        type: 'rapid_succession',
        addresses: [address],
        description: `Rapid succession of ${rapidCount} transactions within short time periods`,
        severity: 'high',
        confidence: Math.min(0.9, rapidCount / intervals.length)
      })
    }
  })

  // Detect round amount patterns
  const roundAmountAddresses = new Set<string>()
  edges.forEach(edge => {
    const amount = parseFloat(edge.amount) || 0
    if (amount > 0) {
      const isRound = amount === Math.round(amount) || 
                     amount === Math.round(amount / 1000) * 1000 ||
                     amount === Math.round(amount / 1000000) * 1000000
      
      if (isRound && amount >= 1000) {
        roundAmountAddresses.add(edge.from)
        roundAmountAddresses.add(edge.to)
      }
    }
  })

  if (roundAmountAddresses.size > 2) {
    // Check if these addresses are frequently transacting in round amounts
    const addressRoundCounts = new Map<string, { total: number, round: number }>()
    
    for (const edge of edges) {
      const amount = parseFloat(edge.amount) || 0
      const isRound = amount === Math.round(amount) || 
                     amount === (Math.round(amount / 1000) * 1000)
      
      for (const addr of [edge.from, edge.to]) {
        if (!addressRoundCounts.has(addr)) {
          addressRoundCounts.set(addr, { total: 0, round: 0 })
        }
        const counts = addressRoundCounts.get(addr)!
        counts.total += 1
        if (isRound) counts.round += 1
      }
    }

    const suspiciousAddresses = Array.from(addressRoundCounts.entries())
      .filter(([, counts]) => counts.total >= 3 && counts.round / counts.total > 0.7)
      .map(([addr]) => addr)

    if (suspiciousAddresses.length > 0) {
      anomalies.push({
        type: 'round_amounts',
        addresses: suspiciousAddresses,
        description: `Frequent round amount transactions suggesting potential structuring`,
        severity: 'medium',
        confidence: suspiciousAddresses.length / Math.max(3, roundAmountAddresses.size)
      })
    }
  }

  // Detect concentration patterns (many small amounts to/from one address)
  const concentrationMap = new Map<string, { inbound: TxEdge[], outbound: TxEdge[] }>()
  
  edges.forEach(edge => {
    if (!concentrationMap.has(edge.to)) {
      concentrationMap.set(edge.to, { inbound: [], outbound: [] })
    }
    if (!concentrationMap.has(edge.from)) {
      concentrationMap.set(edge.from, { inbound: [], outbound: [] })
    }
    concentrationMap.get(edge.to)!.inbound.push(edge)
    concentrationMap.get(edge.from)!.outbound.push(edge)
  })

  concentrationMap.forEach(({ inbound, outbound }, address: string) => {
    // Check for many small inbound transactions (potential collection)
    if (inbound.length >= 10) {
      const amounts = inbound.map(e => parseFloat(e.amount) || 0)
      const avgAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length
      const maxAmount = Math.max(...amounts)
      
      if (avgAmount > 0 && maxAmount / avgAmount < 10) { // Relatively uniform amounts
        anomalies.push({
          type: 'concentration',
          addresses: [address],
          description: `Collection pattern: ${inbound.length} similar-sized inbound transactions`,
          severity: 'medium',
          confidence: Math.min(0.8, inbound.length / 20)
        })
      }
    }

    // Check for many small outbound transactions (potential distribution)
    if (outbound.length >= 10) {
      const amounts = outbound.map(e => parseFloat(e.amount) || 0)
      const avgAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length
      const maxAmount = Math.max(...amounts)
      
      if (avgAmount > 0 && maxAmount / avgAmount < 10) {
        anomalies.push({
          type: 'concentration',
          addresses: [address],
          description: `Distribution pattern: ${outbound.length} similar-sized outbound transactions`,
          severity: 'medium',
          confidence: Math.min(0.8, outbound.length / 20)
        })
      }
    }
  })

  return anomalies.sort((a, b) => {
    // Sort by severity first, then confidence
    const severityOrder = { high: 3, medium: 2, low: 1 }
    const severityDiff = severityOrder[b.severity] - severityOrder[a.severity]
    return severityDiff !== 0 ? severityDiff : b.confidence - a.confidence
  })
}