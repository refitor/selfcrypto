import { configureChains, createConfig } from '@wagmi/core';
import { goerli, sepolia, arbitrum, avalanche, mainnet, polygon } from '@wagmi/core/chains';
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/html';

// 1. Define constants
const projectId = '2aca272d18deb10ff748260da5f78bfd';
if (!projectId) {
  throw new Error('You need to provide VITE_PROJECT_ID env variable');
}

export const web3chains = [goerli, sepolia, mainnet, polygon, avalanche, arbitrum];

// 2. Configure wagmi client
const { publicClient } = configureChains(web3chains, [w3mProvider({ projectId })]);
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ web3chains, version: 1, projectId }),
  publicClient,
});

// 3. Create ethereum and modal clients
export const ethereumClient = new EthereumClient(wagmiConfig, web3chains);
export const web3Modal = new Web3Modal(
  {
    projectId,
    walletImages: {
      safe: 'https://pbs.twimg.com/profile_images/1566773491764023297/IvmCdGnM_400x400.jpg',
    },
  },
  ethereumClient
);

