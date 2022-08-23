import { Route, Routes } from "react-router-dom";
import { any } from "../../routes";
import { Create } from "./CreateWallet";
import { Import } from "./ImportWallet";

export enum ConnectRoutes {
  import = "/import",
  create = "/create",
}

export const ConnectWallet = () => {
  return (
    <Routes>
      <Route path={any(ConnectRoutes.import)} element={<Import />} />
      <Route path={any(ConnectRoutes.create)} element={<Create />} />
    </Routes>
  );
};
