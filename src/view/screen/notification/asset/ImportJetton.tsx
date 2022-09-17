import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Body, Center, H1 } from "../../../components/Components";
import { DAppBadge } from "../../../components/DAppBadge";
import { sendBackground } from "../../../event";
import { Loading } from "../../Loading";
import { useJettonMinterData } from "./api";

export const ImportJetton = () => {
  const [searchParams] = useSearchParams();
  const origin = decodeURIComponent(searchParams.get("origin") ?? "");
  const logo = decodeURIComponent(searchParams.get("logo") ?? "");
  const address = decodeURIComponent(searchParams.get("address") ?? "");

  const id = parseInt(searchParams.get("id") ?? "0", 10);

  const { data, isFetching, error } = useJettonMinterData(
    address,
    searchParams
  );

  useEffect(() => {
    if (!address) {
      sendBackground.message("rejectRequest", id);
    }
  }, []);

  if (isFetching) {
    return <Loading />;
  }

  console.log(error);

  return (
    <Body>
      <Center>
        <DAppBadge logo={logo} origin={origin} />
        <H1>Import Jetton</H1>
        {data && <pre>{JSON.stringify(data.state, null, 2)}</pre>}
      </Center>
    </Body>
  );
};
