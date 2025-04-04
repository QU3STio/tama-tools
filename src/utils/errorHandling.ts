/**
 * Error Handling Utilities for tama.meme Token Creation
 * 
 * This file contains utilities for handling common errors that may occur
 * during blockchain interactions with the tama.meme platform.
 */

// Error types specific to token creation
export enum TokenCreationErrorType {
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  USER_REJECTED = 'USER_REJECTED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Custom error class for token creation errors
export class TokenCreationError extends Error {
  type: TokenCreationErrorType;
  originalError?: Error | unknown;
  
  constructor(type: TokenCreationErrorType, message: string, originalError?: Error | unknown) {
    super(message);
    this.name = 'TokenCreationError';
    this.type = type;
    this.originalError = originalError;
  }
}

/**
 * Parses blockchain errors to provide more user-friendly messages
 * @param error - The error thrown by ethers.js or the contract
 * @returns A TokenCreationError with appropriate type and message
 */
export function parseBlockchainError(error: any): TokenCreationError {
  // Common error substrings that can occur in blockchain interactions
  const errorMessage = error?.message || '';
  
  // Check for common Ethereum error patterns
  if (errorMessage.includes('insufficient funds')) {
    return new TokenCreationError(
      TokenCreationErrorType.INSUFFICIENT_FUNDS,
      'You do not have enough RON to complete this transaction. Make sure you have enough for gas fees plus the creation fee and initial liquidity.',
      error
    );
  }
  
  if (errorMessage.includes('user rejected') || errorMessage.includes('User denied')) {
    return new TokenCreationError(
      TokenCreationErrorType.USER_REJECTED,
      'You rejected the transaction in your wallet. Please try again and approve the transaction.',
      error
    );
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
    return new TokenCreationError(
      TokenCreationErrorType.NETWORK_ERROR,
      'Network error occurred. Please check your internet connection and try again.',
      error
    );
  }
  
  // Look for contract-specific errors
  if (errorMessage.includes('InsufficientOutput') || errorMessage.includes('InvalidAmountIn')) {
    return new TokenCreationError(
      TokenCreationErrorType.CONTRACT_ERROR,
      'Invalid initial amount. Please make sure you are providing a valid amount for initial liquidity.',
      error
    );
  }
  
  if (errorMessage.includes('InvalidTokenMetadata')) {
    return new TokenCreationError(
      TokenCreationErrorType.CONTRACT_ERROR,
      'Invalid token metadata. Please check that all token details (name, symbol, etc.) are properly formatted.',
      error
    );
  }
  
  // Default: unknown error
  return new TokenCreationError(
    TokenCreationErrorType.UNKNOWN_ERROR,
    `An unexpected error occurred: ${errorMessage}`,
    error
  );
}

/**
 * Parses API upload errors
 * @param error - The error thrown during the IPFS upload
 * @returns A TokenCreationError with appropriate type and message
 */
export function parseUploadError(error: any): TokenCreationError {
  const status = error?.status || 0;
  const errorMessage = error?.message || '';
  
  if (status === 401 || status === 403 || errorMessage.includes('unauthorized')) {
    return new TokenCreationError(
      TokenCreationErrorType.AUTHENTICATION_ERROR,
      'Authentication failed. Please make sure you are logged in to tama.meme.',
      error
    );
  }
  
  if (status === 413 || errorMessage.includes('too large')) {
    return new TokenCreationError(
      TokenCreationErrorType.UPLOAD_FAILED,
      'Image file is too large. Please use an image smaller than 1MB.',
      error
    );
  }
  
  if (errorMessage.includes('network') || status === 0 || status >= 500) {
    return new TokenCreationError(
      TokenCreationErrorType.NETWORK_ERROR,
      'Network error during upload. Please check your internet connection and try again.',
      error
    );
  }
  
  return new TokenCreationError(
    TokenCreationErrorType.UPLOAD_FAILED,
    `Failed to upload image: ${errorMessage}`,
    error
  );
} 