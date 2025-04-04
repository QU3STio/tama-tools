/**
 * Complete Token Creation Workflow
 * 
 * This module combines image upload and token creation into a single workflow,
 * making it easier to create a new token on tama.meme with all required steps.
 */

import { JsonRpcSigner } from 'ethers';
import { TokenCreationError, parseBlockchainError } from '../utils/errorHandling';
import { createTokenOnContract, TokenInfo } from './createToken';
import { uploadImageToIPFS } from './uploadImageToIPFS';

/**
 * TokenCreationParams interface defines the information needed to create a token,
 * excluding the image URL which will be generated during the process.
 */
export type TokenCreationParams = Omit<TokenInfo, 'tokenUrlImage'>;

/**
 * TokenCreationResult interface defines the result of the token creation process
 */
export interface TokenCreationResult {
  /** The address of the newly created token */
  tokenAddress: string;
  
  /** The transaction hash of the token creation transaction */
  txHash: string;
  
  /** The IPFS URL of the uploaded token image */
  imageUrl: string;
}

/**
 * Creates a token with image upload in a single workflow
 * 
 * This function handles the complete token creation process:
 * 1. Uploads the token image to IPFS
 * 2. Uses the resulting IPFS URL to create the token
 * 
 * @param signer - A connected ethers.js JsonRpcSigner
 * @param imageFile - Image file for the token
 * @param tokenDetails - Token information (name, symbol, etc.)
 * @param isTestnet - Whether to use testnet (default: false)
 * @returns Promise with token address, transaction hash, and image URL
 * 
 * @example
 * ```typescript
 * import { createTokenWithImage } from './createTokenWithImage';
 * 
 * // In an async function with a connected signer and a file input
 * async function handleCreateToken(signer, imageFile) {
 *   try {
 *     const result = await createTokenWithImage(
 *       signer,
 *       imageFile,
 *       {
 *         name: "Rakūn Inu",
 *         symbol: "TANUKI",
 *         initAmountIn: "0.1",
 *         description: "This is my awesome memecoin!",
 *         extended: JSON.stringify({
 *           twitterUrl: "https://twitter.com/animalplanetca/status/693919291368960004",
 *           discordUrl: "https://discord.com/invite/moku"
 *         })
 *       }
 *     );
 *     
 *     console.log(`Token created at: ${result.tokenAddress}`);
 *     console.log(`Transaction hash: ${result.txHash}`);
 *     console.log(`Image URL: ${result.imageUrl}`);
 *   } catch (error) {
 *     console.error("Failed to create token:", error.message);
 *   }
 * }
 * ```
 */
export async function createTokenWithImage(
  signer: JsonRpcSigner,
  imageFile: File,
  tokenDetails: TokenCreationParams,
  isTestnet = false
): Promise<TokenCreationResult> {
  try {
    // Step 1: Upload the image to IPFS
    console.log('Starting token creation process...');
    console.log('Step 1: Uploading image to IPFS');
    const imageUrl = await uploadImageToIPFS(imageFile);
    
    // Step 2: Create the token with the image URL
    console.log('Step 2: Creating token on blockchain');
    const tokenInfo: TokenInfo = {
      ...tokenDetails,
      tokenUrlImage: imageUrl,
    };
    
    const result = await createTokenOnContract(signer, tokenInfo, isTestnet);
    
    if (!result || !result.tokenAddress) {
      throw new Error('Token creation failed: No token address returned');
    }
    
    console.log('Token creation completed successfully!');
    
    // Return the complete result
    return {
      tokenAddress: result.tokenAddress,
      txHash: result.txHash,
      imageUrl,
    };
  } catch (error) {
    console.error('Error in token creation process:', error);
    
    // If it's already a TokenCreationError, rethrow it
    if (error instanceof TokenCreationError) {
      throw error;
    }
    
    // Otherwise, parse and throw the error
    throw parseBlockchainError(error);
  }
} 