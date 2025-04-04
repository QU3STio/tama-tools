/**
 * Token Creation Module for tama.meme Platform
 * 
 * This module provides functionality to create new memecoins on the tama.meme platform
 * using the Ronin blockchain. It handles the interaction with the smart contract,
 * calculation of fees, and transaction submission.
 */

import { JsonRpcSigner, ethers } from 'ethers';
import mainContractAbi from '../shared/abi/mainContractAbi.json';
import { NETWORK } from '../shared/constants';

/**
 * TokenInfo interface defines the required information to create a new token
 */
export interface TokenInfo {
  /** The full name of your token (e.g., "Rakūn Inu") */
  name: string;
  
  /** The token symbol that appears in wallets (e.g., "TANUKI") */
  symbol: string;
  
  /** The amount of RON to spend for initial liquidity (e.g., "0.1") */
  initAmountIn: string;
  
  /** A description of your token that will appear on the tama.meme website */
  description: string;
  
  /** A JSON string containing additional links (Twitter, Discord, etc.) */
  extended: string;
  
  /** The IPFS URL for your token's image */
  tokenUrlImage: string;
}

/**
 * Creates a new token on the tama.meme platform
 * 
 * This function handles the entire token creation process:
 * 1. Connects to the main contract
 * 2. Calculates the total cost (creation fee + initial liquidity)
 * 3. Submits the transaction to create the token
 * 4. Returns the new token's address and transaction hash
 * 
 * @param ethersSigner - A connected ethers.js JsonRpcSigner
 * @param tokenInfo - Information about the token to create
 * @param isTestnet - Whether to use testnet (default: false)
 * @returns Promise with token address and transaction hash
 */
export const createTokenOnContract = async (
  ethersSigner: JsonRpcSigner,
  tokenInfo: TokenInfo,
  isTestnet = false,
): Promise<{ tokenAddress: string; txHash: string } | undefined> => {
  // Determine which contract address to use based on network
  const mainContractAddress = isTestnet 
    ? NETWORK.TESTNET.CONTRACT_ADDRESS 
    : NETWORK.MAINNET.CONTRACT_ADDRESS;

  // Step 1: Create a contract instance using the ABI, address, and signer
  console.log(`Creating contract instance for ${mainContractAddress}...`);
  const mainContract = new ethers.Contract(
    mainContractAddress,
    mainContractAbi,
    ethersSigner,
  );

  // Step 2: Get the creation fee from the contract
  console.log('Fetching creation fee from contract...');
  const creationFee = await mainContract.creationFee_();
  console.log(`Creation fee: ${ethers.formatEther(creationFee)} RON`);
  
  // Step 3: Convert the initial amount to wei (smallest unit)
  const valueAmount = ethers.parseEther(tokenInfo.initAmountIn);
  console.log(`Initial liquidity: ${tokenInfo.initAmountIn} RON`);
  
  // Step 4: Calculate the total transaction value (fee + initial liquidity)
  const totalValue = creationFee + valueAmount;
  console.log(`Total transaction value: ${ethers.formatEther(totalValue)} RON`);

  // Step 5: Log token details being submitted
  console.log('Submitting token creation with the following details:');
  console.log(`- Name: ${tokenInfo.name}`);
  console.log(`- Symbol: ${tokenInfo.symbol}`);
  console.log(`- Description: ${tokenInfo.description}`);
  console.log(`- Image URL: ${tokenInfo.tokenUrlImage}`);
  
  try {
    // Step 6: Submit the transaction to create the token
    console.log('Sending transaction to blockchain...');
    const tx = await mainContract.createNewToken(
      tokenInfo.name,             // The long name of the coin (e.g., "Rakūn Inu")
      tokenInfo.symbol,           // The trading symbol (e.g., "TANUKI")
      tokenInfo.initAmountIn,     // Initial purchase amount in RON
      tokenInfo.description,      // Description shown on the tama.meme website
      tokenInfo.extended,         // JSON string with social links (like Twitter, Discord)
      tokenInfo.tokenUrlImage,    // IPFS URL for the token image
      '0x',                       // Empty referral data (no referral in this case)
      {
        value: totalValue.toString(), // Total amount of RON to send with the transaction
      },
    );
    
    console.log(`Transaction submitted! Hash: ${tx.hash}`);
    console.log('Waiting for transaction confirmation...');
    
    // Step 7: Wait for the transaction to be confirmed
    const txReceipt = await tx.wait();
    console.log('Transaction confirmed!');

    // Step 8: Extract the token address from the transaction logs
    let tokenAddress;
    
    if (txReceipt && txReceipt.logs) {
      // We need to parse the logs to find the token address
      // The token address is found in the logs where the first topic matches the ZeroHash
      for (const log of txReceipt.logs) {
        if (log.topics && log.topics[1] === ethers.ZeroHash) {
          tokenAddress = log.address;
          break;
        }
      }
    }
    
    if (tokenAddress) {
      console.log(`New token successfully created at address: ${tokenAddress}`);
    } else {
      console.warn('Token created, but address could not be extracted from logs');
    }
    
    // Step 9: Return the transaction hash and token address
    return { 
      txHash: tx.hash, 
      tokenAddress 
    };
  } catch (error) {
    // Handle errors during token creation
    console.error('Error creating token:', error);
    throw error; // Re-throw to allow proper error handling upstream
  }
}; 