# Token Creation for tama.meme

This directory contains modules for creating new tokens on the tama.meme platform using the Ronin blockchain.

## Modules

- `createToken.ts` - Core functionality for creating tokens via the smart contract
- `uploadImageToIPFS.ts` - Handles uploading token images to IPFS
- `createTokenWithImage.ts` - Complete workflow combining image upload and token creation

## Quick Start

For a complete token creation process, use the `createTokenWithImage` function:

```typescript
import { JsonRpcSigner } from 'ethers';
import { createTokenWithImage } from './createTokenWithImage';

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
    
    return result;
  } catch (error) {
    console.error("Token creation failed:", error.message);
    throw error;
  }
}
```

## Process Flow

1. **Upload Image to IPFS**
   - Authenticate with tama.meme
   - Upload image file
   - Receive IPFS URL

2. **Create Token on Blockchain**
   - Connect wallet
   - Prepare token metadata
   - Calculate fees
   - Submit transaction
   - Get token address

## Parameters

### Token Information

| Parameter | Description | Example |
|-----------|-------------|---------|
| `name` | Full name of your token | `"Rakūn Inu"` |
| `symbol` | Trading symbol | `"TANUKI"` |
| `initAmountIn` | Initial liquidity in RON | `"0.1"` |
| `description` | Token description | `"This is my awesome memecoin!"` |
| `extended` | JSON string with links | `JSON.stringify({twitterUrl: "...", discordUrl: "..."})` |

### Other Parameters

- `signer`: An ethers.js JsonRpcSigner from a connected wallet
- `imageFile`: A File object for the token image (from file input)
- `isTestnet`: Boolean flag to use Saigon testnet instead of mainnet (default: false)

## Error Handling

The modules use the `TokenCreationError` class from `../utils/errorHandling.ts` for consistent error handling. Common errors include:

- Authentication failures
- Upload failures
- Insufficient funds
- Transaction rejections
- Network errors

## Testing

For testing, use the Saigon testnet by setting the `isTestnet` parameter to `true`:

```typescript
const result = await createTokenWithImage(
  signer,
  imageFile,
  tokenDetails,
  true // Use testnet
);
```

## Learn More

For a visual representation of the token creation process, see the [token-creation-flow.md](../../docs/token-creation-flow.md) document in the docs directory. 