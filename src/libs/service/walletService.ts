import BN from "bn.js";
import TonWeb from "tonweb";
import { getNetworkConfig } from "../entries/network";
import { ErrorCode, RuntimeError } from "../exception";
import { getAccountState, getNetwork } from "../store/browserStore";

export const confirmWalletSeqNo = async (walletSeqNo: number) => {
  const network = await getNetwork();
  const config = getNetworkConfig(network);

  const provider = new TonWeb.HttpProvider(config.rpcUrl, {
    apiKey: config.apiKey,
  });

  const { activeWallet } = await getAccountState(network);

  if (!activeWallet) {
    throw new RuntimeError(
      ErrorCode.unexpectedParams,
      "Unexpected active wallet"
    );
  }

  const bn: BN = await provider.call2(activeWallet, "seqno");
  let currentSeqNo = bn.toNumber();
  if (walletSeqNo === currentSeqNo - 1) {
    return;
  }
  if (walletSeqNo !== currentSeqNo) {
    throw new RuntimeError(ErrorCode.unexpectedParams, "Unexpected SeqNo");
  }

  do {
    await new Promise((resolve) => setTimeout(resolve, 4000));

    try {
      const bn: BN = await provider.call2(activeWallet, "seqno");
      currentSeqNo = bn.toNumber();
    } catch (e) {
      console.error(e);
    }
  } while (currentSeqNo <= walletSeqNo);
};
