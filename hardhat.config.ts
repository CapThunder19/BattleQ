import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    // Arbitrum Sepolia
    arbitrumSepolia: {
      url: process.env.ARBITRUM_SEPOLIA_RPC || "https://sepolia-rollup.arbitrum.io/rpc",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 421614,
    },
    // Arbitrum One (mainnet)
    arbitrumOne: {
      url: process.env.ARBITRUM_ONE_RPC || "https://arb1.arbitrum.io/rpc",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 42161,
    },
    // Robinhood Testnet
    robinhoodTestnet: {
      url: process.env.ROBINHOOD_TESTNET_RPC || "https://testnet.chain.robinhood.com/rpc",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: Number(process.env.ROBINHOOD_CHAIN_ID || 1337),
    },
  },
  etherscan: {
    apiKey: {
      arbitrumSepolia: process.env.ARBISCAN_API_KEY || "",
      arbitrumOne: process.env.ARBISCAN_API_KEY || "",
      // Robinhood testnet may have a different explorer
      robinhoodTestnet: process.env.ROBINHOOD_EXPLORER_API_KEY || "",
    },
    customChains: [
      {
        network: "robinhoodTestnet",
        chainId: Number(process.env.ROBINHOOD_CHAIN_ID || 1337),
        urls: {
          apiURL: process.env.ROBINHOOD_EXPLORER_API || "https://explorer.robinhood.com/api",
          browserURL: process.env.ROBINHOOD_EXPLORER || "https://explorer.robinhood.com",
        },
      },
    ],
  },
};

export default config;
