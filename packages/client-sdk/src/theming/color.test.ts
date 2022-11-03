import { Black, White, getReadableTextColor } from "./color";

describe("color", () => {
  describe("getReadableTextColor", () => {
    it("white background, should use black text", () => {
      const result = getReadableTextColor(White);
      expect(result).toBe(Black);
    });

    it("black background, should use white text", () => {
      const result = getReadableTextColor(Black);
      expect(result).toBe(White);
    });

    it("light background, should use black text", () => {
      const result = getReadableTextColor("#c0d1c5");
      expect(result).toBe(Black);
    });

    it("dark background, should use white text", () => {
      const result = getReadableTextColor("#17261b");
      expect(result).toBe(White);
    });
  });
});
