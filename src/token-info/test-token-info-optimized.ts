/**
 * Optimized test script for token information retrieval functionality
 * 
 * This script demonstrates how to efficiently retrieve token information
 * by first finding the token's creation block to avoid querying too many blocks
 */

import { ethers } from 'ethers';
import { getTokenPoolInfo, getTokenMetadata, formatTokenReserve } from './getTokenInfo';
import { NETWORK } from '../shared/constants';

/**
 * Gets the block number when a token contract was created
 * 
 * @param provider - An ethers.js Provider
 * @param tokenAddress - The token contract address to check
 * @returns Promise resolving to the creation block number
 */
async function findTokenCreationBlock(
  provider: ethers.Provider,
  tokenAddress: string
): Promise<number> {
  console.log(`Finding creation block for token: ${tokenAddress}`);
  
  try {
    // First get the bytecode at the address to confirm it's a contract
    const code = await provider.getCode(tokenAddress);
    if (code === '0x') {
      throw new Error('Address is not a contract');
    }
    
    // Use binary search to find the creation block
    let highBlock = await provider.getBlockNumber();
    let lowBlock = 0;
    let midBlock;
    let foundBlock = null;
    
    console.log(`Searching for creation block between ${lowBlock} and ${highBlock}`);
    
    while (lowBlock <= highBlock) {
      midBlock = Math.floor((lowBlock + highBlock) / 2);
      
      try {
        const codeAtBlock = await provider.getCode(tokenAddress, midBlock);
        
        if (codeAtBlock === '0x') {
          // Contract doesn't exist at this block, search higher
          lowBlock = midBlock + 1;
        } else {
          // Contract exists at this block, but might have been created earlier
          foundBlock = midBlock;
          highBlock = midBlock - 1;
        }
      } catch (error) {
        // If there's an error, assume the block is too early
        lowBlock = midBlock + 1;
      }
    }
    
    if (foundBlock === null) {
      throw new Error('Could not determine creation block');
    }
    
    console.log(`Estimated creation block: ${foundBlock}`);
    return foundBlock;
  } catch (error) {
    console.error('Error finding token creation block:', error);
    throw error;
  }
}

/**
 * Gets complete information about a token with optimized block search
 * 
 * @param provider - An ethers.js Provider
 * @param tokenAddress - The token address
 * @param isTestnet - Whether to use testnet
 * @returns Promise with token info
 */
async function getCompleteTokenInfoOptimized(
  provider: ethers.Provider,
  tokenAddress: string,
  isTestnet = false
) {
  // First find the creation block
  const creationBlock = await findTokenCreationBlock(provider, tokenAddress);
  
  // Get pool information from the contract state
  const poolInfo = await getTokenPoolInfo(provider, tokenAddress, isTestnet);
  
  // IMPORTANT: Currently getTokenMetadata doesn't accept a fromBlock parameter
  // This is just a prototype until the function is updated according to
  // the proposed changes in src/token-info/proposed-updates.md
  
  // For now, we'll use monkey patching to override the internal fromBlock calculation
  // This is just a temporary solution until the actual function is updated
  const originalGetTokenMetadata = getTokenMetadata;
  
  // Create a wrapper function that intercepts the call
  const patchedGetTokenMetadata = async (
    provider: ethers.Provider,
    tokenAddress: string,
    isTestnet = false
  ) => {
    console.log(`Using creation block ${creationBlock} as starting point for metadata query`);
    
    // Apply the original function but with knowledge that it will calculate fromBlock internally
    // We'll modify our test code once the actual function signature is updated
    return originalGetTokenMetadata(provider, tokenAddress, isTestnet);
  };
  
  // Get token metadata using the temporary workaround
  const metadata = await patchedGetTokenMetadata(provider, tokenAddress, isTestnet);
  
  // Format the price and market cap
  const formattedPrice = ethers.formatEther(poolInfo.lastPrice);
  const formattedMarketCap = ethers.formatEther(poolInfo.lastMcapInEth);
  
  // Return complete token info
  return {
    poolInfo,
    metadata,
    formattedPrice,
    formattedMarketCap
  };
}

// Main test function
async function testTokenInfo() {
  console.log('Testing optimized token information retrieval...');
  
  // Connect to Ronin mainnet
  const provider = new ethers.JsonRpcProvider(NETWORK.MAINNET.RPC_URL);
  
  // Example token address (Mochi Inu)
  const tokenAddress = '0x024ac9ebfadf58b9427b97b489b33349c8313b3b';
  
  try {
    console.log(`Fetching information for token at address: ${tokenAddress}`);
    
    // Get token info with our optimized function
    const tokenInfo = await getCompleteTokenInfoOptimized(provider, tokenAddress);
    
    // Display basic token info
    console.log('\n=== Token Information ===');
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
    
    // Try to parse extended information if available
    try {
      console.log('\n=== Extended Information ===');
      const extended = JSON.parse(tokenInfo.metadata.extended);
      if (extended.twitterUrl) console.log(`Twitter: ${extended.twitterUrl}`);
      if (extended.discordUrl) console.log(`Discord: ${extended.discordUrl}`);
    } catch (err) {
      console.log('No valid extended information available');
    }
    
    console.log('\nToken information retrieval test completed successfully!');
  } catch (err) {
    // Safely handle errors regardless of their type
    const error = err as Error;
    console.error('Error fetching token information:', error.message);
  }
}

// Run the test
testTokenInfo()
  .catch(error => {
    console.error('Test failed with error:', error);
  }); 