/**
 * Constants for tama.meme platform
 * 
 * This file contains important constants and configurations
 * for working with the tama.meme platform on Ronin blockchain.
 */

// Main contract addresses
export const NETWORK = {
  MAINNET: {
    /**
     * Main tama.meme contract address on Ronin mainnet
     */
    CONTRACT_ADDRESS: '0xA54b0184D12349Cf65281C6F965A74828DDd9E8F',
    /**
     * Chain ID for Ronin mainnet
     */
    CHAIN_ID: 2020,
    /**
     * RPC URL for Ronin mainnet
     */
    RPC_URL: 'https://api.roninchain.com/rpc',
    /**
     * Block explorer URL for Ronin mainnet
     */
    EXPLORER_URL: 'https://app.roninchain.com',
  },
  TESTNET: {
    /**
     * Main tama.meme contract address on Saigon testnet
     */
    CONTRACT_ADDRESS: '0xfbdb66ce17543b425962be05d4d44d6f0b7f1b94',
    /**
     * Chain ID for Saigon testnet
     */
    CHAIN_ID: 2021,
    /**
     * RPC URL for Saigon testnet
     */
    RPC_URL: 'https://saigon-api.roninchain.com/rpc',
    /**
     * Block explorer URL for Saigon testnet
     */
    EXPLORER_URL: 'https://saigon-app.roninchain.com',
  },
};

// API endpoints
export const API = {
  /**
   * IPFS upload endpoint on tama.meme
   */
  IPFS_UPLOAD: 'https://tama.meme/api/uploads/ipfs',
  /**
   * Base URL for tama.meme
   */
  BASE_URL: 'https://tama.meme',
};

// Token creation recommendations
export const TOKEN_CREATION = {
  /**
   * Recommended minimum amount for initial liquidity (in RON)
   */
  RECOMMENDED_MIN_AMOUNT: '0.1',
  /**
   * Recommended maximum amount for initial liquidity (in RON)
   * to avoid excessive slippage in small pools
   */
  RECOMMENDED_MAX_AMOUNT: '100',
  /**
   * Recommended image dimensions for token images
   */
  RECOMMENDED_IMAGE_DIMENSIONS: {
    WIDTH: 400,
    HEIGHT: 400,
  },
  /**
   * Maximum file size for token images (in bytes)
   */
  MAX_IMAGE_SIZE: 1024 * 1024, // 1MB
};

/**
 * Gets explorer URL for a transaction
 * @param txHash - Transaction hash
 * @param isTestnet - Whether to use testnet explorer
 * @returns URL to view the transaction in the explorer
 */
export function getExplorerTxUrl(txHash: string, isTestnet = false): string {
  const baseUrl = isTestnet 
    ? NETWORK.TESTNET.EXPLORER_URL 
    : NETWORK.MAINNET.EXPLORER_URL;
  return `${baseUrl}/tx/${txHash}`;
}

/**
 * Gets explorer URL for a token
 * @param tokenAddress - Token contract address
 * @param isTestnet - Whether to use testnet explorer
 * @returns URL to view the token in the explorer
 */
export function getExplorerTokenUrl(tokenAddress: string, isTestnet = false): string {
  const baseUrl = isTestnet 
    ? NETWORK.TESTNET.EXPLORER_URL 
    : NETWORK.MAINNET.EXPLORER_URL;
  return `${baseUrl}/address/${tokenAddress}`;
}

/**
 * Gets tama.meme URL for a token
 * @param tokenAddress - Token contract address
 * @returns URL to view the token on tama.meme
 */
export function getTamaTokenUrl(tokenAddress: string): string {
  return `${API.BASE_URL}/token/${tokenAddress}`;
} 