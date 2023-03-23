import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  defaultEarnerCustomizationConfig,
  EarnerCustomizationConfiguration,
  mergeEarnerCustomizationConfig,
  WalletButtonDevicePosition,
  WalletButtonFloatPlacement,
  WalletButtonFloatSide,
} from "./routes.js";

describe("routes", () => {
  describe("mergeEarnerCustomizationConfig", () => {
    it("merge default with empty, should match default", () => {
      const result = mergeEarnerCustomizationConfig(
        defaultEarnerCustomizationConfig,
        {},
      );
      assert.deepEqual<EarnerCustomizationConfiguration>(
        defaultEarnerCustomizationConfig,
        result,
      );
    });
    it("merge default with autoHide override, should match autoHide override", () => {
      const result = mergeEarnerCustomizationConfig(
        defaultEarnerCustomizationConfig,
        { autoHide: true },
      );
      assert.equal(result.autoHide, true);
    });
    it("merge default with position override, should match position override", () => {
      const desktop: WalletButtonDevicePosition = {
        floatPlacement: WalletButtonFloatPlacement.Intercom,
        floatSide: WalletButtonFloatSide.Left,
        customShiftConfiguration: { horizontal: 5, vertical: 10 },
      };

      const mobile: WalletButtonDevicePosition = {
        floatPlacement: WalletButtonFloatPlacement.Ghost,
        floatSide: WalletButtonFloatSide.Left,
        customShiftConfiguration: { horizontal: 15, vertical: 152 },
      };

      const result = mergeEarnerCustomizationConfig(
        defaultEarnerCustomizationConfig,
        { walletButtonPosition: { desktop, mobile } },
      );

      assert.deepEqual(result.walletButtonPosition.desktop, desktop);
      assert.deepEqual(result.walletButtonPosition.mobile, mobile);
    });
  });
});
