import { ethers } from "hardhat";

async function main() {
  console.log("Deploying BTQToken...");

  const BTQToken = await ethers.getContractFactory("BTQToken");
  const btq = await BTQToken.deploy();

  await btq.deployed();

  console.log("✅ BTQToken deployed to:", btq.address);
  console.log(`
   Network: ${(await ethers.provider.getNetwork()).name}
   Chain ID: ${(await ethers.provider.getNetwork()).chainId}
   
   Add to .env.local:
   NEXT_PUBLIC_BTQ_ADDRESS=${btq.address}
   NEXT_PUBLIC_BTQ_RATE_NATIVE_PER_BTQ=0.001
  `);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
