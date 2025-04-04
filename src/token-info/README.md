# Token Information Retrieval for tama.meme

This directory contains modules for retrieving information about existing tokens on the tama.meme platform.

## Modules

- `getTokenInfo.ts` - Functions for retrieving token pool data and metadata

## Token Data Structure

When you query a token on tama.meme, the platform provides two main types of information:

1. **Pool Data** - Information about the token's liquidity pool, price, and reserves (via `pools_` method)
2. **Token Metadata** - Information about the token's name, symbol, description, etc. (via event logs)

### Pool Data from `pools_` Method

The `pools_` method returns detailed information about a token's liquidity pool:

```typescript
interface TokenPoolInfo {
  token: string;                // Token address
  tokenReserve: bigint;         // Current token reserve
  virtualTokenReserve: bigint;  // Virtual token reserve for calculations
  ethReserve: bigint;           // Current ETH/RON reserve
  virtualEthReserve: bigint;    // Virtual ETH/RON reserve for calculations
  lastPrice: bigint;            // Last traded price
  lastMcapInEth: bigint;        // Last market cap
  lastTimestamp: bigint;        // Last update timestamp
  lastBlock: bigint;            // Last update block
  creator: string;              // Token creator address
  liquidityManager: string;     // Liquidity manager address
  poolId: string;               // Pool ID
  curveConstant: bigint;        // Curve constant parameter
}
```

### Token Metadata from Event Logs

Token metadata is stored in the token creation event logs:

```typescript
interface TokenMetadata {
  name: string;        // Token name
  symbol: string;      // Token symbol
  description: string; // Token description
  extended: string;    // Extended info (JSON string with social links)
  imageUrl: string;    // Token image URL
}
```

## Quick Start

To retrieve information about a token:

```typescript
import { ethers } from 'ethers';
import { getCompleteTokenInfo } from './getTokenInfo';

async function displayTokenInfo() {
  // Connect to Ronin chain
  const provider = new ethers.JsonRpcProvider('https://api.roninchain.com/rpc');
  
  // Example token address (Mochi Inu)
  const tokenAddress = '0x024ac9ebfadf58b9427b97b489b33349c8313b3b';
  
  try {
    // Get both pool data and metadata
    const tokenInfo = await getCompleteTokenInfo(provider, tokenAddress);
    
    // Display basic token info
    console.log('=== Token Information ===');
    console.log(`Name: ${tokenInfo.metadata.name} (${tokenInfo.metadata.symbol})`);
    console.log(`Description: ${tokenInfo.metadata.description}`);
    console.log(`Price: ${tokenInfo.formattedPrice} RON`);
    console.log(`Market Cap: ${tokenInfo.formattedMarketCap} RON`);
    
    // Display liquidity information
    console.log('\n=== Liquidity Information ===');
    console.log(`Token Reserve: ${formatTokenReserve(tokenInfo.poolInfo.tokenReserve)} tokens`);
    console.log(`ETH/RON Reserve: ${ethers.formatEther(tokenInfo.poolInfo.ethReserve)} RON`);
    
    // Display creator
    console.log('\n=== Creator Information ===');
    console.log(`Creator: ${tokenInfo.poolInfo.creator}`);
    console.log(`Created at Block: ${tokenInfo.poolInfo.lastBlock.toString()}`);
    
    return tokenInfo;
  } catch (error) {
    console.error('Error fetching token information:', error);
    throw error;
  }
}
```

## Understanding Pool Information

### Price Calculation

The price of a token is calculated based on the virtual reserves:

```typescript
const price = virtualEthReserve / virtualTokenReserve;
```

This bonding curve algorithm ensures that as more tokens are bought, the price increases, and as more are sold, the price decreases.

### Market Cap Calculation

The market cap is calculated as:

```typescript
const marketCap = price * totalSupply;
```

Where `totalSupply` is typically represented by the `virtualTokenReserve`.

### Curve Constant

The `curveConstant` is a parameter used in the bonding curve formula that determines how quickly the price changes as tokens are bought or sold. It remains constant through all trades.

## Additional Functions

The module provides several helper functions:

- `getTokenPoolInfo` - Gets just the pool data
- `getTokenMetadata` - Gets just the token metadata
- `getCompleteTokenInfo` - Gets both pool data and metadata
- `calculateCurrentPrice` - Calculates current price from pool data
- `formatTokenReserve` - Formats token reserves for display

## Testing

For testing, you can use the Saigon testnet:

```typescript
// Using testnet
const tokenInfo = await getCompleteTokenInfo(provider, tokenAddress, true);
``` 