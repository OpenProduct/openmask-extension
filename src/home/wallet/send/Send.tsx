import { FC } from "react";
import { HomeButton } from "../../../components/HomeButton";
import { Wallet } from "../../../lib/state/wallet";

interface SendProps {
  wallet: Wallet;
}

export const Send: FC<SendProps> = ({ wallet }) => {
  return (
    <div>
      <HomeButton />
      <div>Send</div>
    </div>
  );
};
