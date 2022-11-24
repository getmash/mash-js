import Mash from "./Mash.js";
export default Mash;

export { MashSettings } from "./Mash.js";

export { default as Targets } from "./rpc/targets.js";

export {
  FloatLocation,
  WalletPosition,
  DesktopSettings,
  MobileSettings,
} from "./iframe/position.js";

export {
  Events as IFrameEvents,
  IFRAME_NAME as MashIFrameName,
} from "./iframe/IFrame.js";

export { APIEnvironment } from "./config.js";
