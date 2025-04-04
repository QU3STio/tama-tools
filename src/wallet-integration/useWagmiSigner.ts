/**
 * Wagmi Signer Hooks
 * 
 * This module provides React hooks to convert wagmi wallet clients to ethers.js signers,
 * which are needed for interacting with the tama.meme platform.
 */

import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { useMemo } from 'react';
import type { Account, Chain, Client, Transport } from 'viem';
import { type Config, useConnectorClient } from 'wagmi';

/**
 * Converts a viem wallet client to an ethers.js JsonRpcSigner
 * 
 * @param client - The viem wallet client to convert
 * @returns An ethers.js JsonRpcSigner that can be used with tama.meme functions
 */
export function clientToSigner(client: Client<Transport, Chain, Account>) {
    const { account, chain, transport } = client;
    const network = {
        chainId: chain.id,
        name: chain.name,
        ensAddress: chain.contracts?.ensRegistry?.address,
    };
    const provider = new BrowserProvider(transport, network);
    const signer = new JsonRpcSigner(provider, account.address);
    return signer;
}

/**
 * React hook to convert a viem Wallet Client to an ethers.js JsonRpcSigner
 * 
 * @param options - Optional configuration including chainId
 * @returns An ethers.js JsonRpcSigner or undefined if no wallet is connected
 * 
 * @example
 * ```tsx
 * import { useWagmiSigner } from './useWagmiSigner';
 * import { createTokenOnContract } from '../token-creation/createToken';
 * 
 * function MyComponent() {
 *   const signer = useWagmiSigner();
 *   
 *   const handleCreateToken = async () => {
 *     if (!signer) return;
 *     
 *     try {
 *       const result = await createTokenOnContract(signer, tokenInfo);
 *       console.log('Token created:', result.tokenAddress);
 *     } catch (error) {
 *       console.error('Error creating token:', error);
 *     }
 *   };
 *   
 *   return (
 *     <button 
 *       onClick={handleCreateToken}
 *       disabled={!signer}
 *     >
 *       Create Token
 *     </button>
 *   );
 * }
 * ```
 */
export function useWagmiSigner({ chainId }: { chainId?: number } = {}) {
    const { data: client } = useConnectorClient<Config>({ chainId });
    return useMemo(() => (client ? clientToSigner(client) : undefined), [client]);
} 