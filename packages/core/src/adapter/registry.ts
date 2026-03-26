import type { DataSource } from './types'
import { TrustInAdapter, type TrustInAdapterConfig } from '../adapters/trustin'
import { EtherscanAdapter, type EtherscanAdapterConfig } from '../adapters/etherscan'
import { TronscanAdapter, type TronscanAdapterConfig } from '../adapters/tronscan'

export type AdapterType = 'trustin' | 'etherscan' | 'tronscan'

export interface AdapterConfig {
  trustin?: TrustInAdapterConfig
  etherscan?: EtherscanAdapterConfig
  tronscan?: TronscanAdapterConfig
  bscscan?: EtherscanAdapterConfig
  polygonscan?: EtherscanAdapterConfig
  arbiscan?: EtherscanAdapterConfig
}

/** Chains supported by on-chain adapters. */
export const SUPPORTED_CHAINS = ['Ethereum', 'Tron', 'BSC', 'Polygon', 'Arbitrum'] as const
export type ChainName = (typeof SUPPORTED_CHAINS)[number]

/** EVM chain presets for the EtherscanAdapter. */
const EVM_CHAIN_PRESETS: Record<string, { baseUrl: string; adapterName: string; nativeToken: string; configKey: keyof AdapterConfig }> = {
  ethereum: { baseUrl: 'https://api.etherscan.io', adapterName: 'Etherscan', nativeToken: 'ETH', configKey: 'etherscan' },
  bsc:      { baseUrl: 'https://api.bscscan.com', adapterName: 'BscScan', nativeToken: 'BNB', configKey: 'bscscan' },
  polygon:  { baseUrl: 'https://api.polygonscan.com', adapterName: 'PolygonScan', nativeToken: 'POL', configKey: 'polygonscan' },
  arbitrum: { baseUrl: 'https://api.arbiscan.io', adapterName: 'Arbiscan', nativeToken: 'ETH', configKey: 'arbiscan' },
}

/**
 * Create an adapter by name.
 */
export function createAdapter(type: AdapterType, config?: AdapterConfig): DataSource {
  switch (type) {
    case 'trustin':
      return new TrustInAdapter(config?.trustin)
    case 'etherscan':
      return new EtherscanAdapter(config?.etherscan)
    case 'tronscan':
      return new TronscanAdapter(config?.tronscan)
    default:
      throw new Error(`Unknown adapter type: ${type}`)
  }
}

/**
 * Auto-select an on-chain adapter based on chain name.
 */
export function createChainAdapter(chain: string, config?: AdapterConfig): DataSource {
  const key = chain.toLowerCase()

  if (key === 'tron') {
    return new TronscanAdapter(config?.tronscan)
  }

  const preset = EVM_CHAIN_PRESETS[key]
  if (preset) {
    const chainConfig = config?.[preset.configKey] as EtherscanAdapterConfig | undefined
    return new EtherscanAdapter({
      baseUrl: preset.baseUrl,
      adapterName: preset.adapterName,
      nativeToken: preset.nativeToken,
      chainName: chain,
      ...chainConfig,
    })
  }

  throw new Error(`No adapter available for chain: ${chain}`)
}
