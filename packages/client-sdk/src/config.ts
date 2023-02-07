import type { PartialDeep } from "type-fest";

type WidgetConfig = {
  /**
   * Base URL of hosted web components.
   */
  baseURL: string;
  /**
   * Controls whether to inject Mash Theme css file.
   */
  injectTheme: boolean;
  /**
   * @deprecated since version 2.13.0. Use injectWebComponentScripts
   */
  injectWidgets?: boolean;
  /**
   * Controls whether to inject Mash Web Component scripts tags to automatically
   * define web components.
   */
  injectWebComponentScripts: boolean;
  /**
   * Controls whether to inject Mash Floating Widget such as boosts.
   */
  injectFloatingWidgets: boolean;
};

// Local properties that are replicated serverside in the remote
// config. Specifying them overrides remote (local takes precendence).
export type Config = {
  /**
   * URL of Mash API.
   */
  api: string;
  /**
   * Earner ID generated by Mash Platform.
   */
  earnerID: string;
  /**
   * Mash Button App URL.
   */
  walletURL: string;
  /**
   * Mash Preboadring Modal App URL.
   */
  preboardingURL: string;
  /**
   * Widget Configuration. See WidgetConfig.
   */
  widgets: WidgetConfig;
  /**
   * Controls whether the Mash Button App will be automatically hidden
   * if no Mash elements exists on the page.
   */
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
  injectWebComponentScripts: true,
  injectFloatingWidgets: true,
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
