# BATTLEQ: Tactical Arena 🛡️

**BattleQ** is a high-octane tactical grid-based strategy game. Navigate through shifting sectors, manage high-stakes energy reserves, and extract rare treasures in a high-fidelity "Cyber-Cinematic" environment.

![BattleQ Banner](https://img.shields.io/badge/BattleQ-Cyber--Tactical-00f2ff)
![License](https://img.shields.io/badge/Status-Operational-green)
![Tech](https://img.shields.io/badge/Built%20with-Next.js%20%7C%20Socket.io-black)

## 🕹️ Core Gameplay Mechanics

### 1. Solo Extraction (The Hunt)
*   **Mission Sync**: Lock your credits before entering a sector. Stake 10 credits per level.
*   **Tactical Grid**: Navigate a dynamic grid (`3x3` to `10x10`) to find the hidden treasure.
*   **Energy Management**: Every scan costs charge. Run out of energy, and your stake is **liquidated**.
*   **3D Interaction**: On-click reveals feature a 3D chest opening animation with particle bursts.

### 2. High-Stakes Rewards
*   **Yield Curve**: Successfully extracting treasures returns your stake plus a level-based bonus.
    *   *Level 1*: Stake 10 → Yield **20**
    *   *Level 2*: Stake 20 → Yield **35**
*   **Liquidated Assets**: Failing a mission results in a "Disturbing" system failure screen and forfeiture of staked credits.

### 3. Progressive Difficulty
*   **Trap Detection**: Levels 2+ introduce trap tiles that drain double energy.
*   **Fake Signals**: Multiple fake treasures appear as you advance.
*   **Dynamic Scaling**: Grid size and scan success ratios tighten as you climb the ranks.

---

## 👤 Operative Profile & Intelligence
*   **Strategic Mission Log**: Track your last 5 operations with detailed results and rewards.
*   **Tactical Win Ratio**: Real-time calculation of your success percentage.
*   **Rank Progression**: Advance from **Sector Scout** to **Elite Guard** and **Centurion Prime**.
*   **Global Score**: Persistent credit tracking with rank-based tiering.

---

## 🚀 Technical Stack

*   **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/).
*   **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) with deep mission history persistence.
*   **Animation Engine**: Complex 3D CSS transforms and SVG-based glitch filters.
*   **Icons**: [Lucide React](https://lucide.dev/).
*   **Backend**: Node.js & Socket.io (for future multiplayer scalability).
 
## ✨ Latest Features

- **Real-time Duel Mode (Multiplayer)** — Shared chest grid duels with turn-based reveals, room codes, matchmaking, stake locking, and pot payouts.
- **Stake & Betting System** — Create or join rooms with BQT stakes (configurable between 50–200); both players must confirm the room stake before matches start.
- **Magnifier (Peek) Mechanic** — Scan a chest without opening it using magnifier charges earned in-game.
- **Solo Engine Enhancements** — Dynamic grid scaling, fake treasures, trap tiles, adaptive moves, practice stakes for early levels, and per-session run history with rewards/penalties.
- **AI & Behavior Engines** — Server-side bots and behavioral shaping (near-win nudges) to improve pacing and retention.
- **Dealer Solo Rounds** — Dealer-driven solo hint rounds with wagered actions and immediate dealer responses via sockets.
- **Dedicated Game Server** — Separate Express + Socket.IO engine (default socket port `3001`) handling duel/solo modes, confirmations, timers, and cleanup.

---

## 🛠️ Setup & Operations

### 1. Intelligence Installation
Clone the repository and install tactical dependencies:
```bash
npm install
```

### 2. Launch Operational Console (Client)
Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to begin your mission.

---

## 🧪 Development

- **Install**: Clone the repo and install dependencies:
```bash
git clone <repo-url>
cd BattleQ
npm install
```

- **Environment**: Create a file named `.env.local` in the project root and set the client socket URL:
```
NEXT_PUBLIC_SOCKET_URL=http://127.0.0.1:3001
```
The frontend reads `NEXT_PUBLIC_SOCKET_URL` at runtime to connect to the game server.

**Optional server environment variables** (used by the standalone game server):
```
# Socket server port (defaults to 3001)
SOCKET_PORT=3001

# CORS origins for Socket.IO (comma-separated or `*`)
SOCKET_CORS_ORIGIN=http://localhost:3000

# Alternative variable names the server checks
PORT=3001
CORS_ORIGIN=http://localhost:3000
```
Set `NEXT_PUBLIC_SOCKET_URL` to the public address where the socket server is reachable (for local dev `http://127.0.0.1:3001`).

- **Run (development)**: Start both the Next.js app and the game server concurrently:
```bash
npm run dev
```
This runs Next.js on port `3000` and the local game server (via `tsx`) on port `3001` as defined by the `dev:next` and `dev:server` scripts in `package.json`.

- **Run server only (dev)**:
```bash
npm run dev:server
```

- **Build & Start (production-like)**:
```bash
npm run build:all
npm run start
```

---

## 📂 Project Structure

```text
├── src/
│   ├── app/            # Tactical Routes (Lobby, Arena, Profile)
│   ├── components/     
│   │   ├── solo/       # Mission Logic (Grid, Staking, Loss/Win Cards)
│   │   ├── wallet/     # Web3 (Connect Wallet, Buy BTQ)
│   │   └── ui/         # Glass-Panel Design System
│   ├── store/          # Global Persistence & Difficulty Logic
│   └── lib/            # User & Contract Protocols
├── contracts/
│   └── BTQToken.sol    # ERC20 token + buy() function
├── scripts/
│   └── deploy.ts       # Multi-chain deployment
├── hardhat.config.ts   # Hardhat config (Arbitrum + Robinhood)
└── public/
```

---

## 🪙 Web3 & BTQ Token System

**BTQ** is BattleQ's in-game token used for staking and matches. Users can purchase BTQ with testnet currency at a rate of:

- **1 BTQ = 0.001 native testnet token**  
- Supported chains: **Arbitrum Sepolia**, **Arbitrum One**, **Robinhood Testnet**

### Connect Wallet & Buy BTQ

1. Navigate to the **Lobby** → click **Connect Wallet** (top-right)
2. Select your wallet and approve connection
3. Go to **Profile** → scroll to "Web3 Wallet" section
4. Set desired BTQ amount and click **Buy**
5. Confirm transaction in your wallet
6. BTQ tokens appear in your account and can be used for game stakes

### Smart Contract (BTQToken.sol)

- **ERC20 standard** token with burnable support
- **`buy()`** function allows users to swap native tokens for BTQ
- **Rate** set to `1e15 wei` (0.001 ETH/testnet) by default per BTQ
- **Owner-only** rate and withdrawal functions

### Deploy to Testnet

```bash
# Set up .env.local with PRIVATE_KEY and RPC URLs (see .env.example)
npm install

# Deploy to Arbitrum Sepolia
npm run deploy:arbitrum-sepolia

# Deploy to Arbitrum One
npm run deploy:arbitrum-one

# Deploy to Robinhood Testnet
npm run deploy:robinhood
```

After deployment, copy the contract address to `.env.local`:
```
NEXT_PUBLIC_BTQ_ADDRESS=0x...
```

### Wagmi + RainbowKit

- **WalletProvider** wraps the app with `WagmiConfig` and `RainbowKitProvider`
- **ConnectWallet** button auto-detects connected chains and wallet address
- **BuyBTQ** component reads `NEXT_PUBLIC_BTQ_ADDRESS` and `NEXT_PUBLIC_BTQ_RATE_NATIVE_PER_BTQ` from env
- Wallet address stored in localStorage as the player ID for differentiation

---

## ⚠️ Tactical Warning
This is a high-stakes environment. Unauthorized disconnects or energy depletion will result in immediate asset liquidation.

**Status: READY FOR DEPLOYMENT.**
