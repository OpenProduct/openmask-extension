import { Address, NftContentDao, TonHttpProvider } from "@openproduct/web-sdk";
import { NftItemState, NftItemStateSchema } from "../entries/asset";
import { requestJson } from "./requestService";

export const getNftData = async (
  provider: TonHttpProvider,
  nftAddress: string
) => {
  const address = new Address(nftAddress);
  const dao = new NftContentDao(provider, address);
  return await dao.getData();
};

export const getNftItemState = async (jsonUrl: string) => {
  const state = await requestJson<NftItemState>(jsonUrl);
  return await NftItemStateSchema.validateAsync(state);
};

export const seeIfSameAddress = (
  one?: Address | string | null,
  two?: Address | string | null
) => {
  if (!one || !two) return false;

  try {
    const oneAddress = new Address(one).toString(false);
    const twoAddress = new Address(two).toString(false);
    return oneAddress === twoAddress;
  } catch (e) {
    return false;
  }
};
