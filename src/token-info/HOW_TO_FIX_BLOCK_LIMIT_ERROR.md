# How to Fix the "Cannot Get More Than 500 Blocks" Error

When trying to retrieve token information, you might encounter this error from the Ronin RPC endpoint:

```
invalid param: invalid getLogs request, cannot get more than 500 blocks
```

This error occurs because the RPC endpoint limits the block range for event queries to a maximum of 500 blocks at once.

## The Problem

In `getTokenInfo.ts`, the `getTokenMetadata` function tries to look back 10,000 blocks from the current block to find token creation events:

```typescript
// Look back 10000 blocks or use a specific block range if known
const currentBlock = await ethersProvider.getBlockNumber();
const fromBlock = Math.max(0, currentBlock - 10000);
```

This exceeds the 500-block limit imposed by the Ronin RPC endpoint.

## Solution 1: Quick Fix - Use a Narrower Range

If you just need a quick fix, modify your test code to use a narrower range:

```typescript
// In your test file
const latestBlock = await provider.getBlockNumber();
const startBlock = latestBlock - 400; // Stay under 500 limit

// When getting the token info
const tokenInfo = await getCompleteTokenInfo(provider, tokenAddress, false, startBlock);
```

This works but won't find tokens created more than 400 blocks ago.

## Solution 2: Find the Token Creation Block First

A better approach is to first find when the token was created, then query from that block:

1. Run the `src/token-find-creation-block.ts` script to find the approximate creation block for your token:

```
npx ts-node src/token-find-creation-block.ts
```

2. This uses binary search to efficiently find when a contract was deployed.

3. Use the identified creation block in your queries:

```typescript
// After finding the creation block (e.g., 12345678)
const creationBlock = 12345678;
const tokenInfo = await getCompleteTokenInfo(provider, tokenAddress, false, creationBlock);
```

## Solution 3: Modify the Token Info Functions (Recommended)

For a permanent solution, modify the token information functions to handle block ranges properly:

1. See the proposed changes in `src/token-info/proposed-updates.md`

2. Update `getTokenMetadata` to accept an optional `fromBlock` parameter

3. Update `getCompleteTokenInfo` to pass this parameter through

4. Implement pagination if you need to search large block ranges

## Testing Your Changes

We've provided two test scripts to help you implement and test these solutions:

1. `src/token-find-creation-block.ts` - Finds a token's creation block using binary search
2. `src/test-token-info-optimized.ts` - Shows how to implement the optimized approach

To run these scripts:

```bash
# Install dependencies if you haven't already
npm install

# Find a token's creation block
npx ts-node src/token-find-creation-block.ts

# Test the optimized token info retrieval
npx ts-node src/test-token-info-optimized.ts
```

## Implementation Notes

1. The binary search method is efficient but may not be 100% precise in finding the exact creation block. It will get you close enough to stay within the 500-block limit.

2. For tokens you know were created recently, you can just use a recent block range (e.g., 500 blocks from the latest).

3. For robust production code, consider implementing more sophisticated pagination that can search large portions of the blockchain history in chunks. 