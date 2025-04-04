# Token Creation Flow Diagram

Below is a visual representation of the token creation process on tama.meme:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Prepare Token  │     │ Upload Image to │     │ Create Token on │
│  Information    │────▶│     IPFS        │────▶│   Blockchain    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ - Token name    │     │ - Authenticate  │     │ - Connect wallet│
│ - Token symbol  │     │ - Upload file   │     │ - Pay fee       │
│ - Description   │     │ - Get IPFS URL  │     │ - Submit tx     │
│ - Social links  │     │                 │     │ - Get token addr│
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Detailed Flow Description

### 1. Prepare Token Information

**Description:** Gather all necessary information for your token.

**Required Information:**
- Token name (e.g., "Rakūn Inu")
- Token symbol (e.g., "TANUKI")
- Initial purchase amount (e.g., "0.1" RON)
- Description
- Social media links (Twitter, Discord, etc.)
- Token image file

**Code Representation:**
```typescript
const tokenDetails = {
  name: "Rakūn Inu",
  symbol: "TANUKI",
  initAmountIn: "0.1",
  description: "This is my awesome memecoin!",
  extended: JSON.stringify({
    twitterUrl: "https://twitter.com/animalplanetca/status/693919291368960004",
    discordUrl: "https://discord.com/invite/moku"
  })
};
```

### 2. Upload Image to IPFS

**Description:** Upload your token image to IPFS through the tama.meme API.

**Steps:**
1. Ensure you're authenticated on tama.meme
2. Prepare the image file (PNG format, ~400x400px recommended)
3. Upload the file using the API
4. Receive the IPFS URL for the uploaded image

**Code Representation:**
```typescript
// Upload image to IPFS
const imageFile = /* File object from input */;
const imageUrl = await uploadImageToIPFS(imageFile);
```

### 3. Create Token on Blockchain

**Description:** Create the token on the Ronin blockchain using the tama.meme contract.

**Steps:**
1. Ensure your wallet is connected
2. Combine token details with the IPFS image URL
3. Calculate required fees (creation fee + initial purchase amount)
4. Send the transaction to create the token
5. Wait for the transaction to be confirmed
6. Retrieve the new token's address

**Code Representation:**
```typescript
// Create token with all details
const tokenInfo = {
  ...tokenDetails,
  tokenUrlImage: imageUrl
};

// Submit transaction
const result = await createTokenOnContract(signer, tokenInfo);

// Get token address and transaction hash
console.log("Token address:", result.tokenAddress);
console.log("Transaction hash:", result.txHash);
```

## Error Handling Points

- **Authentication Errors:** Ensure user is logged in before uploading
- **Image Upload Errors:** Check file size, format, etc.
- **Wallet Connection Errors:** Ensure wallet is connected to Ronin network
- **Insufficient Funds:** Check if user has enough RON
- **Transaction Rejection:** User may decline the transaction
- **Network Errors:** API or blockchain network issues

## Success Flow

Once the token is successfully created:
1. The token will be visible on tama.meme
2. The token will have initial liquidity (from your purchase)
3. Users can start trading the token immediately
4. You can share your token's URL with others 