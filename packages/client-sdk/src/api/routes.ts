import { APIEnvironment } from "../config.js";

function getAPI(env: APIEnvironment) {
  if (env === APIEnvironment.Local) return "http://localhost:8080";
  if (env === APIEnvironment.Dev) return "https://api.dev.getmash.com";
  return "https://api.getmash.com";
}

export enum WalletButtonFloatSide {
  Left = "left",
  Right = "right",
}

export enum WalletButtonFloatPlacement {
  Default = "default",
  Custom = "custom",
  Ghost = "ghost",
  Intercom = "intercom",
  BasicShiftVertical = "basic_shift_vertical",
  BasicShiftHorizontal = "basic_shift_horizontal",
}

export type Theme = {
  primaryColor: string;
  fontFamily: string;
};

export type WalletButtonShiftConfiguration = {
  horizontal: number;
  vertical: number;
};

export type WalletButtonDesktopPosition = {
  floatSide: WalletButtonFloatSide;
  floatPlacement: WalletButtonFloatPlacement;
  customShiftConfiguration: WalletButtonShiftConfiguration;
};

export type WalletButtonMobilePosition = {
  floatSide: WalletButtonFloatSide;
};

export type WalletButtonPosition = {
  desktop: WalletButtonDesktopPosition;
  mobile: WalletButtonMobilePosition;
};

export type EarnerCustomizationConfiguration = {
  walletButtonPosition: WalletButtonPosition;
  theme: Theme;
};

export type Earner = {
  id: string;
  handle: string;
  customization: EarnerCustomizationConfiguration;
};

export function GetEarner(
  env: APIEnvironment,
  earnerID: string,
): Promise<Earner> {
  const request = new Request(`${getAPI(env)}/earners/${earnerID}`);
  return fetch(request).then(data => data.json());
}
