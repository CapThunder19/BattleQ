# BattleQ Web3 Integration Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env.local` and fill in:
```bash
cp .env.example .env.local
```

Key variables:
- `PRIVATE_KEY` — Testnet wallet private key for deployments
- `NEXT_PUBLIC_BTQ_ADDRESS` — Deployed contract address
- `NEXT_PUBLIC_BTQ_RATE_NATIVE_PER_BTQ` — Exchange rate (default: 0.001)
- RPC URLs for each chain

### 3. Deploy BTQ Token to Testnet

#### Arbitrum Sepolia
```bash
npm run deploy:arbitrum-sepolia
```

#### Arbitrum One (mainnet)
```bash
npm run deploy:arbitrum-one
```

#### Robinhood Testnet
```bash
npm run deploy:robinhood
```

After deployment, add the contract address to `.env.local`:
```
NEXT_PUBLIC_BTQ_ADDRESS=0x<contract-address>
```

### 4. Run Application
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000), connect your wallet, and buy BTQ!

---

## Architecture

### Frontend (Next.js 15 + React 19)

**Providers:**
- `WalletProvider` — Wraps app with Wagmi + RainbowKit
- Supports Arbitrum Sepolia, Arbitrum One, and Robinhood testnet (configurable via env)

**Components:**
- `ConnectWallet` — RainbowKit button; auto-saves wallet address to localStorage as player ID
- `BuyBTQ` — Purchase BTQ tokens; reads contract address and rate from env; uses wagmi hooks

**Pages:**
- `Lobby` — Shows Connect Wallet button in header
- `Profile` — Wallet status, BTQ balance, Buy BTQ form

### Smart Contract (Solidity 0.8.20)

**BTQToken.sol:**
- ERC20 token (OpenZeppelin)
- `buy()` payable function: swap native → BTQ at configured rate
- Owner can update rate and withdraw accumulated native currency
- Default rate: 1 BTQ = 0.001 native token (adjustable)

**Deployment:**
- Hardhat scripts deploy to multiple chains
- Uses environment variables for RPC URLs and keys

---

## Supported Chains

| Chain | Chain ID | RPC | Testnet |
|-------|----------|-----|---------|
| Arbitrum Sepolia | 421614 | `https://sepolia-rollup.arbitrum.io/rpc` | ✅ |
| Arbitrum One | 42161 | `https://arb1.arbitrum.io/rpc` | ❌ |
| Robinhood Testnet | `ROBINHOOD_CHAIN_ID` | `ROBINHOOD_TESTNET_RPC` | ✅ |

---

## Player Differentiation

When a user connects a wallet:
1. `ConnectWallet` component captures wallet address
2. Address is formatted as short string (e.g., `0x1234...abcd`)
3. Stored in `localStorage` as `battleq_user`
4. Replaces guest ID; used throughout the game as player identifier
5. Smart contract tracks tokens per wallet address

---

## Rate & Economics

**Default:** 1 BTQ = 0.001 testnet native token

Example:
- User sends 0.1 testnet → receives 100 BTQ
- User sends 1 testnet → receives 1000 BTQ

To adjust rate after deployment:
```javascript
const rate = ethers.utils.parseEther("0.002"); // 1 BTQ = 0.002 native
await btqContract.setRate(rate);
```

---

## Testing Locally

1. Use a testnet faucet to get test tokens (e.g., Arbitrum Sepolia faucet)
2. Deploy BTQ to testnet via `npm run deploy:arbitrum-sepolia`
3. Add contract address to `.env.local`
4. Run dev server: `npm run dev`
5. Connect wallet in browser; buy BTQ to test

---

## Troubleshooting

### "Wallet not connected"
- Click **Connect Wallet** in Lobby header
- Select wallet and approve connection

### "Contract not configured"
- Verify `NEXT_PUBLIC_BTQ_ADDRESS` is set in `.env.local`
- Ensure contract is deployed to the connected chain

### "Insufficient funds"
- Get testnet tokens from official faucet (e.g., [Arbitrum Sepolia Faucet](https://faucet.arbitrum.io))

### Transaction fails
- Check gas balance
- Verify RPC endpoint is working
- Ensure account has deployment permissions (for `setRate` or `withdraw`)

---

## Environment Variables Reference

```bash
# Frontend
NEXT_PUBLIC_SOCKET_URL=http://127.0.0.1:3001
NEXT_PUBLIC_BTQ_ADDRESS=0x...
NEXT_PUBLIC_BTQ_RATE_NATIVE_PER_BTQ=0.001
NEXT_PUBLIC_ROBINHOOD_CHAIN_ID=1337
NEXT_PUBLIC_ROBINHOOD_RPC=https://testnet.chain.robinhood.com/rpc
NEXT_PUBLIC_ROBINHOOD_EXPLORER=https://explorer.robinhood.com

# Deployment
PRIVATE_KEY=your_testnet_key
ARBITRUM_SEPOLIA_RPC=https://sepolia-rollup.arbitrum.io/rpc
ARBITRUM_ONE_RPC=https://arb1.arbitrum.io/rpc
ROBINHOOD_TESTNET_RPC=https://testnet.chain.robinhood.com/rpc
ROBINHOOD_CHAIN_ID=1337

# Explorers (optional, for verification)
ARBISCAN_API_KEY=
ROBINHOOD_EXPLORER_API_KEY=
```

---

## Next Steps

- **Testnet Testing** — Deploy to all three testnets, run E2E tests
- **Mainnet Ready** — Prepare for Arbitrum One production deployment
- **Player Wallets** — Integrate wallet history & asset tracking
- **Staking Contracts** — Build escrow for match stakes
