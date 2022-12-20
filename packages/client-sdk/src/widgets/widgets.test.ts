import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createDOM } from "../tests/dom.js";
import { injectWidgets, Widgets } from "./widgets.js";

describe("widgets", () => {
  describe("injectWidgets", () => {
    it("should inject all widgets", () => {
      createDOM();

      const baseURL = "http://test.com";
      injectWidgets(baseURL);
      const scripts = window.document.querySelectorAll("script");
      assert.equal(scripts.length, Object.keys(Widgets).length);
    });
  });
});
