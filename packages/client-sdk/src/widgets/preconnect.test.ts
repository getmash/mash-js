import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createDOM } from "../tests/dom.js";
import preconnect from "./preconnect.js";

describe("preconnect", () => {
  it("should have link element with preconnect attribute", () => {
    const baseURL = "http://test.com/";

    createDOM();
    preconnect(baseURL);

    const link = window.document.querySelector<HTMLLinkElement>(
      `link[href="${baseURL}"]`,
    );

    assert.notEqual(link, null);
    assert.equal(link?.href, baseURL);
    assert.equal(link?.rel, "preconnect");
  });
});
