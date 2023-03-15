import { Route, Routes, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Body, H1 } from "../../../components/Components";
import { HomeButton } from "../../../components/HomeButton";
import { ArrowForwardIcon } from "../../../components/Icons";
import { any, relative } from "../../../routes";
import { LadgerWallet } from "./LadgerHardwareWallet";

export enum HardwareRoutes {
  ladger = "/ladger",
  index = "/",
}

const Item = styled.div`
  color: ${(props) => props.theme.darkBlue};
  cursor: pointer;
  font-width: bold;
  padding: ${(props) => props.theme.padding} 0;
  border-bottom: 1px solid ${(props) => props.theme.darkGray};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HardwareIndex = () => {
  const navigator = useNavigate();

  return (
    <>
      <HomeButton />
      <Body>
        <H1>Connect Harware</H1>

        <Item onClick={() => navigator(relative(HardwareRoutes.ladger))}>
          <span>Ladger Hardware Wallet USB</span>
          <ArrowForwardIcon />
        </Item>
      </Body>
    </>
  );
};

export const Hardware = () => {
  return (
    <Routes>
      <Route path={any(HardwareRoutes.ladger)} element={<LadgerWallet />} />
      <Route index element={<HardwareIndex />} />
    </Routes>
  );
};
