/**
 * Utility script to find a token's creation block
 * 
 * This script helps identify the block number where a token was created
 * to optimize event queries and avoid the "cannot get more than 500 blocks" error
 */

import { ethers } from 'ethers';
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
  
  // Find the earliest transaction to the token address
  // We can do this by getting the transaction count and then the first transaction
  try {
    // First get the bytecode at the address to confirm it's a contract
    const code = await provider.getCode(tokenAddress);
    if (code === '0x') {
      throw new Error('Address is not a contract');
    }
    
    // Use binary search to find the creation block
    // Start with a wide range and narrow it down
    let highBlock = await provider.getBlockNumber();
    let lowBlock = 0;
    let midBlock;
    let foundBlock = null;
    
    console.log(`Searching for creation block between ${lowBlock} and ${highBlock}`);
    
    while (lowBlock <= highBlock) {
      midBlock = Math.floor((lowBlock + highBlock) / 2);
      
      // Check if contract exists at this block
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
      
      console.log(`Checked block ${midBlock}, current range: ${lowBlock} - ${highBlock}`);
    }
    
    if (foundBlock === null) {
      throw new Error('Could not determine creation block');
    }
    
    // Since binary search gives us the first block where the contract exists,
    // this should be the creation block or very close to it
    console.log(`Estimated creation block: ${foundBlock}`);
    
    return foundBlock;
  } catch (error) {
    console.error('Error finding token creation block:', error);
    throw error;
  }
}

// Example usage
async function main() {
  // Connect to Ronin mainnet
  const provider = new ethers.JsonRpcProvider(NETWORK.MAINNET.RPC_URL);
  
  // Example token address (Mochi Inu)
  const tokenAddress = '0x024ac9ebfadf58b9427b97b489b33349c8313b3b';
  
  try {
    const creationBlock = await findTokenCreationBlock(provider, tokenAddress);
    console.log(`\n=== Results ===`);
    console.log(`Token ${tokenAddress} was created at approximately block ${creationBlock}`);
    console.log('\nWith this information, you can now optimize your event queries to start');
    console.log('searching from this block instead of scanning the entire blockchain.');
    console.log('\nSample usage:');
    console.log(`getCompleteTokenInfo(provider, '${tokenAddress}', false, ${creationBlock});`);
  } catch (error) {
    console.error('Failed to find creation block:', error);
  }
}

// Run the example
main()
  .catch(error => {
    console.error('Script failed with error:', error);
  }); 