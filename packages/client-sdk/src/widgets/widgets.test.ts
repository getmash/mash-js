import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createDOM } from "../tests/dom.js";
import {
  injectWidgets,
  isWidgetOnPage,
  Widgets,
  DeprecatedWidgets,
} from "./widgets.js";

describe("widgets", () => {
  describe("isWidgetOnPage", () => {
    it("no mash widgets, should return false", async () => {
      createDOM();
      const result = await isWidgetOnPage();
      assert.equal(result, false);
    });
    it("mash widgets exists, should return true", async () => {
      createDOM();

      const widgets = Object.values(Widgets);
      const widget = widgets[Math.floor(Math.random() * widgets.length)];

      const wc = window.document.createElement(widget.element);
      window.document.body.appendChild(wc);

      const result = await isWidgetOnPage();
      assert.equal(result, true);
    });
    it("old mash widget exists, should return true", async () => {
      createDOM();

      const widget =
        DeprecatedWidgets[Math.floor(Math.random() * DeprecatedWidgets.length)];

      const wc = window.document.createElement(widget);
      window.document.body.appendChild(wc);

      const result = await isWidgetOnPage();
      assert.equal(result, true);
    });
  });

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
