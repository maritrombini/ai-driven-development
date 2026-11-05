import { MinLengthRule } from "../../../src/index";

describe("MinLengthRule", () => {
  test("validates the minimum length of strings", () => {
    const rule = new MinLengthRule(3);

    expect(rule.validate("ab")).toBe("min.length");
    expect(rule.validate("abc")).toBeNull();
  });

  test("validates the minimum length of arrays", () => {
    const rule = new MinLengthRule(2);

    expect(rule.validate(["a"])).toBe("min.length");
    expect(rule.validate(["a", "b"])).toBeNull();
  });

  test("rejects values without length and ignores empty values", () => {
    const rule = new MinLengthRule(3);

    expect(rule.validate(10)).toBe("min.length");
    expect(rule.validate("")).toBeNull();
    expect(rule.validate(null)).toBeNull();
  });
});
