import { JsonRpcSigner, ethers } from 'ethers';
import mainContractAbi from './abi/mainContractAbi.json';

interface TokenInfo {
  name: string;
  symbol: string;
  initAmountIn: string;
  description: string;
  extended: string;
  tokenUrlImage: string;
}

const mainContractAddress = '0xA54b0184D12349Cf65281C6F965A74828DDd9E8F';

export const createTokenOnContract = async (
  ethersSigner: JsonRpcSigner,
  tokenInfo: TokenInfo,
): Promise<{ tokenAddress: string; txHash: string } | undefined> => {
  const mainContract = new ethers.Contract(
    mainContractAddress,
    mainContractAbi,
    ethersSigner,
  );

  const creationFee = await mainContract.creationFee_();
  const valueAmount = ethers.parseEther(tokenInfo.initAmountIn);
  const totalValue = creationFee + valueAmount;

  const tx = await mainContract.createNewToken(
    tokenInfo.name,
    tokenInfo.symbol,
    tokenInfo.initAmountIn,
    tokenInfo.description,
    tokenInfo.extended,
    tokenInfo.tokenUrlImage,
    '0x', // empty referral data
    {
      value: totalValue.toString(),
    },
  );

  const txReceipt = tx.wait();

  let tokenAddress;

  if (txReceipt && txReceipt.logs) {
    for (const log of txReceipt.logs) {
      if (log.topics && log.topics[1] === ethers.ZeroHash) {
        tokenAddress = log.address;
        break;
      }
    }
  }
  return { txHash: tx.hash, tokenAddress };
};
