import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Body,
  ButtonNegative,
  ButtonPositive,
  ButtonRow,
  Gap,
  H1,
  Text,
} from "../../../../../components/Components";
import { AppRoute } from "../../../../../routes";
import { useHideJettonMutation } from "./api";
import { JettonStateContext } from "./context";

export const JettonHide = () => {
  const jetton = useContext(JettonStateContext);
  const navigate = useNavigate();

  const { mutateAsync, isLoading } = useHideJettonMutation();

  const onDelete = async () => {
    await mutateAsync(jetton.minterAddress);
    navigate(AppRoute.home);
  };

  if (!jetton) return <></>;

  return (
    <Body>
      <H1>Hide Jetton</H1>
      <Text>
        Hiding <b>{jetton.state.name}</b> Jetton will clear local stored data.
      </Text>
      <Text>The Jetton could be re-enter by Jetton Minter address.</Text>
      <Gap />
      <ButtonRow>
        <ButtonNegative onClick={() => navigate("../")} disabled={isLoading}>
          Cancel
        </ButtonNegative>
        <ButtonPositive onClick={onDelete} disabled={isLoading}>
          Hide
        </ButtonPositive>
      </ButtonRow>
    </Body>
  );
};
