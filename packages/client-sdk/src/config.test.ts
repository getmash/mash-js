import assert from "node:assert/strict";
import { describe, it } from "node:test";

import parse, { Config, DefaultMashButtonURL } from "./config.js";

describe("Config", () => {
  it("empty config passed in, should set defaults", () => {
    const result = parse({ earnerID: "1" });
    assert.deepEqual<Config>(result, {
      api: "https://api.mash.com",
      autoHide: undefined,
      mashButtonPosition: undefined,
      earnerID: "1",
      walletURL: DefaultMashButtonURL,
      preboardingURL: "https://app.mash.com/preboarding",
      widgets: {
        baseURL: "https://widgets.mash.com",
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
      mashButtonPosition: undefined,
      walletURL: "https://testsite.com/",
      preboardingURL: "https://testsite.com/preboarding",
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

  it("custom config, should throw error if given url has invalid format", () => {
    const config: Config = {
      api: "test.com",
      earnerID: "1",
      autoHide: undefined,
      mashButtonPosition: undefined,
      walletURL: "testsite.com",
      preboardingURL: "testsite.com/preboarding",
      widgets: {
        baseURL: "tester.com",
        injectTheme: false,
        injectWebComponentScripts: false,
        injectFloatingWidgets: false,
      },
    };

    assert.throws(() => {
      parse(config);
    }, Error);
  });

  it("custom config, support injectWidgets value", () => {
    const result = parse({ earnerID: "1", widgets: { injectWidgets: true } });
    assert.ok(result.widgets.injectWidgets);
  });
});
