import { Address } from "@ton/core";
import { TonConnectTransactionPayloadMessage } from "../../entries/notificationMessage";
import {
  QueryType,
  getCachedStoreValue,
  setCachedStoreValue,
} from "../../store/browserStore";

export interface Restrictions {
  origin: string[];
  address: string[];
}

export const getRestrictions = async () => {
  try {
    let data = await getCachedStoreValue<Restrictions>(QueryType.restriction);

    if (!data) {
      const response = await fetch(
        "https://raw.githubusercontent.com/OpenProduct/openmask-extension/main/resources/restrictions.json"
      );

      if (response.status !== 200) {
        throw new Error(response.statusText);
      }
      data = (await response.json()) as Restrictions;
      await setCachedStoreValue(QueryType.restriction, data);
    }

    return data;
  } catch (e) {
    console.log(e);
    return { origin: [], address: [] };
  }
};

export const validateAddressRestrictions = async (address: string) => {
  const restrictions = await getRestrictions();

  restrictions.address.forEach((a) => {
    if (Address.parse(a).equals(Address.parse(address))) {
      throw new Error(`Address ${a} restricted`);
    }
  });
};

export const validateTonConnectRestrictions = async (
  origin: string,
  state: TonConnectTransactionPayloadMessage[]
) => {
  const restrictions = await getRestrictions();

  restrictions.origin.forEach((o) => {
    if (o === origin) {
      throw new Error(`Origin ${o} restricted`);
    }
  });

  state.forEach((item) => {
    restrictions.address.forEach((a) => {
      if (Address.parse(a).equals(Address.parse(item.address))) {
        throw new Error(`Address ${a} restricted`);
      }
    });
  });
};
