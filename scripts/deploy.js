const hre = require("hardhat");

async function main() {
  console.log("Deploying BTQToken...");

  const BTQToken = await hre.ethers.getContractFactory("BTQToken");
  const btq = await BTQToken.deploy();

  await btq.waitForDeployment();

  const network = await hre.ethers.provider.getNetwork();

  const deployedAddress = await btq.getAddress();
  console.log("✅ BTQToken deployed to:", deployedAddress);
  console.log(`\n   Network: ${network.name}\n   Chain ID: ${network.chainId}\n`);
  console.log(`Add to .env.local:\nNEXT_PUBLIC_BTQ_ADDRESS=${deployedAddress}\nNEXT_PUBLIC_BTQ_RATE_NATIVE_PER_BTQ=0.001`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
