type Injectable = {
  inject: boolean;
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

export type PartialConfig = Partial<Config> & { earnerID: string };

const DEFAULT_MASH_SRC = "https://wallet.getmash.com/widget";

const DEFAULT_WIDGETS_CONFIG: WidgetsConfig = { inject: true };

const DEFAULT_THEME_CONFIG: ThemeConfig = { inject: true };

export default function parse(config: PartialConfig): Config {
  return {
    autoHide: config.autoHide ?? true,
    earnerID: config.earnerID,
    src: config.src || DEFAULT_MASH_SRC,
    theme: Object.assign({}, DEFAULT_THEME_CONFIG, config.theme || {}),
    widgets: Object.assign({}, DEFAULT_WIDGETS_CONFIG, config.widgets || {}),
  };
}
