export * as ThemeBuilder from "./theming/theme";

import Mash from "./Mash";

export default Mash;

export { default as Targets } from "./rpc/targets";

export {
  FloatLocation,
  MashSettings,
  WalletPosition,
  DesktopSettings,
  MobileSettings,
} from "./settings";

export {
  Events as IFrameEvents,
  IFRAME_NAME as MashIFrameName,
} from "./IFrame";
