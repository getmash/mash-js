type WidgetConfig = {
  baseURL: string;
  injectTheme: boolean;
  injectWidgets: boolean;
};

export type Config = {
  autoHide: boolean;
  earnerID: string;
  src: string;
  widgets: WidgetConfig;
};

export type PartialConfig = Partial<Config> & { earnerID: string };

const DEFAULT_MASH_SRC = "https://wallet.getmash.com/widget";

const DEFAULT_WIDGETS_CONFIG: WidgetConfig = {
  baseURL: "https://widgets.getmash.com",
  injectTheme: true,
  injectWidgets: true,
};

export default function parse(config: PartialConfig): Config {
  return {
    autoHide: config.autoHide ?? true,
    earnerID: config.earnerID,
    src: config.src || DEFAULT_MASH_SRC,
    widgets: Object.assign({}, DEFAULT_WIDGETS_CONFIG, config.widgets),
  };
}
