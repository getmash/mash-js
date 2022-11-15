import type { PartialDeep } from "type-fest";

type Injectable = {
  inject: boolean;
  baseUrl: string;
};

type WidgetsConfig = Injectable;

type ThemeConfig = Injectable;

export type Config = {
  autoHide: boolean;
  earnerID: string;
  src: string;
  theme: ThemeConfig;
  widgets: WidgetsConfig;
};

export type PartialConfig = PartialDeep<Config> & { earnerID: string };

const DEFAULT_MASH_SRC = "https://wallet.getmash.com/widget";
const WIDGETS_HOSTNAME = "https://widgets.getmash.com";

const DEFAULT_WIDGETS_CONFIG: WidgetsConfig = {
  inject: true,
  baseUrl: WIDGETS_HOSTNAME,
};

const DEFAULT_THEME_CONFIG: ThemeConfig = {
  inject: true,
  baseUrl: WIDGETS_HOSTNAME,
};

export default function parse(config: PartialConfig): Config {
  return {
    autoHide: config.autoHide ?? true,
    earnerID: config.earnerID,
    src: config.src || DEFAULT_MASH_SRC,
    theme: Object.assign({}, DEFAULT_THEME_CONFIG, config.theme || {}),
    widgets: Object.assign({}, DEFAULT_WIDGETS_CONFIG, config.widgets || {}),
  };
}
