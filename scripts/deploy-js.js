const hre = require("hardhat");

async function main() {
  console.log("Deploying BTQToken (JS wrapper)...");

  const BTQToken = await hre.ethers.getContractFactory("BTQToken");
  const btq = await BTQToken.deploy();

  // Support both ethers v5 (deployed) and ethers v6 (waitForDeployment)
  if (typeof btq.deployed === "function") {
    await btq.deployed();
  } else if (typeof btq.waitForDeployment === "function") {
    await btq.waitForDeployment();
  }

  // Determine address for ethers v5/v6 compatibility
  const deployedAddress = btq.address || btq.target || (typeof btq.getAddress === 'function' ? await btq.getAddress() : undefined);
  console.log("✅ BTQToken deployed to:", deployedAddress);
  const network = await hre.ethers.provider.getNetwork();
  console.log(`\n   Network: ${network.name}\n   Chain ID: ${network.chainId}\n`);
  console.log(`Add to .env.local:\nNEXT_PUBLIC_BTQ_ADDRESS=${deployedAddress}\nNEXT_PUBLIC_BTQ_RATE_NATIVE_PER_BTQ=0.001\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
