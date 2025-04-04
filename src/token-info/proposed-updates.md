# Proposed Updates to Token Info Module

This document outlines proposed updates to fix the "cannot get more than 500 blocks" error when retrieving token information.

## Problem

The current implementation attempts to query for token creation events by looking back 10,000 blocks from the current block. This exceeds the Ronin RPC node's limit of 500 blocks per query, resulting in the error:

```
invalid param: invalid getLogs request, cannot get more than 500 blocks
```

## Solution

To solve this issue, we need to modify the `getTokenMetadata` function to:

1. Accept an optional `fromBlock` parameter to specify where to start searching
2. If not provided, use a strategy to find the token's creation block
3. Use pagination to query blocks in smaller chunks if needed

## Proposed Changes to getTokenMetadata

```typescript
/**
 * Gets token metadata from the token creation event logs
 * 
 * @param provider - An ethers.js Provider or Signer
 * @param tokenAddress - The address of the token to query
 * @param isTestnet - Whether to use testnet (default: false)
 * @param fromBlock - Optional starting block for event query (default: calculated)
 * @returns Promise resolving to TokenMetadata
 */
export async function getTokenMetadata(
  provider: Provider | JsonRpcSigner,
  tokenAddress: string,
  isTestnet = false,
  fromBlock?: number
): Promise<TokenMetadata> {
  // Determine which contract address to use based on network
  const mainContractAddress = isTestnet 
    ? NETWORK.TESTNET.CONTRACT_ADDRESS 
    : NETWORK.MAINNET.CONTRACT_ADDRESS;

  // Create contract instance
  const mainContract = new Contract(
    mainContractAddress,
    mainContractAbi,
    provider
  );
  
  console.log(`Fetching metadata for token: ${tokenAddress}...`);
  
  // Get the token creation event
  // We need to filter events from the contract where the token was created
  const filter = mainContract.filters.TokenCreated(null, tokenAddress);
  
  // Get the provider directly
  const ethersProvider = provider instanceof JsonRpcSigner 
    ? provider.provider 
    : provider;
  
  const currentBlock = await ethersProvider.getBlockNumber();
  
  // If fromBlock is not provided, try to find a suitable starting block
  if (fromBlock === undefined) {
    // Use a smaller window that won't exceed RPC node limits
    fromBlock = Math.max(0, currentBlock - 499);
    console.log(`No fromBlock provided, using recent range: ${fromBlock} to ${currentBlock}`);
  }
  
  // Make sure our search range doesn't exceed 500 blocks
  // Ensure toBlock is never more than 499 blocks ahead of fromBlock
  const toBlock = Math.min(currentBlock, fromBlock + 499);
  
  console.log(`Searching for token creation events in block range: ${fromBlock} to ${toBlock}`);
  
  // Get the events within the allowed block range
  const events = await mainContract.queryFilter(filter, fromBlock, toBlock);
  
  if (events.length === 0) {
    // If no events found and we weren't searching from the beginning,
    // consider checking earlier blocks, but we'll need to implement pagination
    if (fromBlock > 0) {
      throw new Error(`No creation event found for token ${tokenAddress} in the specified block range. Consider using an earlier fromBlock value or implementing pagination for larger ranges.`);
    } else {
      throw new Error(`No creation event found for token: ${tokenAddress}`);
    }
  }
  
  // Get the most recent creation event (should typically be only one)
  const creationEvent = events[events.length - 1];
  
  // Extract metadata from the event
  // Cast the event to access the args property safely
  const args = (creationEvent as any).args;
  
  if (!args) {
    throw new Error(`Creation event for token ${tokenAddress} has no arguments`);
  }
  
  console.log('Token metadata retrieved successfully');
  
  // Return the formatted metadata
  return {
    name: args.name,
    symbol: args.symbol,
    description: args.description,
    extended: args.extended,
    imageUrl: args.tokenUrlImage
  };
}
```

## Proposed Changes to getCompleteTokenInfo

Also update the `getCompleteTokenInfo` function to accept and pass through the `fromBlock` parameter:

```typescript
/**
 * Gets complete information about a token, including pool data and metadata
 * 
 * @param provider - An ethers.js Provider or Signer
 * @param tokenAddress - The address of the token to query
 * @param isTestnet - Whether to use testnet (default: false)
 * @param fromBlock - Optional starting block for event query (default: calculated)
 * @returns Promise resolving to CompleteTokenInfo
 */
export async function getCompleteTokenInfo(
  provider: Provider | JsonRpcSigner,
  tokenAddress: string,
  isTestnet = false,
  fromBlock?: number
): Promise<CompleteTokenInfo> {
  try {
    // Get pool information
    const poolInfo = await getTokenPoolInfo(provider, tokenAddress, isTestnet);
    
    // Get token metadata, passing through the fromBlock parameter if provided
    const metadata = await getTokenMetadata(provider, tokenAddress, isTestnet, fromBlock);
    
    // Format the price and market cap in a human-readable format
    const formattedPrice = ethers.formatEther(poolInfo.lastPrice);
    const formattedMarketCap = ethers.formatEther(poolInfo.lastMcapInEth);
    
    return {
      poolInfo,
      metadata,
      formattedPrice,
      formattedMarketCap
    };
  } catch (error) {
    console.error(`Error fetching token info for ${tokenAddress}:`, error);
    throw error;
  }
}
```

## Implementation Strategy

1. Update the `getTokenMetadata` function to accept the `fromBlock` parameter
2. Update the `getCompleteTokenInfo` function to pass through the parameter
3. Test with the token finder script, which will find the creation block first
4. Consider implementing a more sophisticated pagination strategy for thorough searching if needed

With these changes, the token info retrieval should work without hitting the RPC node's block limit. 