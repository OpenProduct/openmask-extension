import { ALL, hexToBytes } from "@openproduct/web-sdk";
import { useMutation } from "@tanstack/react-query";
import { useContext } from "react";
import {
  TonAddressItemReply,
  TonConnectItemReply,
  TonConnectNETWORK,
  TonConnectRequest,
} from "../../../../libs/entries/notificationMessage";
import { Permission } from "../../../../libs/entries/permission";
import { addDAppAccess } from "../../../../libs/state/connectionSerivce";
import {
  getConnections,
  setConnections,
} from "../../../../libs/store/browserStore";
import {
  AccountStateContext,
  NetworkContext,
  TonProviderContext,
} from "../../../context";
import { sendBackground } from "../../../event";

interface ConnectParams {
  origin: string;
  wallet: string;
  id: number;
  logo: string | null;
  data: TonConnectRequest;
}

export const useAddConnectionMutation = () => {
  const network = useContext(NetworkContext);

  const account = useContext(AccountStateContext);
  const ton = useContext(TonProviderContext);

  return useMutation<void, Error, ConnectParams>(
    async ({ origin, wallet, id, logo, data }) => {
      const walletState = account.wallets.find(
        (item) => item.address === wallet
      );
      if (!walletState) {
        throw new Error("Unexpected wallet state");
      }

      const WalletClass = ALL[walletState.version];
      const walletContract = new WalletClass(ton, {
        publicKey: hexToBytes(walletState.publicKey),
        wc: 0,
      });

      const { stateInit, address } = await walletContract.createStateInit();

      const payload: TonConnectItemReply[] = [];
      for (let item of data.items) {
        if (item.name === "ton_addr") {
          const result: TonAddressItemReply = {
            name: "ton_addr",
            address: address.toString(false),
            network:
              network == "mainnet"
                ? TonConnectNETWORK.MAINNET
                : TonConnectNETWORK.TESTNET,
            walletStateInit: stateInit.toBase64(),
          };
          payload.push(result);
        } else if (item.name === "ton_proof") {
        }
      }

      const connections = await getConnections(network);

      addDAppAccess(connections, logo, origin, [wallet], [Permission.base]);

      await setConnections(connections, network);

      sendBackground.message("approveRequest", { id, payload });
    }
  );
};
