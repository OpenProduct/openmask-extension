import { Route, Routes } from "react-router-dom";
import { Create } from "./CreateWallet";
import { Import } from "./ImportWallet";

export enum ConnectRoutes {
  import = "/import",
  create = "/create",
}

export const ConnectWallet = () => {
  return (
    <Routes>
      <Route path={ConnectRoutes.import} element={<Import />} />
      <Route path={ConnectRoutes.create} element={<Create />} />
    </Routes>
  );
};
