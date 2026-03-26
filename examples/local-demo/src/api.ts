import type { TxGraph } from '@trustin/txgraph'
import {
  GraphBuilder,
  TrustInAdapter,
  createChainAdapter,
  batchResolveENS,
  mergeGraphs,
  type DataSource,
  type BuilderOptions,
} from '@trustin/txgraph-core'

export type DataSourceType = 'trustin' | 'onchain'

export interface GraphExploreParams {
  address: string
  chain: string
  direction?: 'in' | 'out' | 'all'
  token?: string
  maxDepth?: number
  fromDate?: string
  toDate?: string
  dataSource?: DataSourceType
}

function getAdapter(dataSource: DataSourceType, chain: string): DataSource {
  if (dataSource === 'trustin') {
    return new TrustInAdapter({
      apiUrl: import.meta.env.VITE_TRUSTIN_API_URL || 'https://api.trustin.info',
      apiKey: import.meta.env.VITE_TRUSTIN_API_KEY as string | undefined,
    })
  }

  return createChainAdapter(chain, {
    etherscan: {
      apiKey: import.meta.env.VITE_ETHERSCAN_API_KEY as string | undefined,
    },
    tronscan: {
      apiKey: import.meta.env.VITE_TRONSCAN_API_KEY as string | undefined,
    },
  })
}

// Simple in-memory cache for explore results
const graphCache = new Map<string, { graph: TxGraph; timestamp: number }>()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

function getCacheKey(params: GraphExploreParams): string {
  return JSON.stringify({
    address: params.address,
    chain: params.chain,
    direction: params.direction || 'out',
    token: params.token || '',
    maxDepth: params.maxDepth || 3,
    fromDate: params.fromDate || '',
    toDate: params.toDate || '',
    dataSource: params.dataSource || 'trustin',
  })
}

function getCached(key: string): TxGraph | null {
  const entry = graphCache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    graphCache.delete(key)
    return null
  }
  return entry.graph
}

/**
 * Enrich graph nodes with ENS names (EVM chains only, on-chain mode only).
 * Runs in background — does not block graph rendering.
 */
async function enrichWithENS(graph: TxGraph): Promise<TxGraph> {
  const evmAddresses = graph.nodes
    .filter(n => n.address.startsWith('0x') && n.tags.length === 0)
    .map(n => n.address)

  if (evmAddresses.length === 0) return graph

  const ensMap = await batchResolveENS(evmAddresses)
  if (ensMap.size === 0) return graph

  return {
    ...graph,
    nodes: graph.nodes.map(n => {
      const ensName = ensMap.get(n.address.toLowerCase())
      if (!ensName) return n
      return {
        ...n,
        tags: [...n.tags, { primary_category: 'ENS', name: ensName }],
      }
    }),
  }
}

export async function exploreGraph(params: GraphExploreParams): Promise<TxGraph> {
  const cacheKey = getCacheKey(params)
  const cached = getCached(cacheKey)
  if (cached) return cached

  const dataSource = params.dataSource || 'trustin'
  const adapter = getAdapter(dataSource, params.chain)

  const options: BuilderOptions = {
    direction: params.direction || 'out',
    token: params.token || undefined,
    maxDepth: params.maxDepth || 3,
    fromDate: params.fromDate,
    toDate: params.toDate,
  }

  // Support multiple addresses separated by comma
  const addresses = params.address.split(',').map(a => a.trim()).filter(Boolean)

  let graph: TxGraph
  if (addresses.length <= 1) {
    const builder = new GraphBuilder(adapter, options)
    graph = await builder.explore(addresses[0] || params.address, params.chain)
  } else {
    const graphs = await Promise.all(
      addresses.map(addr => {
        const builder = new GraphBuilder(adapter, options)
        return builder.explore(addr, params.chain)
      })
    )
    graph = mergeGraphs(graphs)
  }

  // Enrich with ENS names for on-chain EVM queries
  if (dataSource === 'onchain' && params.chain !== 'Tron') {
    graph = await enrichWithENS(graph)
  }

  graphCache.set(cacheKey, { graph, timestamp: Date.now() })
  return graph
}

export async function expandNode(
  params: GraphExploreParams,
  existingGraph: TxGraph
): Promise<TxGraph> {
  const dataSource = params.dataSource || 'trustin'
  const adapter = getAdapter(dataSource, params.chain)

  const options: BuilderOptions = {
    direction: params.direction || 'out',
    token: params.token || undefined,
  }

  const builder = new GraphBuilder(adapter, options)
  return builder.expandNode(params.address, params.chain, existingGraph)
}
