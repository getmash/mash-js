import selector from "./selector";

describe("selector", () => {
  it("no state, should only contain element + part", () => {
    const result = selector("test-element", "button");
    expect(result).toBe("test-element::part(button)");
  });
  it("state, should properly attach state to element + part", () => {
    const result = selector("test-element", "button", "hover");
    expect(result).toBe("test-element::part(button):hover");
  });
});
