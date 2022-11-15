import parse, { Config } from "./config.js";

describe("Config", () => {
  it("empty config passed in, should set defaults", () => {
    const result = parse({ earnerID: "1" });
    expect(result).toEqual<Config>({
      autoHide: true,
      earnerID: "1",
      src: "https://wallet.getmash.com/widget",
      theme: { inject: true, baseUrl: "https://widgets.getmash.com" },
      widgets: { inject: true, baseUrl: "https://widgets.getmash.com" },
    });
  });

  it("custom config, should set values based on custom config", () => {
    const config: Config = {
      earnerID: "1",
      autoHide: false,
      src: "testsite",
      theme: { inject: false, baseUrl: "url" },
      widgets: { inject: false, baseUrl: "url" },
    };
    const result = parse(config);
    expect(result).toEqual<Config>(config);
  });
});
