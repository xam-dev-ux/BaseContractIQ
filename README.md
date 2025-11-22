# Base Contract IQ

Analyze contract quality and detect airdrop farming on Base network.

## Features

- Analyze all contracts deployed by a wallet address on Base
- Detect bytecode repetition, clones, and templates
- Analyze on-chain activity and behavior patterns
- Classify contracts as high-quality, neutral, or airdrop farming
- Generate overall wallet quality score

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file:

```bash
cp .env.example .env
```

Required variables:

```env
ETHERSCAN_API_KEY=your_etherscan_api_key_here
BASE_RPC_URL=https://mainnet.base.org
```

Get your Etherscan API key at: https://etherscan.io/myapikey

**Note:** This app uses Etherscan API V2 unified endpoint. One API key works for all chains (Ethereum, Base, Polygon, etc.). Legacy Basescan API was deprecated on May 31, 2025.

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Build

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Install Vercel CLI:

```bash
npm i -g vercel
```

2. Deploy:

```bash
vercel
```

3. Add environment variables in Vercel dashboard:
   - Go to your project settings
   - Navigate to Environment Variables
   - Add `BASESCAN_API_KEY` and `BASE_RPC_URL`

Alternatively, deploy via Vercel dashboard:
- Push to GitHub
- Import repository in Vercel
- Add environment variables
- Deploy

## Deploy as Base Mini App

This app is configured as a Base mini app with:

- `public/.well-known/farcaster.json` - Farcaster manifest (required)
- `public/manifest.json` - PWA manifest
- `public/icon.svg` - App icon
- Responsive design optimized for mobile

### 1. Generate Icons

Use [Favicon Generator](https://realfavicongenerator.net/) to create:
- `icon-192.png`
- `icon-512.png`
- `favicon.ico`
- `og-image.png`
- `splash.png`

Upload `icon.svg` and download generated files to `public/`

### 2. Sign Your Manifest

After deploying, sign your manifest:

**Option A: Base Build**
1. Go to [base.dev](https://base.dev)
2. Navigate to Preview → Account Association
3. Enter your domain
4. Sign with wallet
5. Copy `accountAssociation` object
6. Paste in `public/.well-known/farcaster.json`

**Option B: Farcaster**
1. Go to [farcaster.xyz](https://farcaster.xyz)
2. Navigate to Developers → Manifest Tool
3. Enter domain (no https://)
4. Generate Account Association
5. Copy and paste in `public/.well-known/farcaster.json`

### 3. Update Domain

Edit `public/.well-known/farcaster.json`:
- Replace `your-domain.com` with your actual domain
- Update `iconUrl` and `homeUrl`

### 4. Deploy & Verify

```bash
vercel
```

Visit `https://your-domain.com/.well-known/farcaster.json` to verify it's accessible.

Documentation: https://docs.base.org/get-started/build-app

## Scoring Criteria

### High Quality Indicators (+points)
- Contract verified on Basescan
- Uses proxy patterns
- Significant bytecode size (>1000 bytes)
- Real on-chain activity
- Multiple interactions from different wallets
- Events emitted
- High verification ratio across wallet

### Airdrop Farming Indicators (-points)
- Bytecode repetition (>3 identical contracts)
- Small bytecode (<200 bytes)
- Low entropy bytecode
- No verification
- Zero or minimal interactions
- No events emitted
- Burst deployments (10+ in 1 minute)
- Similar bytecode patterns
- Mass deployment patterns

## Tech Stack

- Next.js 14 (App Router)
- React Server Components
- TailwindCSS
- viem (Ethereum library)
- TypeScript
- Basescan API

## Improvements

Potential enhancements:

1. **Enhanced Analysis**
   - Integrate with OpenAI for bytecode analysis
   - Add token holder analysis
   - Check for known malicious patterns
   - Analyze gas optimization patterns

2. **Better Discovery**
   - Index more blocks (currently limited to last 1M blocks)
   - Use The Graph or indexer for better performance
   - Cache analysis results

3. **UI Enhancements**
   - Export reports as PDF
   - Compare multiple wallets
   - Historical trends
   - Share analysis links

4. **Additional Metrics**
   - Code complexity analysis
   - Gas usage patterns
   - Time-weighted activity score
   - Network effect (interactions with other contracts)

5. **Integration**
   - Wallet Connect support
   - Multi-chain support
   - API for programmatic access
   - Webhook notifications

## License

MIT
