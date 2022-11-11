import Mash from "./Mash.js";

export default Mash;

export { default as Targets } from "./rpc/targets.js";

export {
  FloatLocation,
  MashSettings,
  WalletPosition,
  DesktopSettings,
  MobileSettings,
} from "./settings.js";

export {
  Events as IFrameEvents,
  IFRAME_NAME as MashIFrameName,
} from "./IFrame.js";
