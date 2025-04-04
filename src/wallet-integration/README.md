# Wallet Integration for tama.meme

This directory contains utilities for integrating crypto wallets with tama.meme platform using React hooks.

## Modules

- `useWagmiSigner.ts` - React hook to convert wagmi wallet clients to ethers.js signers

## Why Use These Hooks?

The tama.meme platform's contract interactions use ethers.js, but modern React dApps often use [wagmi](https://wagmi.sh/) for wallet connections. These hooks bridge the gap, allowing you to:

1. Use wagmi for wallet connections in your React app
2. Convert the wagmi wallet client to an ethers.js signer
3. Use the signer with tama.meme functions

## Usage

```tsx
import { useWagmiSigner } from './useWagmiSigner';
import { createTokenOnContract } from '../token-creation/createToken';
import { useEffect, useState } from 'react';
import { TokenInfo } from '../token-creation/createToken';

function CreateTokenForm() {
  const signer = useWagmiSigner();
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<{ tokenAddress?: string, txHash?: string }>();
  
  // Example token info
  const tokenInfo: TokenInfo = {
    name: "Rakūn Inu",
    symbol: "TANUKI",
    initAmountIn: "0.1",
    description: "This is my awesome memecoin!",
    extended: JSON.stringify({
      twitterUrl: "https://twitter.com/animalplanetca/status/693919291368960004",
      discordUrl: "https://discord.com/invite/moku"
    }),
    tokenUrlImage: "ipfs://QmYourImageHash..."
  };
  
  const handleCreateToken = async () => {
    if (!signer) {
      alert('Please connect your wallet first');
      return;
    }
    
    setIsCreating(true);
    
    try {
      const result = await createTokenOnContract(signer, tokenInfo);
      setResult(result);
    } catch (error) {
      console.error('Error creating token:', error);
      alert(`Failed to create token: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <div>
      <h2>Create New Token</h2>
      <button 
        onClick={handleCreateToken}
        disabled={!signer || isCreating}
      >
        {isCreating ? 'Creating...' : 'Create Token'}
      </button>
      
      {result && (
        <div>
          <h3>Token Created!</h3>
          <p>Token address: {result.tokenAddress}</p>
          <p>Transaction hash: {result.txHash}</p>
        </div>
      )}
    </div>
  );
}
```

## Setting Up Wagmi

To use these hooks, you need to set up wagmi in your React app:

```jsx
import { WagmiConfig, createConfig } from 'wagmi';
import { ronin, roninSaigon } from './chains'; // Custom chain configs for Ronin
import { injectedConnector } from './connectors'; // Your wallet connectors

const config = createConfig({
  chains: [ronin, roninSaigon],
  connectors: [injectedConnector],
});

function App() {
  return (
    <WagmiConfig config={config}>
      <YourApp />
    </WagmiConfig>
  );
}
```

## Note on Chain Configuration

For Ronin chain, you'll need to define custom chain configurations:

```typescript
// chains.ts
import { Chain } from 'wagmi';

export const ronin: Chain = {
  id: 2020,
  name: 'Ronin',
  network: 'ronin',
  nativeCurrency: {
    decimals: 18,
    name: 'RON',
    symbol: 'RON',
  },
  rpcUrls: {
    public: { http: ['https://api.roninchain.com/rpc'] },
    default: { http: ['https://api.roninchain.com/rpc'] },
  },
  blockExplorers: {
    default: { name: 'Ronin Explorer', url: 'https://app.roninchain.com' },
  },
};

export const roninSaigon: Chain = {
  id: 2021,
  name: 'Ronin Saigon Testnet',
  network: 'ronin-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'RON',
    symbol: 'RON',
  },
  rpcUrls: {
    public: { http: ['https://saigon-api.roninchain.com/rpc'] },
    default: { http: ['https://saigon-api.roninchain.com/rpc'] },
  },
  blockExplorers: {
    default: { name: 'Ronin Explorer', url: 'https://saigon-app.roninchain.com' },
  },
  testnet: true,
};
``` 