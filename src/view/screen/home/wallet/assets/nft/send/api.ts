import { useMutation } from "@tanstack/react-query";

export interface SendNftState {
  address: string;
  amount: string; // 0.05
  forwardAmount: string; // 0.05
}

export const toSendNftState = (searchParams: URLSearchParams): SendNftState => {
  return {
    address: decodeURIComponent(searchParams.get("address") ?? ""),
    amount: decodeURIComponent(searchParams.get("amount") ?? ""),
    forwardAmount: decodeURIComponent(
      searchParams.get("transactionAmount") ?? ""
    ),
  };
};

export const stateToSearch = (state: SendNftState) => {
  return Object.entries(state).reduce((acc, [key, value]) => {
    acc[key] = encodeURIComponent(value);
    return acc;
  }, {} as Record<string, string>);
};

export const useTransferMutation = () => {
  return useMutation(async () => {
    return true;
  });
};

//   public async transfer(
//     params: Omit<NftTransferParams, 'address'>,
//     options?: { useCurrentWallet?: boolean },
//   ) {
//     let wallet: WalletContract;
//     if (options?.useCurrentWallet) {
//       wallet = this.getCurrentWallet();
//     } else {
//       const ownerAddress = await this.getOwnerAddressByItem(params.nftItemAddress);
//       wallet = await this.getWalletByAddress(ownerAddress);
//     }

//     const seqno = await this.getSeqno(wallet);
//     const responseAddress = await wallet.getAddress();

//     const forwardPayload = new TextEncoder().encode(params.text ?? '');
//     const forwardAmount = this.toNano(params.forwardAmount);
//     const amount = this.toNano(params.amount);

//     const newOwnerAddress = new TonWeb.utils.Address(params.newOwnerAddress);
//     const nftItemAddress = new TonWeb.utils.Address(params.nftItemAddress);
//     const nftItem = new NftItem(wallet.provider, { address: nftItemAddress });

//     const payload = await nftItem.createTransferBody({
//       responseAddress,
//       newOwnerAddress,
//       forwardPayload,
//       forwardAmount,
//     });

//     return this.methods(wallet, {
//       toAddress: nftItemAddress,
//       amount: amount,
//       sendMode: 3,
//       payload,
//       seqno,
//     });
//   }
