# 💻 Run Demo Locally

Run TxGraph as a local Vite app with multi-source support (TrustIn API or on-chain via Etherscan/Tronscan). Ideal for evaluation, internal tooling, or as a starting point for your own integration.

::: tip Try without setup
You can also try the <a href="/txgraph/demo/" target="_self">Live Demo</a> directly in this documentation site — no installation needed.
:::

## Prerequisites

- **Node.js** ≥ 18
- **pnpm** ≥ 8 (`npm i -g pnpm`)

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/Width-Risk-Comliance-Database/txgraph.git
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
6. **Click Explore** — graph renders with advanced features

### Advanced Features Available

The local demo now includes all the latest TxGraph capabilities:

- **🔍 Smart Search** — Search addresses, risk levels, entity tags, and transaction amounts
- **🎛 Advanced Filters** — Multi-dimensional filtering by risk, chain, depth, amounts, and time
- **📊 Export Options** — Export as PNG, SVG, JSON, CSV, or comprehensive PDF reports
- **🧠 Cluster Analysis** — AI-powered detection of exchanges, mixers, and suspicious patterns
- **⚡ Real-time Monitoring** — WebSocket integration for live transaction updates (when available)
- **📈 Anomaly Detection** — Identify unusual patterns like rapid succession or round amounts

### Interactions

| Action | Result |
|--------|--------|
| Click node | Select (highlights path from root) |
| Click **+** button | Expand node (load neighbors) |
| Click **✕** button | Remove node from graph |
| Search bar | Find specific addresses or patterns |
| Filter panel | Narrow down visible data |
| Export menu | Download graph in multiple formats |
| Cluster panel | View detected entity clusters |
| Click background | Deselect all |

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

The demo provides a comprehensive foundation. Common customizations:

### UI Customization
- **Custom styling** — edit the inline styles in `App.tsx` or add CSS modules
- **Layout changes** — modify the component arrangement and sizing
- **Branding** — add your own logos and color schemes
- **Dark mode** — implement custom dark/light theme switching

### Functionality Extensions  
- **Authentication** — wrap with your own auth layer and user management
- **Multiple addresses** — extend the UI for batch exploration and comparison
- **Custom data sources** — integrate with your own blockchain data APIs
- **Advanced analytics** — add custom risk scoring and compliance rules
- **Reporting** — extend export functionality with custom report templates

### Real-time Features
- **WebSocket configuration** — connect to your own real-time data feeds  
- **Alert systems** — implement custom notification and alerting logic
- **Dashboard integration** — embed into larger compliance or monitoring dashboards

### Example Customizations

```tsx
// Custom theme colors
const customTheme = {
  primary: '#1e40af',
  success: '#16a34a', 
  warning: '#d97706',
  danger: '#dc2626',
  background: '#f8fafc'
}

// Custom risk scoring
const customRiskLogic = (node: TxNode) => {
  // Your custom risk assessment logic
  return calculateCustomRisk(node)
}

// Custom export formats
const exportToCustomFormat = (graph: TxGraph) => {
  // Export to your internal systems
  return convertToInternalFormat(graph)
}
```

For deeper integration and full component documentation, see [Layer 4: Build Your Own](/guide/layer4-component) and [Examples](/guide/examples).
