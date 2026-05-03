// Load .env.local if present, otherwise .env
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
dotenv.config();
const { ethers } = require('ethers');

const ARB_RPC = process.env.ARBITRUM_SEPOLIA_RPC;
const ROBIN_RPC = process.env.ROBINHOOD_TESTNET_RPC;
const PK = process.env.PRIVATE_KEY;

const ADDR_ARB = process.env.NEXT_PUBLIC_BTQ_ADDRESS_ARBITRUM_SEPOLIA;
const ADDR_ROBIN = process.env.NEXT_PUBLIC_BTQ_ADDRESS_ROBINHOOD_TESTNET;
const RATE = process.env.NEXT_PUBLIC_BTQ_RATE_NATIVE_PER_BTQ || '0.001';

const ABI = [
  'function buy() payable',
  'function balanceOf(address) view returns (uint256)'
];

async function buyOne(rpc, contractAddress, label) {
  if (!rpc || !contractAddress || !PK) {
    console.log(`[${label}] Missing config (rpc/address/private key). Skipping.`);
    return;
  }

  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(PK, provider);
  const contract = new ethers.Contract(contractAddress, ABI, wallet);

  const owner = await wallet.getAddress();
  const before = await contract.balanceOf(owner);
  console.log(`[${label}] Balance before: ${ethers.formatUnits(before, 18)} BTQ`);

  const value = ethers.parseEther(String(RATE));
  console.log(`[${label}] Sending ${RATE} native (${value.toString()} wei) to buy()...`);

  const tx = await contract.buy({ value });
  console.log(`[${label}] Tx sent: ${tx.hash}`);
  await tx.wait();

  const after = await contract.balanceOf(owner);
  console.log(`[${label}] Balance after: ${ethers.formatUnits(after, 18)} BTQ`);
}

async function main() {
  console.log('Running buy tests...');
  await buyOne(ARB_RPC, ADDR_ARB, 'ArbitrumSepolia');
  await buyOne(ROBIN_RPC, ADDR_ROBIN, 'RobinhoodTestnet');
  console.log('Buy tests complete.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
