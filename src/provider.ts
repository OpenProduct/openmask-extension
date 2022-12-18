import { TonProvider } from "./libs/provider";
import { TonConnect } from "./libs/provider/tonconnect";

const havePrevInstance = !!window.ton;

const provider = new TonProvider(window?.ton);
const tonconnect = new TonConnect(provider, window?.openmask?.tonconnect);

window.tonProtocolVersion = 2;
window.ton = provider;
window.openmask = {
  provider,
  tonconnect,
};

if (!havePrevInstance) {
  window.dispatchEvent(new Event("tonready"));
}
