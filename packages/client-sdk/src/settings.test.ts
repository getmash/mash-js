import { FloatLocation, merge, WalletPosition } from "./settings.js";

describe("settings", () => {
  describe("merge", () => {
    it("no position setting, should set correct defaults", () => {
      const result = merge({
        id: "1",
      });

      expect(result).toEqual({
        id: "1",
        position: {
          desktop: {
            floatLocation: FloatLocation.BottomRight,
            shiftUp: 0,
            shiftLeft: 0,
            shiftRight: 0,
          },
          mobile: {
            floatLocation: FloatLocation.BottomRight,
          },
        },
      });
    });

    it("invalid float location, should default to bottom right", () => {
      const result = merge({
        id: "1",
        position: {
          // @ts-ignore forcing bad value
          desktop: { floatLocation: "bad" },
          // @ts-ignore forcing bad value
          mobile: { floatLocation: "bad" },
        },
      });

      expect(result.position.desktop.floatLocation).toEqual(
        FloatLocation.BottomRight,
      );

      expect(result.position.mobile.floatLocation).toEqual(
        FloatLocation.BottomRight,
      );
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

      const result = merge({
        id: "1",
        position,
      });

      expect(result.position).toEqual(position);
    });
  });
});
