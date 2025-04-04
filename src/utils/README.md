# Utility Functions for tama.meme

This directory contains utility functions and helpers for working with the tama.meme platform.

## Modules

- `errorHandling.ts` - Error handling utilities for blockchain interactions

## Error Handling

The `errorHandling.ts` module provides consistent error handling for blockchain interactions through:

1. A custom `TokenCreationError` class that extends the standard JavaScript Error
2. Helper functions to parse common blockchain and API errors
3. Specific error types for different failure scenarios

### Error Types

The module defines the following error types:

```typescript
enum TokenCreationErrorType {
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  USER_REJECTED = 'USER_REJECTED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}
```

### Usage Example

Here's how to use the error handling utilities in your code:

```typescript
import { parseBlockchainError, parseUploadError, TokenCreationError, TokenCreationErrorType } from './errorHandling';

// In your function that interacts with the blockchain
async function myBlockchainFunction() {
  try {
    // Your blockchain interaction code here
    const result = await contract.someFunction();
    return result;
  } catch (error) {
    // Convert the raw error to a more user-friendly TokenCreationError
    throw parseBlockchainError(error);
  }
}

// Example of handling these errors in your UI code
async function handleButtonClick() {
  try {
    await myBlockchainFunction();
    showSuccess('Operation successful!');
  } catch (error) {
    if (error instanceof TokenCreationError) {
      switch (error.type) {
        case TokenCreationErrorType.INSUFFICIENT_FUNDS:
          showError('You do not have enough RON to complete this transaction.');
          break;
        case TokenCreationErrorType.USER_REJECTED:
          showError('You rejected the transaction. Please try again and approve it in your wallet.');
          break;
        case TokenCreationErrorType.NETWORK_ERROR:
          showError('Network error occurred. Please check your internet connection and try again.');
          break;
        default:
          showError(`An error occurred: ${error.message}`);
      }
    } else {
      showError('An unexpected error occurred.');
    }
  }
}
```

### Benefits

Using these error handling utilities provides several benefits:

1. **User-friendly error messages** - Technical blockchain errors are translated into messages users can understand
2. **Consistent error handling** - All parts of your application can handle errors in a consistent way
3. **Error categorization** - Errors are categorized by type, making it easier to respond appropriately
4. **Error logging** - The original error is preserved for debugging purposes

### Custom Error Types

If you need to add custom error types for other interactions, you can extend the `TokenCreationErrorType` enum and add new parsing logic in a similar pattern to the existing functions. 