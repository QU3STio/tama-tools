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
    tokenInfo.name,             // The long name of the coin, e.g. for 0x024ac9ebfadf58b9427b97b489b33349c8313b3b,  Mochi Inu
    tokenInfo.symbol,           // The symbol (e.g. MINU for 0x024ac9ebfadf58b9427b97b489b33349c8313b3b) of the memecoin to be created.
    tokenInfo.initAmountIn,     // This is the amount of memecoin to buy, expressed in RON
    tokenInfo.description,      // The descritpion of the memecoin is shown on the homepage and token page
    tokenInfo.extended,         // This is a dictionary holding the links diplayed on the site. e.g. for 0xd7226e793c93d37c1cbb54b60c1ebc614cebba41, it was {"twitterUrl":"https://twitter.com/StarryMooncakeG","discordUrl":"https://discord.com/invite/starrymooncake"}
    tokenInfo.tokenUrlImage,    // Image for the coin. This should link to the image you want associated with the coin. 
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
