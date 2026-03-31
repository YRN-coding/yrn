import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import * as dotenv from 'dotenv';
dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,
    },
  },
  networks: {
    hardhat: { chainId: 31337 },
    localhost: { url: 'http://127.0.0.1:8545', chainId: 31337 },
    sepolia: {
      url: process.env['SEPOLIA_RPC_URL'] ?? 'https://rpc.sepolia.org',
      accounts: process.env['DEPLOYER_PRIVATE_KEY'] ? [process.env['DEPLOYER_PRIVATE_KEY']] : [],
      chainId: 11155111,
    },
    polygon: {
      url: process.env['POLYGON_RPC_URL'] ?? 'https://polygon-rpc.com',
      accounts: process.env['DEPLOYER_PRIVATE_KEY'] ? [process.env['DEPLOYER_PRIVATE_KEY']] : [],
      chainId: 137,
    },
    bsc: {
      url: process.env['BSC_RPC_URL'] ?? 'https://bsc-dataseed.binance.org',
      accounts: process.env['DEPLOYER_PRIVATE_KEY'] ? [process.env['DEPLOYER_PRIVATE_KEY']] : [],
      chainId: 56,
    },
  },
  paths: { sources: './contracts', tests: './test', cache: './cache', artifacts: './artifacts' },
  typechain: { outDir: 'typechain-types', target: 'ethers-v6' },
  gasReporter: { enabled: process.env['REPORT_GAS'] === 'true', currency: 'USD' },
};

export default config;
