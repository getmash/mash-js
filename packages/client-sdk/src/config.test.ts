import assert from "node:assert/strict";
import { describe, it } from "node:test";

import parse, {
  Config,
  DefaultAPIBaseURL,
  DefaultWalletURL,
  DefaultWidgetBaseURL,
} from "./config.js";

describe("Config", () => {
  it("empty config passed in, should set defaults", () => {
    const result = parse({ earnerID: "1" });
    assert.deepEqual<Config>(result, {
      api: DefaultAPIBaseURL,
      autoHide: undefined,
      earnerID: "1",
      walletURL: DefaultWalletURL,
      widgets: {
        baseURL: DefaultWidgetBaseURL,
        injectTheme: true,
        injectWidgets: true,
      },
    });
  });

  it("custom config, should set values based on custom config", () => {
    const config: Config = {
      api: "http://test.com",
      earnerID: "1",
      autoHide: undefined,
      walletURL: "testsite",
      widgets: {
        baseURL: "tester.com",
        injectTheme: false,
        injectWidgets: false,
      },
    };
    const result = parse(config);
    assert.deepEqual<Config>(result, config);
  });
});
