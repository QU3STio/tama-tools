# Shared Resources for tama.meme

This directory contains shared resources, constants, and configurations used across multiple modules in the tama.meme toolkit.

## Modules

- `constants.ts` - Network configurations, API endpoints, and helper functions
- `abi/` - Smart contract ABIs for interacting with the tama.meme platform

## Constants

The `constants.ts` file provides essential configuration values for working with the tama.meme platform, including:

### Network Configurations

```typescript
export const NETWORK = {
  MAINNET: {
    CONTRACT_ADDRESS: '0xA54b0184D12349Cf65281C6F965A74828DDd9E8F',
    CHAIN_ID: 2020,
    RPC_URL: 'https://api.roninchain.com/rpc',
    EXPLORER_URL: 'https://app.roninchain.com',
  },
  TESTNET: {
    CONTRACT_ADDRESS: '0xfbdb66ce17543b425962be05d4d44d6f0b7f1b94',
    CHAIN_ID: 2021,
    RPC_URL: 'https://saigon-api.roninchain.com/rpc',
    EXPLORER_URL: 'https://saigon-app.roninchain.com',
  },
};
```

### API Endpoints

```typescript
export const API = {
  IPFS_UPLOAD: 'https://tama.meme/api/uploads/ipfs',
  BASE_URL: 'https://tama.meme',
};
```

### Token Creation Recommendations

```typescript
export const TOKEN_CREATION = {
  RECOMMENDED_MIN_AMOUNT: '0.1',
  RECOMMENDED_MAX_AMOUNT: '100',
  RECOMMENDED_IMAGE_DIMENSIONS: {
    WIDTH: 400,
    HEIGHT: 400,
  },
  MAX_IMAGE_SIZE: 1024 * 1024, // 1MB
};
```

### Helper Functions

The module also includes helper functions for generating URLs:

- `getExplorerTxUrl(txHash, isTestnet)` - Get the block explorer URL for a transaction
- `getExplorerTokenUrl(tokenAddress, isTestnet)` - Get the block explorer URL for a token
- `getTamaTokenUrl(tokenAddress)` - Get the tama.meme URL for a token

## Contract ABIs

The `abi/` directory contains the JSON ABI files needed to interact with the tama.meme smart contracts:

- `mainContractAbi.json` - The ABI for the main tama.meme contract

## Usage

Import these shared resources in your code as needed:

```typescript
import { NETWORK, API, TOKEN_CREATION, getExplorerTxUrl } from '../shared/constants';
import mainContractAbi from '../shared/abi/mainContractAbi.json';

// Example: Creating a contract instance
const mainContract = new ethers.Contract(
  NETWORK.MAINNET.CONTRACT_ADDRESS,
  mainContractAbi,
  signer
);

// Example: Getting a transaction URL
const txUrl = getExplorerTxUrl(txHash);
console.log(`View transaction: ${txUrl}`);
``` 