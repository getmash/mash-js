import type { PartialDeep } from "type-fest";

type WidgetConfig = {
  baseURL: string;
  injectTheme: boolean;
  injectWidgets: boolean;
};

export type Config = {
  api: string;
  earnerID: string;
  walletURL: string;
  preboardingURL: string;
  widgets: WidgetConfig;
  // Local properties that are replicated serverside in the remote
  // config. Specifying them overrides remote (local takes precendence).
  autoHide?: boolean;
};

export type PartialConfig = PartialDeep<Config> & { earnerID: string };

export const DefaultAPIBaseURL = "https://api.getmash.com";
export const DefaultWalletURL = "https://wallet.getmash.com/widget";
export const DefaultPreboardingURL = "https://wallet.getmash.com/preboarding";
export const DefaultWidgetBaseURL = "https://widgets.getmash.com";

const DEFAULT_WIDGETS_CONFIG: WidgetConfig = {
  baseURL: DefaultWidgetBaseURL,
  injectTheme: true,
  injectWidgets: true,
};

export default function parse(config: PartialConfig): Config {
  return {
    earnerID: config.earnerID,
    api: config.api || DefaultAPIBaseURL,
    walletURL: config.walletURL || DefaultWalletURL,
    preboardingURL: config.preboardingURL || DefaultPreboardingURL,
    widgets: { ...DEFAULT_WIDGETS_CONFIG, ...config.widgets },
    autoHide: config.autoHide,
  };
}
