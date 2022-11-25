import { useEffect, useState } from "react";
import { delay } from "../../libs/state/accountService";

export const useInitialRendering = () => {
  const [isInitial, setInitial] = useState(true);

  useEffect(() => {
    delay(1000).then(() => setInitial(false));
  }, []);

  return isInitial;
};
