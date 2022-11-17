import { TinyColor } from "@ctrl/tinycolor";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createDOM } from "../tests/dom.js";
import injectTheme from "./theme.js";

describe("theme", () => {
  describe("injectTheme", () => {
    it("inject theme, should have correct css variables configured", () => {
      createDOM();

      const hexColor = "#fcba03";
      const color = new TinyColor(hexColor);
      const hsl = color.toHsl();

      injectTheme("url", { primaryColor: hexColor, fontFamily: "sans-serif" });

      const el = document.querySelector(":root");
      if (!el) {
        throw new Error(":root style is missing");
      }

      const style = window.getComputedStyle(el);

      const h = style.getPropertyValue("--mash-primary-color-h");
      assert.equal(h, hsl.h.toString());

      const s = style.getPropertyValue("--mash-primary-color-s");
      assert.equal(s, `${hsl.s * 100}%`);

      const l = style.getPropertyValue("--mash-primary-color-l");
      assert.equal(l, `${hsl.l * 100}%`);

      const primaryColor = style.getPropertyValue("--mash-primary-color");
      assert.equal(primaryColor, hexColor);

      const font = style.getPropertyValue("--mash-font-family");
      assert.equal(font, "sans-serif");
    });
  });
});
