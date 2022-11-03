import css from "./css";

describe("css", () => {
  describe("toString", () => {
    it("single rule, should output valid css", () => {
      const sheet = css.toString([
        {
          selectors: ["button"],
          properties: {
            border: "1px solid black",
          },
        },
      ]);

      expect(sheet).toBe(`
button {
  border: 1px solid black;
}`);
    });

    it("multi-rule, should output valid css", () => {
      const sheet = css.toString([
        {
          selectors: ["button"],
          properties: {
            border: "1px solid black",
          },
        },
        {
          selectors: ["input"],
          properties: {
            "background-color": "#fff",
          },
        },
      ]);

      expect(sheet).toBe(`
button {
  border: 1px solid black;
}
input {
  background-color: #fff;
}`);
    });

    it("multi-selector, selectors should be comma separated", () => {
      const sheet = css.toString([
        {
          selectors: ["button", "input", "div"],
          properties: {
            border: "1px solid black",
          },
        },
      ]);

      expect(sheet).toBe(`
button, input, div {
  border: 1px solid black;
}`);
    });
  });
});
