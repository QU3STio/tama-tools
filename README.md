# tama-tools

Tools for [tama.meme](https://tama.meme) for and by the Ronin memecoin community. These are TypeScript code snippets intended to demonstrate interactions with the tama.meme ecosystem.

## 📚 About This Repository

This repository contains educational code examples that demonstrate how to interact with the tama.meme platform on the Ronin blockchain. The primary focus is on providing clear, well-documented examples for developers who want to build applications that integrate with tama.meme.

## 🧩 What's Included

- **Token Creation**: Complete workflow for creating new memecoins on tama.meme
- **Token Information**: Tools for retrieving data about existing tokens
- **IPFS Image Upload**: Examples of uploading token images to IPFS
- **Wallet Integration**: Using ethers.js with wagmi for React frontends
- **Error Handling**: Robust error handling for blockchain interactions
- **Helpful Utilities**: Helper functions and constants

## 📁 Repository Structure

```
tama-tools/
├── docs/                       # Documentation files
│   └── token-creation-flow.md  # Visual guide to token creation
│
├── src/                        # Source code organized by functionality
│   ├── token-creation/         # Token creation modules
│   │   ├── createToken.ts      # Core token creation functionality
│   │   ├── uploadImageToIPFS.ts # IPFS image upload functionality
│   │   ├── createTokenWithImage.ts # Complete token creation workflow
│   │   └── README.md           # Token creation documentation
│   │
│   ├── token-info/             # Token information modules
│   │   ├── getTokenInfo.ts     # Functions to retrieve token data
│   │   └── README.md           # Token information documentation
│   │
│   ├── wallet-integration/     # Wallet integration modules
│   │   ├── useWagmiSigner.ts   # Convert wagmi wallet to ethers.js signer
│   │   └── README.md           # Wallet integration documentation
│   │
│   ├── utils/                  # Utility functions
│   │   ├── errorHandling.ts    # Error handling utilities
│   │   └── README.md           # Utilities documentation
│   │
│   └── shared/                 # Shared resources
│       ├── constants.ts        # Network configurations and constants
│       ├── abi/                # Smart contract ABIs
│       └── README.md           # Shared resources documentation
│
└── README.md                   # This file
```

## 📋 Prerequisites

To use anything in this repo, you will need the following installed via a nodejs package manager:

- [ethers](https://docs.ethers.org/v6/getting-started/) v6 or higher
- [wagmi](https://wagmi.sh/react/getting-started) for React integration

You will also need some basic knowledge of:
- TypeScript
- Blockchain concepts
- [Ronin chain](https://docs.roninchain.com/developers/quickstart) specifics

## 🚀 Getting Started

1. **Clone this repository**
   ```bash
   git clone https://github.com/yourusername/tama-tools.git
   cd tama-tools
   ```

2. **Install dependencies in your project**
   ```bash
   npm install ethers@6 wagmi
   ```

3. **Explore the modules**
   - Each functional area has its own directory with a README.md file
   - Start with the [token creation guide](src/token-creation/README.md) for an example


## 📊 Process Diagrams

Check out the [token-creation-flow.md](docs/token-creation-flow.md) file for a visual representation of the token creation process and detailed explanations of each step. This document includes:

- A flowchart of the entire token creation process
- Detailed explanation of each step
- Code examples for each phase
- Common error handling scenarios

## 📊 Documentation

- [Token Creation Flow](docs/token-creation-flow.md) - Visual guide to the token creation process
- [Token Information System](docs/token-info-explained.md) - Detailed explanation of token data structure

## �� Testing

All tests should be run against the [Saigon testnet](https://saigon-app.roninchain.com/) for Ronin. To understand how to connect with testnet and interact with it, see the [Ronin docs](https://support.roninchain.com/hc/en-us/articles/14035929237787-Accessing-Saigon-Testnet).

The main contract for tama.meme on Saigon testnet is: `0xfbdb66ce17543b425962be05d4d44d6f0b7f1b94`

## ⚠️ Important Notes

As a reminder, these snippets are not production ready and should not be deployed as-is. These are intended to assist the community in creating your own apps. Use this to gain a better technical understanding of tama.meme.

The main contract for tama.meme on Ronin mainnet is: `0xA54b0184D12349Cf65281C6F965A74828DDd9E8F`

## 🤝 Contributing

We welcome contributions from the community! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) guide for details on our code of conduct, the process for submitting pull requests, and how to get started.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## 🔍 Code Examples

### Creating a Token

```typescript
import { JsonRpcSigner } from 'ethers';
import { createTokenWithImage } from './src/token-creation/createTokenWithImage';

async function createMyToken(signer: JsonRpcSigner, imageFile: File) {
  try {
    const result = await createTokenWithImage(
      signer,
      imageFile,
      {
        name: "Rakūn Inu",
        symbol: "TANUKI",
        initAmountIn: "0.1",
        description: "This is my awesome memecoin!",
        extended: JSON.stringify({
          twitterUrl: "https://twitter.com/animalplanetca/status/693919291368960004",
          discordUrl: "https://discord.com/invite/moku"
        })
      }
    );
    
    console.log(`Token created at: ${result.tokenAddress}`);
    console.log(`Transaction hash: ${result.txHash}`);
    console.log(`Image URL: ${result.imageUrl}`);
  } catch (error) {
    console.error("Token creation failed:", error.message);
  }
}
```

### Retrieving Token Information

```typescript
import { ethers } from 'ethers';
import { getCompleteTokenInfo } from './src/token-info/getTokenInfo';

async function fetchTokenInfo() {
  // Connect to Ronin chain
  const provider = new ethers.JsonRpcProvider('https://api.roninchain.com/rpc');
  
  // Example token address (Mochi Inu)
  const tokenAddress = '0x024ac9ebfadf58b9427b97b489b33349c8313b3b';
  
  try {
    // Get token information including pool data and metadata
    const tokenInfo = await getCompleteTokenInfo(provider, tokenAddress);
    
    // Display token information
    console.log(`Token: ${tokenInfo.metadata.name} (${tokenInfo.metadata.symbol})`);
    console.log(`Price: ${tokenInfo.formattedPrice} RON`);
    console.log(`Market Cap: ${tokenInfo.formattedMarketCap} RON`);
    console.log(`Creator: ${tokenInfo.poolInfo.creator}`);
    
    // Parse extended information (social links, etc.)
    const extended = JSON.parse(tokenInfo.metadata.extended);
    if (extended.twitterUrl) {
      console.log(`Twitter: ${extended.twitterUrl}`);
    }
    
    return tokenInfo;
  } catch (error) {
    console.error("Failed to fetch token info:", error.message);
  }
}
```
