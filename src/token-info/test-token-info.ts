/**
 * Test script for the token information retrieval functionality
 * 
 * This script demonstrates how to use the getCompleteTokenInfo function
 * to retrieve information about an existing token on tama.meme
 */

import { ethers } from 'ethers';
import { getCompleteTokenInfo, formatTokenReserve } from './getTokenInfo';
import { NETWORK } from '../shared/constants';

async function testTokenInfo() {
  console.log('Testing token information retrieval...');
  
  // Connect to Ronin mainnet
  const provider = new ethers.JsonRpcProvider(NETWORK.MAINNET.RPC_URL);
  
  // Example token address (Mochi Inu)
  const tokenAddress = '0x024ac9ebfadf58b9427b97b489b33349c8313b3b';
  
  try {
    console.log(`Fetching information for token at address: ${tokenAddress}`);
    
    // Get the latest block number
    const latestBlock = await provider.getBlockNumber();
    
    // Calculate a start block that's only a few hundred blocks in the past
    // This avoids the "cannot get more than 500 blocks" error
    const startBlock = latestBlock - 400; // Use a safe value below the 500 block limit
    
    console.log(`Using block range: ${startBlock} to ${latestBlock} (latest)`);
    
    // IMPORTANT: The current getCompleteTokenInfo doesn't support a fromBlock parameter
    // This will actually throw an error until the function is updated
    // See src/token-info/HOW_TO_FIX_BLOCK_LIMIT_ERROR.md for solutions
    try {
      // Get both pool data and metadata (this may fail if token wasn't created recently)
      const tokenInfo = await getCompleteTokenInfo(provider, tokenAddress);
      
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
    } catch (fetchError) {
      const error = fetchError as Error;
      console.error('\n=== Token Fetch Error ===');
      console.error(error.message);
      
      console.log('\n=== Recommended Solutions ===');
      console.log('1. Try our optimized scripts that handle the 500 block limit:');
      console.log('   - npx ts-node src/token-find-creation-block.ts');
      console.log('   - npx ts-node src/test-token-info-optimized.ts');
      console.log('\n2. See our detailed guide for fixing this issue:');
      console.log('   src/token-info/HOW_TO_FIX_BLOCK_LIMIT_ERROR.md');
    }
    
    console.log('\nToken information test completed.');
  } catch (err) {
    // Handle global errors
    const error = err as Error;
    console.error('Test script error:', error.message);
  }
}

// Run the test
testTokenInfo()
  .catch(error => {
    console.error('Test failed with error:', error);
  }); 