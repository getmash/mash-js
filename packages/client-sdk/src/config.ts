import type { PartialDeep } from "type-fest";

export enum APIEnvironment {
  Local = "local",
  Dev = "dev",
  Prod = "prod",
}

type WidgetConfig = {
  baseURL: string;
  injectTheme: boolean;
  injectWidgets: boolean;
};

export type Config = {
  api: APIEnvironment;
  autoHide: boolean;
  earnerID: string;
  walletURL: string;
  widgets: WidgetConfig;
};

export type PartialConfig = PartialDeep<Config> & { earnerID: string };

export const DefaultWalletURL = "https://wallet.getmash.com/widget";

export const DefaultWidgetBaseURL = "https://widgets.getmash.com";

const DEFAULT_WIDGETS_CONFIG: WidgetConfig = {
  baseURL: DefaultWidgetBaseURL,
  injectTheme: true,
  injectWidgets: true,
};

export default function parse(config: PartialConfig): Config {
  return {
    api: config.api || APIEnvironment.Prod,
    autoHide: config.autoHide ?? true,
    earnerID: config.earnerID,
    walletURL: config.walletURL || DefaultWalletURL,
    widgets: Object.assign({}, DEFAULT_WIDGETS_CONFIG, config.widgets),
  };
}
