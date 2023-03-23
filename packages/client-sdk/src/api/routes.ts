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

export type WalletButtonDevicePosition = {
  floatSide: WalletButtonFloatSide;
  floatPlacement: WalletButtonFloatPlacement;
  customShiftConfiguration: WalletButtonShiftConfiguration;
};

export type WalletButtonPosition = {
  desktop: WalletButtonDevicePosition;
  mobile: WalletButtonDevicePosition;
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
        customShiftConfiguration: { horizontal: 0, vertical: 0 },
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

function mergeDeviceConfig(
  config: WalletButtonDevicePosition,
  override?: PartialDeep<WalletButtonDevicePosition>,
): WalletButtonDevicePosition {
  if (!override) return config;
  return {
    floatSide: override.floatSide || config.floatSide,
    floatPlacement: override.floatPlacement || config.floatPlacement,
    customShiftConfiguration: {
      horizontal:
        override.customShiftConfiguration?.horizontal ||
        config.customShiftConfiguration.horizontal,
      vertical:
        override.customShiftConfiguration?.vertical ||
        config.customShiftConfiguration.vertical,
    },
  };
}

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

  const desktop = mergeDeviceConfig(
    config.walletButtonPosition.desktop,
    overrides.walletButtonPosition?.desktop,
  );

  const mobile = mergeDeviceConfig(
    config.walletButtonPosition.mobile,
    overrides.walletButtonPosition?.mobile,
  );

  return { ...statik, autoHide, walletButtonPosition: { desktop, mobile } };
}
