import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";
import { AppRoute } from "../routes";
import { useConnections } from "../screen/connections/api";
import { useActiveTabs } from "../screen/notifications/connect/api";
import { Badge } from "./Components";

const Connect = styled(Badge)`
  position: absolute;
  left: ${(props) => props.theme.padding};
  padding: 5px 8px;
  font-size: smaller;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Dot = styled.div<{ isConnected: boolean }>`
width: 5px;
height: 5px;
border-radius: 50%;

${(props) =>
  props.isConnected
    ? css`
        background: green;
      `
    : css`
        background: red;
      `}}
`;

export const ConnectBadge = () => {
  const navigate = useNavigate();

  const { data: connections } = useConnections();
  const { data: tab } = useActiveTabs();

  const isConnected = useMemo(() => {
    if (!connections || !tab || !tab.url) return false;
    const url = new URL(tab.url);
    return connections[url.origin] != null;
  }, [connections, tab]);

  return (
    <Connect onClick={() => navigate(AppRoute.connections)}>
      {isConnected ? (
        <>
          <Dot isConnected />
          <span>Connected</span>
        </>
      ) : (
        <>Not Connected</>
      )}
    </Connect>
  );
};
