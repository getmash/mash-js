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

export const DefaultMashSrc = "https://wallet.getmash.com/widget";

export const DefaultWidgetBaseURL = "https://widgets.getmash.com";

const DEFAULT_WIDGETS_CONFIG: WidgetConfig = {
  baseURL: DefaultWidgetBaseURL,
  injectTheme: true,
  injectWidgets: true,
};

export default function parse(config: PartialConfig): Config {
  return {
    autoHide: config.autoHide ?? true,
    earnerID: config.earnerID,
    src: config.src || DefaultMashSrc,
    widgets: Object.assign({}, DEFAULT_WIDGETS_CONFIG, config.widgets),
  };
}
