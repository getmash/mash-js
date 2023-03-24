import { PartialDeep } from "type-fest";

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
  WixActionBar = "wix_action_bar",
}

export enum PageTarget {
  All = "all",
  Exclude = "exclude_pages",
  Include = "include_pages",
}

export enum MatchType {
  StartsWith = "starts_with",
  Contains = "contains",
  Equals = "equals",
}

export type Theme = {
  primaryColor: string;
  fontFamily: string;
};

export type WalletButtonShiftConfiguration = {
  horizontal: number;
  vertical: number;
};

// https://github.com/getmash/mash/blob/main/platform/api/spec/mash.yaml#L1369
export type WalletButtonDesktopPosition = {
  floatSide: WalletButtonFloatSide;
  floatPlacement: WalletButtonFloatPlacement;
  customShiftConfiguration: WalletButtonShiftConfiguration;
};

// https://github.com/getmash/mash/blob/main/platform/api/spec/mash.yaml#L1384
export type WalletButtonMobilePosition = Omit<
  WalletButtonDesktopPosition,
  "customShiftConfiguration"
>;

export type WalletButtonPosition = {
  desktop: WalletButtonDesktopPosition;
  mobile: WalletButtonMobilePosition;
};

export type BoostDesktopConfiguration = {
  size: string;
  mode: string;
  position: string;
};

export type BoostMobileConfiguration = {
  size: string;
  mode: string;
  position: string;
};

export type PageMatcher = {
  id: string;
  matchType: MatchType;
  matchText: string;
};

export type PageSelection = {
  target: PageTarget;
  matchers: PageMatcher[];
};

export type BoostConfiguration = {
  active: boolean;
  icon: string;
  style: string;
  desktop: BoostDesktopConfiguration;
  mobile: BoostMobileConfiguration;
  pages: PageSelection;
};

export type PageRevealer = {
  id: string;
  active: boolean;
  pages: PageSelection;
  contentTypeID: string;
  template: string;
  templateImage?: string;
  templateImageColor?: string;
  logoEnabled: boolean;
  logoURL?: string;
  textAlignment: string;
  title: string;
  message?: string;
  bullets?: string[];
  buttonColor?: string;
  fontFamily?: string;
};

export type EarnerCustomizationConfiguration = {
  walletButtonPosition: WalletButtonPosition;
  theme: Theme;
  boostConfigurations: BoostConfiguration[];
  pageRevealers: PageRevealer[];
  autoHide: boolean;
};

export type Earner = {
  id: string;
  handle: string;
  customization: EarnerCustomizationConfiguration;
};

export function getEarner(baseURL: string, earnerID: string): Promise<Earner> {
  const request = new Request(`${baseURL}/earners/${earnerID}`);
  return fetch(request).then(data => data.json());
}

export const defaultEarnerCustomizationConfig: EarnerCustomizationConfiguration =
  {
    walletButtonPosition: {
      desktop: {
        floatSide: WalletButtonFloatSide.Right,
        floatPlacement: WalletButtonFloatPlacement.Default,
        customShiftConfiguration: { horizontal: 0, vertical: 0 },
      },
      mobile: {
        floatSide: WalletButtonFloatSide.Right,
        floatPlacement: WalletButtonFloatPlacement.Default,
      },
    },
    theme: {
      primaryColor: "#000",
      fontFamily: "inherit",
    },
    boostConfigurations: [],
    pageRevealers: [],
    autoHide: false,
  };

type NotOverridableConfig = Omit<
  EarnerCustomizationConfiguration,
  "autoHide" | "walletButtonPosition"
>;

export function mergeEarnerCustomizationConfig(
  config: EarnerCustomizationConfiguration,
  overrides: PartialDeep<EarnerCustomizationConfiguration>,
): EarnerCustomizationConfiguration {
  // The 3 values defined here cannot be overriden currently through SDK
  const statik: NotOverridableConfig = {
    theme: config.theme,
    boostConfigurations: config.boostConfigurations,
    pageRevealers: config.pageRevealers,
  };

  const autoHide = overrides.autoHide ?? config.autoHide;

  const desktop: WalletButtonDesktopPosition = {
    floatSide:
      overrides.walletButtonPosition?.desktop?.floatSide ||
      config.walletButtonPosition.desktop.floatSide,
    floatPlacement:
      overrides.walletButtonPosition?.desktop?.floatPlacement ||
      config.walletButtonPosition.desktop.floatPlacement,
    customShiftConfiguration: {
      horizontal:
        overrides.walletButtonPosition?.desktop?.customShiftConfiguration
          ?.horizontal ||
        config.walletButtonPosition.desktop.customShiftConfiguration.horizontal,
      vertical:
        overrides.walletButtonPosition?.desktop?.customShiftConfiguration
          ?.vertical ||
        config.walletButtonPosition.desktop.customShiftConfiguration.vertical,
    },
  };

  const mobile: WalletButtonMobilePosition = {
    floatSide:
      overrides.walletButtonPosition?.mobile?.floatSide ||
      config.walletButtonPosition.mobile.floatSide,
    floatPlacement:
      overrides.walletButtonPosition?.mobile?.floatPlacement ||
      config.walletButtonPosition.mobile.floatPlacement,
  };

  return { ...statik, autoHide, walletButtonPosition: { desktop, mobile } };
}
