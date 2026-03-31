import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);
  console.log('Account balance:', ethers.formatEther(await deployer.provider.getBalance(deployer.address)), 'ETH');

  // Deploy AquaToken
  console.log('\nDeploying AquaToken...');
  const AquaToken = await ethers.getContractFactory('AquaToken');
  const aquaToken = await AquaToken.deploy(deployer.address);
  await aquaToken.waitForDeployment();
  const aquaTokenAddress = await aquaToken.getAddress();
  console.log('AquaToken deployed to:', aquaTokenAddress);

  // Deploy AquaVault
  console.log('\nDeploying AquaVault...');
  const AquaVault = await ethers.getContractFactory('AquaVault');
  const aquaVault = await AquaVault.deploy(aquaTokenAddress, deployer.address);
  await aquaVault.waitForDeployment();
  const aquaVaultAddress = await aquaVault.getAddress();
  console.log('AquaVault deployed to:', aquaVaultAddress);

  // Deploy AquaSwapRouter
  console.log('\nDeploying AquaSwapRouter...');
  const AquaSwapRouter = await ethers.getContractFactory('AquaSwapRouter');
  const swapRouter = await AquaSwapRouter.deploy(deployer.address, deployer.address);
  await swapRouter.waitForDeployment();
  const swapRouterAddress = await swapRouter.getAddress();
  console.log('AquaSwapRouter deployed to:', swapRouterAddress);

  // Grant minting rights to vault
  await aquaToken.addMinter(aquaVaultAddress);
  console.log('\nGranted minting rights to AquaVault');

  console.log('\n=== Deployment Summary ===');
  console.log(`AquaToken:      ${aquaTokenAddress}`);
  console.log(`AquaVault:      ${aquaVaultAddress}`);
  console.log(`AquaSwapRouter: ${swapRouterAddress}`);
  console.log('==========================\n');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
