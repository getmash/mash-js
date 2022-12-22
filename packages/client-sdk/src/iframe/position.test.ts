import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  WalletButtonFloatPlacement,
  WalletButtonFloatSide,
  WalletButtonPosition,
} from "../api/routes.js";
import { getWalletPosition } from "./position.js";

describe("settings", () => {
  describe("merge", () => {
    it("no position setting, should set correct defaults", () => {
      const result = getWalletPosition(undefined, undefined);
      assert.deepEqual(result, {
        desktop: {
          floatSide: WalletButtonFloatSide.Right,
          floatPlacement: WalletButtonFloatPlacement.Default,
          customShiftConfiguration: {
            horizontal: 0,
            vertical: 0,
          },
        },
        mobile: {
          floatSide: WalletButtonFloatSide.Right,
          floatPlacement: WalletButtonFloatPlacement.Default,
          customShiftConfiguration: {
            horizontal: 0,
            vertical: 0,
          },
        },
      });
    });

    it("invalid float location, should default to bottom right", () => {
      const result = getWalletPosition(
        // @ts-expect-error testing bad values
        { floatSide: "bad" },
        { floatSide: "bad" },
      );

      assert.equal(result.desktop.floatSide, WalletButtonFloatSide.Right);
      assert.equal(result.mobile.floatSide, WalletButtonFloatSide.Right);
    });

    it("set valid custom position, should set position", () => {
      const position: WalletButtonPosition = {
        desktop: {
          floatPlacement: WalletButtonFloatPlacement.Custom,
          floatSide: WalletButtonFloatSide.Right,
          customShiftConfiguration: {
            horizontal: 50,
            vertical: 60,
          },
        },
        mobile: {
          floatSide: WalletButtonFloatSide.Right,
          floatPlacement: WalletButtonFloatPlacement.Default,
          customShiftConfiguration: {
            horizontal: 50,
            vertical: 60,
          },
        },
      };

      const result = getWalletPosition(position.desktop, position.mobile);
      assert.deepEqual(result, position);
    });
  });
});
