import type {
  DataSource,
  AdapterCapabilities,
  FetchTxOptions,
  RawTransaction,
} from '../../adapter/types'
import { RateLimiter } from '../../utils/rate-limiter'

export interface EtherscanAdapterConfig {
  apiKey?: string
  /** Base URL — change for BSC, Polygon, etc. Defaults to Ethereum mainnet. */
  baseUrl?: string
  /** Display name for the adapter (e.g. 'BscScan', 'PolygonScan'). Defaults to 'Etherscan'. */
  adapterName?: string
  /** Native token symbol (e.g. 'BNB', 'MATIC'). Defaults to 'ETH'. */
  nativeToken?: string
  /** Chain name for capabilities (e.g. 'BSC', 'Polygon'). Defaults to 'Ethereum'. */
  chainName?: string
}

const DEFAULT_BASE_URL = 'https://api.etherscan.io'

export class EtherscanAdapter implements DataSource {
  readonly name: string
  readonly capabilities: AdapterCapabilities

  private apiKey: string
  private baseUrl: string
  private nativeToken: string
  private limiter: RateLimiter

  constructor(config: EtherscanAdapterConfig = {}) {
    this.apiKey = config.apiKey || ''
    this.baseUrl = config.baseUrl || DEFAULT_BASE_URL
    this.nativeToken = config.nativeToken || 'ETH'
    this.name = config.adapterName || 'Etherscan'
    this.capabilities = {
      hasRiskScoring: false,
      hasAddressTags: false,
      returnsPrebuiltGraph: false,
      supportedChains: [config.chainName || 'Ethereum'],
      rateLimit: config.apiKey ? 5 : 2,
    }
    this.limiter = new RateLimiter(config.apiKey ? 5 : 2)
  }

  async fetchTransactions(
    opts: FetchTxOptions
  ): Promise<{ transactions: RawTransaction[]; hasMore: boolean }> {
    const page = opts.page ?? 1
    const pageSize = opts.pageSize ?? 100

    // Sequential to respect rate limits
    await this.limiter.acquire()
    const normalTxs = await this.fetchNormalTxs(opts.address, page, pageSize)

    await this.limiter.acquire()
    const tokenTxs = await this.fetchTokenTxs(opts.address, page, pageSize)

    let allTxs = [...normalTxs, ...tokenTxs]

    // Filter by direction
    if (opts.direction === 'in') {
      allTxs = allTxs.filter((tx) => tx.to.toLowerCase() === opts.address.toLowerCase())
    } else if (opts.direction === 'out') {
      allTxs = allTxs.filter((tx) => tx.from.toLowerCase() === opts.address.toLowerCase())
    }

    // Sort by timestamp descending
    allTxs.sort((a, b) => b.timestamp - a.timestamp)

    const hasMore = normalTxs.length === pageSize || tokenTxs.length === pageSize

    return { transactions: allTxs, hasMore }
  }

  private async fetchNormalTxs(
    address: string,
    page: number,
    pageSize: number
  ): Promise<RawTransaction[]> {
    const params = new URLSearchParams({
      module: 'account',
      action: 'txlist',
      address,
      startblock: '0',
      endblock: '99999999',
      page: String(page),
      offset: String(pageSize),
      sort: 'desc',
    })
    if (this.apiKey) params.set('apikey', this.apiKey)

    const res = await fetch(`${this.baseUrl}/api?${params}`)
    if (!res.ok) throw new Error(`Etherscan API error: ${res.status}`)
    const data = await res.json()

    if (data.status !== '1' || !Array.isArray(data.result)) {
      return []
    }

    return data.result
      .filter((tx: any) => tx.to) // skip contract creation txs
      .map((tx: any) => ({
        hash: tx.hash,
        from: tx.from.toLowerCase(),
        to: tx.to.toLowerCase(),
        value: tx.value,
        tokenSymbol: this.nativeToken,
        tokenDecimal: 18,
        timestamp: Number(tx.timeStamp),
      }))
  }

  private async fetchTokenTxs(
    address: string,
    page: number,
    pageSize: number
  ): Promise<RawTransaction[]> {
    const params = new URLSearchParams({
      module: 'account',
      action: 'tokentx',
      address,
      startblock: '0',
      endblock: '99999999',
      page: String(page),
      offset: String(pageSize),
      sort: 'desc',
    })
    if (this.apiKey) params.set('apikey', this.apiKey)

    const res = await fetch(`${this.baseUrl}/api?${params}`)
    if (!res.ok) throw new Error(`Etherscan API error: ${res.status}`)
    const data = await res.json()

    if (data.status !== '1' || !Array.isArray(data.result)) {
      return []
    }

    return data.result.map((tx: any) => ({
      hash: tx.hash,
      from: tx.from.toLowerCase(),
      to: tx.to.toLowerCase(),
      value: tx.value,
      tokenSymbol: tx.tokenSymbol,
      tokenDecimal: Number(tx.tokenDecimal),
      timestamp: Number(tx.timeStamp),
    }))
  }
}
