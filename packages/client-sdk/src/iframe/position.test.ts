import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  FloatLocation,
  getWalletPosition,
  WalletPosition,
} from "./position.js";

describe("settings", () => {
  describe("merge", () => {
    it("no position setting, should set correct defaults", () => {
      const result = getWalletPosition(undefined, undefined);
      assert.deepEqual(result, {
        desktop: {
          floatLocation: FloatLocation.BottomRight,
          shiftUp: 0,
          shiftLeft: 0,
          shiftRight: 0,
        },
        mobile: {
          floatLocation: FloatLocation.BottomRight,
        },
      });
    });

    it("invalid float location, should default to bottom right", () => {
      const result = getWalletPosition(
        // @ts-expect-error testing bad values
        { floatLocation: "bad" },
        { floatLocation: "bad" },
      );

      assert.equal(result.desktop.floatLocation, FloatLocation.BottomRight);
      assert.equal(result.mobile.floatLocation, FloatLocation.BottomRight);
    });

    it("set valid custom position, should set position", () => {
      const position: WalletPosition = {
        desktop: {
          floatLocation: FloatLocation.BottomLeft,
          shiftLeft: 1,
          shiftRight: 2,
          shiftUp: 3,
        },
        mobile: { floatLocation: FloatLocation.BottomLeft },
      };

      const result = getWalletPosition(position.desktop, position.mobile);
      assert.deepEqual(result, position);
    });
  });
});
