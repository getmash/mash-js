import type { PartialDeep } from "type-fest";

type WidgetConfig = {
  baseURL: string;
  injectTheme: boolean;
  injectWidgets: boolean;
};

export type Config = {
  api: string;
  autoHide: boolean;
  earnerID: string;
  walletURL: string;
  widgets: WidgetConfig;
};

export type PartialConfig = PartialDeep<Config> & { earnerID: string };

export const DefaultAPIBaseURL = "https://api.getmash.com";
export const DefaultWalletURL = "https://wallet.getmash.com/widget";
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
    autoHide: config.autoHide ?? false,
    walletURL: config.walletURL || DefaultWalletURL,
    widgets: { ...DEFAULT_WIDGETS_CONFIG, ...config.widgets },
  };
}
