const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying SecureFileRegistry smart contract to local network...");

  const SecureFileRegistry = await hre.ethers.getContractFactory("SecureFileRegistry");
  const registry = await SecureFileRegistry.deploy();
  await registry.waitForDeployment();

  const contractAddress = await registry.getAddress();
  console.log("SecureFileRegistry deployed to:", contractAddress);

  // Export contract address and ABI for backend and frontend consumption
  const contractArtifact = await hre.artifacts.readArtifact("SecureFileRegistry");
  const deploymentData = {
    address: contractAddress,
    network: hre.network.name,
    deployedAt: new Date().toISOString(),
    abi: contractArtifact.abi
  };

  const outputDir = path.join(__dirname, "..", "deployed");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, "contract-deployment.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentData, null, 2));
  console.log("Saved deployment metadata to:", outputPath);

  // Also copy to backend resources if directory exists
  const backendResourceDir = path.join(__dirname, "..", "..", "backend", "src", "main", "resources");
  if (fs.existsSync(backendResourceDir)) {
    fs.writeFileSync(path.join(backendResourceDir, "contract-deployment.json"), JSON.stringify(deploymentData, null, 2));
    console.log("Synced contract address to backend resources!");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
