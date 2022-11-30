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
    api: config.api || DefaultAPIBaseURL,
    autoHide: config.autoHide ?? false,
    earnerID: config.earnerID,
    walletURL: config.walletURL || DefaultWalletURL,
    widgets: Object.assign({}, DEFAULT_WIDGETS_CONFIG, config.widgets),
  };
}
