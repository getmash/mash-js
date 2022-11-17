import parse, {
  Config,
  DefaultMashSrc,
  DefaultWidgetBaseURL,
} from "./config.js";

describe("Config", () => {
  it("empty config passed in, should set defaults", () => {
    const result = parse({ earnerID: "1" });
    expect(result).toEqual<Config>({
      autoHide: true,
      earnerID: "1",
      src: DefaultMashSrc,
      widgets: {
        baseURL: DefaultWidgetBaseURL,
        injectTheme: true,
        injectWidgets: true,
      },
    });
  });

  it("custom config, should set values based on custom config", () => {
    const config: Config = {
      earnerID: "1",
      autoHide: false,
      src: "testsite",
      widgets: {
        baseURL: "tester.com",
        injectTheme: false,
        injectWidgets: false,
      },
    };
    const result = parse(config);
    expect(result).toEqual(config);
  });
});
