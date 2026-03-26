/**
 * Lightweight ENS reverse-resolution via Ethereum JSON-RPC.
 * Resolves 0x addresses to .eth names using the ENS universal resolver.
 */

const ENS_RPC_URL = 'https://eth.llamarpc.com'

// Universal Resolver on mainnet
const UNIVERSAL_RESOLVER = '0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62'

/**
 * Build the calldata for `reverse(bytes)` on the universal resolver.
 * The input is the reverse-name: `<addr-hex-lower>.addr.reverse`
 */
function buildReverseCalldata(address: string): string {
  const addrLower = address.toLowerCase().replace('0x', '')
  const reverseName = `${addrLower}.addr.reverse`

  // Encode the reverse name in DNS wire format
  const labels = reverseName.split('.')
  const parts: number[] = []
  for (const label of labels) {
    const bytes = new TextEncoder().encode(label)
    parts.push(bytes.length, ...bytes)
  }
  parts.push(0) // null terminator

  const nameBytes = new Uint8Array(parts)

  // ABI: reverse(bytes reverseName) => function selector 0xec11c823
  const selector = 'ec11c823'

  // Encode: offset (32 bytes) + length (32 bytes) + data (padded to 32)
  const offset = 32
  const length = nameBytes.length
  const paddedLength = Math.ceil(length / 32) * 32

  const data = new Uint8Array(4 + 32 + 32 + paddedLength)
  // selector
  for (let i = 0; i < 4; i++) data[i] = parseInt(selector.substr(i * 2, 2), 16)
  // offset
  data[4 + 31] = offset
  // length
  data[4 + 32 + 31] = length
  // name bytes
  data.set(nameBytes, 4 + 64)

  return '0x' + Array.from(data).map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Decode the ABI response from `reverse(bytes)` which returns (string name, address, address, address).
 */
function decodeReverseName(hex: string): string | null {
  // Remove 0x prefix
  const data = hex.startsWith('0x') ? hex.slice(2) : hex
  if (data.length < 128) return null

  // First 32 bytes: offset to the string
  const stringOffset = parseInt(data.slice(0, 64), 16) * 2
  // At stringOffset: 32 bytes length, then the string data
  const stringLength = parseInt(data.slice(stringOffset, stringOffset + 64), 16)
  if (stringLength === 0) return null

  const stringHex = data.slice(stringOffset + 64, stringOffset + 64 + stringLength * 2)
  const bytes = new Uint8Array(stringLength)
  for (let i = 0; i < stringLength; i++) {
    bytes[i] = parseInt(stringHex.substr(i * 2, 2), 16)
  }
  const name = new TextDecoder().decode(bytes)
  return name || null
}

/**
 * Resolve a single address to its ENS name. Returns null if no name set.
 */
async function resolveENS(address: string): Promise<string | null> {
  try {
    const calldata = buildReverseCalldata(address)
    const res = await fetch(ENS_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_call',
        params: [{ to: UNIVERSAL_RESOLVER, data: calldata }, 'latest'],
      }),
    })
    const json = await res.json()
    if (json.error || !json.result || json.result === '0x') return null
    return decodeReverseName(json.result)
  } catch {
    return null
  }
}

/**
 * Batch-resolve ENS names for a list of Ethereum addresses.
 * Returns a map of address → ENS name (only entries that resolved).
 * Processes in batches to avoid overwhelming the RPC.
 */
export async function batchResolveENS(
  addresses: string[],
  batchSize = 5
): Promise<Map<string, string>> {
  const results = new Map<string, string>()
  const uniqueAddrs = [...new Set(addresses.filter(a => a.startsWith('0x')))]

  for (let i = 0; i < uniqueAddrs.length; i += batchSize) {
    const batch = uniqueAddrs.slice(i, i + batchSize)
    const promises = batch.map(async (addr) => {
      const name = await resolveENS(addr)
      if (name) results.set(addr.toLowerCase(), name)
    })
    await Promise.all(promises)
  }

  return results
}
