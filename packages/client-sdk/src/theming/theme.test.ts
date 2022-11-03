import { build } from "./theme";

describe("theme", () => {
  describe("build", () => {
    it("build theme with color: #000, should match snapshot", () => {
      const result = build("#000");
      expect(result).toMatchSnapshot();
    });
    it("build theme with color: #fff, should match snapshot", () => {
      const result = build("#fff");
      expect(result).toMatchSnapshot();
    });
  });
});
