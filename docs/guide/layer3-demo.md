# 💻 Run Demo Locally

Run TxGraph as a local Vite app with multi-source support (TrustIn API or on-chain via Etherscan/Tronscan). Ideal for evaluation, internal tooling, or as a starting point for your own integration.

::: tip Try without setup
You can also try the [Live Demo](/demo/) directly in this documentation site — no installation needed.
:::

## Prerequisites

- **Node.js** ≥ 18
- **pnpm** ≥ 8 (`npm i -g pnpm`)

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/Blackman99/txgraph.git
cd txgraph

# 2. Install dependencies
pnpm install

# 3. Start the demo
pnpm dev:demo
```

Open [http://localhost:5173](http://localhost:5173)

## Configuration (Optional)

The demo works out of the box without any API key. For higher rate limits or on-chain API keys, create `examples/local-demo/.env`:

```env
VITE_TRUSTIN_API_URL=https://api.trustin.info
VITE_TRUSTIN_API_KEY=your_api_key_here
VITE_ETHERSCAN_API_KEY=your_etherscan_key
VITE_TRONSCAN_API_KEY=your_tronscan_key
```

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_TRUSTIN_API_URL` | `https://api.trustin.info` | TrustIn API base URL |
| `VITE_TRUSTIN_API_KEY` | — | Optional TrustIn API key for higher rate limits |
| `VITE_ETHERSCAN_API_KEY` | — | Optional Etherscan API key (5 req/s free tier) |
| `VITE_TRONSCAN_API_KEY` | — | Optional Tronscan API key |

## Using the Demo

1. **Enter an address** — Ethereum (0x…) or Tron (T…)
2. **Select chain** — Ethereum or Tron
3. **Select data source** — TrustIn (with risk scoring) or On-Chain (Etherscan/Tronscan)
4. **Choose direction** — Outflow / Inflow / All
5. **Set date range** (optional) — filter by transaction date
6. **Click Explore** — graph renders immediately
7. **Toggle renderer** — switch between ReactFlow and Sigma.js

### Node Interactions

| Action | Result |
|--------|--------|
| Click node | Select (highlights path from root) |
| Click **+** button | Expand node (load neighbors) |
| Click **✕** button | Remove node from graph |
| Click background | Deselect |

## URL Deep-Link

You can open the demo with query parameters to pre-fill and auto-explore:

```
http://localhost:5173/?address=0xd8dA...6045&chain=Ethereum&direction=out&from=2024-01-01&to=2024-12-31
```

| Param | Description |
|-------|-------------|
| `address` | Blockchain address (triggers auto-explore on load) |
| `chain` | `Ethereum` or `Tron` (auto-detected if omitted) |
| `direction` | `in`, `out`, or `all` |
| `from` | Start date filter (`YYYY-MM-DD`) |
| `to` | End date filter (`YYYY-MM-DD`) |

::: tip Claude Code Skill
If you use [Claude Code](https://claude.com/claude-code), the `/trace-graph` skill automates the full workflow — see [Claude Code Skill](/guide/claude-code-skill).
:::

## Demo Architecture

```
examples/local-demo/
├── src/
│   ├── App.tsx          # Main UI with controls
│   ├── api.ts           # Multi-source API client (TrustIn + on-chain)
│   └── main.tsx         # React entry point
├── .env.example         # Environment template
├── index.html
└── vite.config.ts
```

The demo uses `@trustin/txgraph` via `workspace:*` — it reads from the local package build in `packages/react/dist/`.

## Building for Production

```bash
cd examples/local-demo
pnpm build
pnpm preview  # preview the build
```

The built files are in `examples/local-demo/dist/` — deploy to any static host (Vercel, Netlify, S3, etc.).

## Customizing

The demo is intentionally simple. Common customizations:

- **Custom styling** — edit the inline styles in `App.tsx`
- **Add authentication** — wrap with your own auth layer
- **Multiple addresses** — extend the UI for batch exploration
- **Export** — add JSON/CSV export of graph data

For deeper integration, see [Layer 4: Build Your Own](/guide/layer4-component).
