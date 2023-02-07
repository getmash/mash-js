import assert from "node:assert/strict";
import { describe, it } from "node:test";

import parse, {
  Config,
  DefaultAPIBaseURL,
  DefaultPreboardingURL,
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
      preboardingURL: DefaultPreboardingURL,
      widgets: {
        baseURL: DefaultWidgetBaseURL,
        injectTheme: true,
        injectWebComponentScripts: true,
        injectFloatingWidgets: true,
      },
    });
  });

  it("custom config, should set values based on custom config", () => {
    const config: Config = {
      api: "http://test.com",
      earnerID: "1",
      autoHide: undefined,
      walletURL: "testsite",
      preboardingURL: "testpreboardingsite",
      widgets: {
        baseURL: "tester.com",
        injectTheme: false,
        injectWebComponentScripts: false,
        injectFloatingWidgets: false,
      },
    };
    const result = parse(config);
    assert.deepEqual<Config>(result, config);
  });
});
