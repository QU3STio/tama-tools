# Understanding Token Information on tama.meme

This document explains how token information is stored and retrieved from the tama.meme platform, including technical details about the pool data structure and how to interpret the values.

## Overview

Tokens on tama.meme consist of two main components:

1. **Pool Data** - Contains the token's liquidity pool information, pricing data, and technical parameters
2. **Metadata** - Contains human-readable information like name, symbol, description, and links

## Pool Data Structure

The main contract has a mapping called `pools_` that stores information about each token's pool. This can be queried with the token's address:

```solidity
mapping(address => Pool) public pools_;
```

### Pool Struct

The pool data is structured as follows:

```
token
(address): The address of the token contract

tokenReserve
(uint256): The actual reserve of tokens in the pool

virtualTokenReserve
(uint256): Virtual token reserve used for price calculations

ethReserve
(uint256): The actual reserve of ETH/RON in the pool

virtualEthReserve
(uint256): Virtual ETH/RON reserve used for price calculations

lastPrice
(uint256): Last calculated price of the token

lastMcapInEth
(uint256): Last calculated market cap in ETH/RON

lastTimestamp
(uint256): Timestamp of the last update to the pool

lastBlock
(uint256): Block number of the last update to the pool

creator
(address): Address of the token creator

liquidityManager
(address): Address of the liquidity manager (if applicable)

poolId
(address): Pool ID (if applicable)

curveConstant
(uint256): The curve constant parameter used in the bonding curve formula
```

## Understanding Key Values

### Reserves vs. Virtual Reserves

Each pool has both real and virtual reserves:

- **Real Reserves** (`tokenReserve` and `ethReserve`): The actual amounts of tokens and ETH/RON in the pool
- **Virtual Reserves** (`virtualTokenReserve` and `virtualEthReserve`): Adjusted values used for price calculations

Virtual reserves are used in the bonding curve formula to prevent extreme price volatility and provide a smoother trading experience.

### Price Calculation

The price is calculated using the virtual reserves:

```
Price = virtualEthReserve / virtualTokenReserve
```

This means that as tokens are bought:
- The `virtualEthReserve` increases
- The `virtualTokenReserve` decreases
- The price increases

And as tokens are sold:
- The `virtualEthReserve` decreases
- The `virtualTokenReserve` increases
- The price decreases

### Curve Constant

The `curveConstant` is a parameter in the bonding curve formula that determines how quickly the price changes with trades. It remains constant throughout the life of the token and is set at token creation.

The bonding curve formula is:

```
virtualEthReserve * virtualTokenReserve = curveConstant
```

This formula ensures that the product of the virtual reserves remains constant through all trades.

### Market Cap Calculation

The market cap is calculated by multiplying the price by the token supply:

```
Market Cap = Price * virtualTokenReserve
```

## Retrieving Token Metadata

While the pool data contains technical information, the human-readable metadata is stored in the token creation event logs.

### TokenCreated Event

When a token is created, the contract emits a `TokenCreated` event with the following parameters:

```solidity
event TokenCreated(
    address indexed creator,
    address indexed token,
    string name,
    string symbol,
    string description,
    string extended,
    string tokenUrlImage
);
```

To retrieve this metadata, you need to:

1. Query past events from the main contract
2. Filter for `TokenCreated` events where the token address matches
3. Extract the metadata from the event arguments

## Code Example

Here's how to retrieve and interpret token information:

```typescript
import { ethers } from 'ethers';
import { getCompleteTokenInfo } from '../src/token-info/getTokenInfo';

async function analyzeToken() {
  // Connect to Ronin chain
  const provider = new ethers.JsonRpcProvider('https://api.roninchain.com/rpc');
  
  // Example token address
  const tokenAddress = '0x024ac9ebfadf58b9427b97b489b33349c8313b3b'; // Mochi Inu
  
  // Get complete token information
  const tokenInfo = await getCompleteTokenInfo(provider, tokenAddress);
  
  // Basic information
  console.log(`\n=== ${tokenInfo.metadata.name} (${tokenInfo.metadata.symbol}) ===`);
  console.log(`Description: ${tokenInfo.metadata.description}`);
  console.log(`Creator: ${tokenInfo.poolInfo.creator}`);
  
  // Price and market cap
  console.log(`\n=== Market Data ===`);
  console.log(`Current Price: ${tokenInfo.formattedPrice} RON`);
  console.log(`Market Cap: ${tokenInfo.formattedMarketCap} RON`);
  
  // Pool analysis
  console.log(`\n=== Pool Analysis ===`);
  
  // Format reserves for readability
  const tokenReserve = Number(ethers.formatEther(tokenInfo.poolInfo.tokenReserve));
  const ethReserve = Number(ethers.formatEther(tokenInfo.poolInfo.ethReserve));
  const virtualTokenReserve = Number(ethers.formatEther(tokenInfo.poolInfo.virtualTokenReserve));
  const virtualEthReserve = Number(ethers.formatEther(tokenInfo.poolInfo.virtualEthReserve));
  
  console.log(`Token Reserve: ${tokenReserve.toLocaleString()} tokens`);
  console.log(`ETH/RON Reserve: ${ethReserve.toLocaleString()} RON`);
  console.log(`Virtual Token Reserve: ${virtualTokenReserve.toLocaleString()} tokens`);
  console.log(`Virtual ETH/RON Reserve: ${virtualEthReserve.toLocaleString()} RON`);
  
  // Verify the curve constant
  const calculatedConstant = virtualTokenReserve * virtualEthReserve;
  const actualConstant = Number(ethers.formatEther(tokenInfo.poolInfo.curveConstant));
  console.log(`\n=== Bonding Curve Verification ===`);
  console.log(`Calculated Constant: ${calculatedConstant.toExponential(5)}`);
  console.log(`Actual Constant: ${actualConstant.toExponential(5)}`);
  
  // Analysis of social links
  const extended = JSON.parse(tokenInfo.metadata.extended);
  console.log(`\n=== Social Links ===`);
  if (extended.twitterUrl) console.log(`Twitter: ${extended.twitterUrl}`);
  if (extended.discordUrl) console.log(`Discord: ${extended.discordUrl}`);
  
  return tokenInfo;
}
```

## Price Impact Analysis

When trading on tama.meme, the price impact depends on the size of the trade relative to the pool's reserves. The larger the trade, the greater the price impact.

You can calculate the estimated price impact for a buy or sell:

```typescript
function calculateBuyPriceImpact(poolInfo, ethAmount) {
  const newVirtualEthReserve = Number(poolInfo.virtualEthReserve) + Number(ethAmount);
  const newVirtualTokenReserve = Number(poolInfo.curveConstant) / newVirtualEthReserve;
  const tokensReceived = Number(poolInfo.virtualTokenReserve) - newVirtualTokenReserve;
  
  const currentPrice = Number(poolInfo.virtualEthReserve) / Number(poolInfo.virtualTokenReserve);
  const newPrice = newVirtualEthReserve / newVirtualTokenReserve;
  
  const priceImpact = ((newPrice - currentPrice) / currentPrice) * 100;
  return {
    tokensReceived,
    priceImpact
  };
}
```

## Conclusion

Understanding how token information is stored and retrieved is essential for developers building applications on the tama.meme platform. By analyzing the pool data, you can determine:

- Current token price and market cap
- Liquidity depth and trading impact
- Historical performance
- Token metadata and social links

For more detailed information on interacting with token data, see the [token-info](../src/token-info) module documentation. 