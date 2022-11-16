import parse, { Config } from "./config.js";

describe("Config", () => {
  it("empty config passed in, should set defaults", () => {
    const result = parse({ earnerID: "1" });
    expect(result).toEqual({
      autoHide: true,
      earnerID: "1",
      src: "https://wallet.getmash.com/widget",
      theme: { inject: true },
      widgets: { inject: true },
    });
  });

  it("custom config, should set values based on custom config", () => {
    const config: Config = {
      earnerID: "1",
      autoHide: false,
      src: "testsite",
      theme: { inject: false },
      widgets: { inject: false },
    };
    const result = parse(config);
    expect(result).toEqual(config);
  });
});
