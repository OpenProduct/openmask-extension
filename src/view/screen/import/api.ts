import { Address, ALL, bytesToHex, HttpProvider } from "@openmask/web-sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import * as tonMnemonic from "tonweb-mnemonic";
import { WalletState, WalletVersion } from "../../../libs/entries/wallet";
import { NotificationData } from "../../../libs/event";
import { encrypt } from "../../../libs/service/cryptoService";
import {
  AccountStateContext,
  NetworkContext,
  TonProviderContext,
} from "../../context";
import { askBackground } from "../../event";
import { saveAccountState, validateMnemonic } from "../api";

export const askBackgroundPassword = async () => {
  const password = await askBackground<string | null>().message("getPassword");
  if (password == null || password === "") {
    throw new Error("Unexpected password");
  }
  return password;
};

export const askBackgroundNotification = async () => {
  return await askBackground<NotificationData | undefined>().message(
    "getNotification"
  );
};

const lastWalletVersion = "v4R2";

const createWallet = async (
  ton: HttpProvider,
  mnemonic: string,
  password: string,
  index: number
): Promise<WalletState> => {
  const encryptedMnemonic = await encrypt(mnemonic, password);
  const keyPair = await tonMnemonic.mnemonicToKeyPair(mnemonic.split(" "));

  const WalletClass = ALL[lastWalletVersion];
  const walletContract = new WalletClass(ton, {
    publicKey: keyPair.publicKey,
    wc: 0,
  });
  const address = await walletContract.getAddress();

  return {
    name: `Account ${index}`,
    mnemonic: encryptedMnemonic,
    address: address.toString(true, true, true),
    publicKey: bytesToHex(keyPair.publicKey),
    version: lastWalletVersion,
    isBounceable: true,
  };
};

export const useCreateWalletMutation = () => {
  const network = useContext(NetworkContext);
  const ton = useContext(TonProviderContext);
  const account = useContext(AccountStateContext);
  const client = useQueryClient();

  return useMutation<void, Error, string>(async (mnemonic) => {
    const password = await askBackgroundPassword();

    const wallet = await createWallet(
      ton,
      mnemonic,
      password,
      account.wallets.length + 1
    );

    const value = {
      ...account,
      wallets: [...account.wallets, wallet],
      activeWallet: wallet.address,
    };
    await saveAccountState(network, client, value);
  });
};

const findContract = async (
  ton: HttpProvider,
  keyPair: tonMnemonic.KeyPair
): Promise<[WalletVersion, Address]> => {
  for (let [version, WalletClass] of Object.entries(ALL)) {
    const wallet = new WalletClass(ton, {
      publicKey: keyPair.publicKey,
      wc: 0,
    });

    const walletAddress = await wallet.getAddress();
    const balance = await ton.getBalance(walletAddress.toString());
    if (balance !== "0") {
      return [version, walletAddress] as [WalletVersion, Address];
    }
  }

  const WalletClass = ALL[lastWalletVersion];
  const walletContract = new WalletClass(ton, {
    publicKey: keyPair.publicKey,
    wc: 0,
  });
  const address = await walletContract.getAddress();
  return [lastWalletVersion, address];
};

export const importWallet = async (
  ton: HttpProvider,
  mnemonic: string[],
  password: string,
  index: number
): Promise<WalletState> => {
  const encryptedMnemonic = await encrypt(mnemonic.join(" "), password);
  const keyPair = await tonMnemonic.mnemonicToKeyPair(mnemonic);
  const [version, address] = await findContract(ton, keyPair);

  return {
    name: `Account ${index}`,
    mnemonic: encryptedMnemonic,
    address: address.toString(true, true, true),
    publicKey: bytesToHex(keyPair.publicKey),
    version,
    isBounceable: true,
  };
};

export const useImportWalletMutation = () => {
  const client = useQueryClient();
  const ton = useContext(TonProviderContext);
  const network = useContext(NetworkContext);
  const data = useContext(AccountStateContext);

  return useMutation<void, Error, string>(async (value) => {
    const password = await askBackgroundPassword();

    const mnemonic = value.trim().split(" ");
    validateMnemonic(mnemonic);

    const wallet = await importWallet(
      ton,
      mnemonic,
      password,
      data.wallets.length + 1
    );
    if (data.wallets.some((w) => w.address === wallet.address)) {
      throw new Error("Wallet already connect");
    }
    const wallets = data.wallets.concat([wallet]);
    const state = {
      ...data,
      wallets,
      activeWallet: wallet.address,
    };
    await saveAccountState(network, client, state);
  });
};
