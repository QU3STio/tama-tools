/**
 * Token Information Module for tama.meme Platform
 * 
 * This module provides functionality to retrieve information about existing tokens
 * on the tama.meme platform, including pool data, pricing, and metadata.
 */

import { JsonRpcSigner, ethers, Contract, Provider } from 'ethers';
import mainContractAbi from '../shared/abi/mainContractAbi.json';
import { NETWORK } from '../shared/constants';

/**
 * TokenPoolInfo interface defines the structure of pool information returned by the contract
 */
export interface TokenPoolInfo {
  /** The address of the token */
  token: string;
  
  /** Current token reserve in the pool */
  tokenReserve: bigint;
  
  /** Virtual token reserve used for price calculations */
  virtualTokenReserve: bigint;
  
  /** Current ETH/RON reserve in the pool */
  ethReserve: bigint;
  
  /** Virtual ETH/RON reserve used for price calculations */
  virtualEthReserve: bigint;
  
  /** The last traded price of the token (in ETH/RON) */
  lastPrice: bigint;
  
  /** The last market cap of the token in ETH/RON */
  lastMcapInEth: bigint;
  
  /** Timestamp of the last update */
  lastTimestamp: bigint;
  
  /** Block number of the last update */
  lastBlock: bigint;
  
  /** Address of the token creator */
  creator: string;
  
  /** Address of the liquidity manager (if applicable) */
  liquidityManager: string;
  
  /** Pool ID (if applicable) */
  poolId: string;
  
  /** Curve constant parameter used for price calculations */
  curveConstant: bigint;
}

/**
 * TokenMetadata interface defines the structure of token metadata
 */
export interface TokenMetadata {
  /** The name of the token */
  name: string;
  
  /** The symbol of the token */
  symbol: string;
  
  /** The description of the token */
  description: string;
  
  /** Extended information as a JSON string (social links, etc.) */
  extended: string;
  
  /** The image URL for the token */
  imageUrl: string;
}

/**
 * CompleteTokenInfo interface combines pool data and metadata
 */
export interface CompleteTokenInfo {
  /** Pool information including reserves and pricing */
  poolInfo: TokenPoolInfo;
  
  /** Token metadata including name, symbol, and description */
  metadata: TokenMetadata;
  
  /** The formatted price in ETH/RON */
  formattedPrice: string;
  
  /** The formatted market cap in ETH/RON */
  formattedMarketCap: string;
}

/**
 * Gets pool information for a token from the tama.meme contract
 * 
 * @param provider - An ethers.js Provider or Signer
 * @param tokenAddress - The address of the token to query
 * @param isTestnet - Whether to use testnet (default: false)
 * @returns Promise resolving to TokenPoolInfo
 */
export async function getTokenPoolInfo(
  provider: Provider | JsonRpcSigner,
  tokenAddress: string,
  isTestnet = false
): Promise<TokenPoolInfo> {
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

  console.log(`Fetching pool info for token: ${tokenAddress}...`);
  
  // Call the pools_ method to get pool information
  const poolInfo = await mainContract.pools_(tokenAddress);
  
  console.log('Pool information retrieved successfully');
  
  // Return the formatted pool information
  return {
    token: poolInfo.token,
    tokenReserve: poolInfo.tokenReserve,
    virtualTokenReserve: poolInfo.virtualTokenReserve,
    ethReserve: poolInfo.ethReserve,
    virtualEthReserve: poolInfo.virtualEthReserve,
    lastPrice: poolInfo.lastPrice,
    lastMcapInEth: poolInfo.lastMcapInEth,
    lastTimestamp: poolInfo.lastTimestamp,
    lastBlock: poolInfo.lastBlock,
    creator: poolInfo.creator,
    liquidityManager: poolInfo.liquidityManager,
    poolId: poolInfo.poolId,
    curveConstant: poolInfo.curveConstant
  };
}

/**
 * Gets token metadata from the token creation event logs
 * 
 * @param provider - An ethers.js Provider or Signer
 * @param tokenAddress - The address of the token to query
 * @param isTestnet - Whether to use testnet (default: false)
 * @returns Promise resolving to TokenMetadata
 */
export async function getTokenMetadata(
  provider: Provider | JsonRpcSigner,
  tokenAddress: string,
  isTestnet = false
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
  
  // Look back 10000 blocks or use a specific block range if known
  // Use the provider directly to get the block number, not the signer
  const ethersProvider = provider instanceof JsonRpcSigner 
    ? provider.provider 
    : provider;
  const currentBlock = await ethersProvider.getBlockNumber();
  const fromBlock = Math.max(0, currentBlock - 10000);
  
  // Get the events
  const events = await mainContract.queryFilter(filter, fromBlock);
  
  if (events.length === 0) {
    throw new Error(`No creation event found for token: ${tokenAddress}`);
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

/**
 * Gets complete information about a token, including pool data and metadata
 * 
 * @param provider - An ethers.js Provider or Signer
 * @param tokenAddress - The address of the token to query
 * @param isTestnet - Whether to use testnet (default: false)
 * @returns Promise resolving to CompleteTokenInfo
 * 
 * @example
 * ```typescript
 * import { ethers } from 'ethers';
 * import { getCompleteTokenInfo } from './getTokenInfo';
 * 
 * async function fetchTokenInfo() {
 *   const provider = new ethers.JsonRpcProvider('https://api.roninchain.com/rpc');
 *   const tokenAddress = '0x024ac9ebfadf58b9427b97b489b33349c8313b3b'; // Mochi Inu
 *   
 *   try {
 *     const tokenInfo = await getCompleteTokenInfo(provider, tokenAddress);
 *     console.log('Token Name:', tokenInfo.metadata.name);
 *     console.log('Token Symbol:', tokenInfo.metadata.symbol);
 *     console.log('Price:', tokenInfo.formattedPrice, 'RON');
 *     console.log('Market Cap:', tokenInfo.formattedMarketCap, 'RON');
 *   } catch (error) {
 *     console.error('Failed to get token info:', error);
 *   }
 * }
 * ```
 */
export async function getCompleteTokenInfo(
  provider: Provider | JsonRpcSigner,
  tokenAddress: string,
  isTestnet = false
): Promise<CompleteTokenInfo> {
  try {
    // Get pool information
    const poolInfo = await getTokenPoolInfo(provider, tokenAddress, isTestnet);
    
    // Get token metadata
    const metadata = await getTokenMetadata(provider, tokenAddress, isTestnet);
    
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

/**
 * Helper function to calculate the current token price based on reserves
 * 
 * @param poolInfo - The token pool information
 * @returns The current price in ETH/RON
 */
export function calculateCurrentPrice(poolInfo: TokenPoolInfo): string {
  // Price calculation based on virtual reserves
  // (virtualEthReserve / virtualTokenReserve)
  const price = (Number(poolInfo.virtualEthReserve) / Number(poolInfo.virtualTokenReserve)) * 10**18;
  return ethers.formatEther(BigInt(Math.floor(price)));
}

/**
 * Helper function to format token reserves in a human-readable format
 * 
 * @param tokenReserve - The token reserve amount
 * @returns Formatted token reserve
 */
export function formatTokenReserve(tokenReserve: bigint): string {
  // Format with commas for readability
  return Number(ethers.formatEther(tokenReserve)).toLocaleString(undefined, {
    maximumFractionDigits: 6
  });
} 