import { MaxLengthRule } from "../../../src/index";

describe("MaxLengthRule", () => {
  test("validates the maximum length of strings", () => {
    const rule = new MaxLengthRule(5);

    expect(rule.validate("abc")).toBeNull();
    expect(rule.validate("abcdef")).toBe("max.length");
  });

  test("validates the maximum length of arrays", () => {
    const rule = new MaxLengthRule(2);

    expect(rule.validate(["a", "b"])).toBeNull();
    expect(rule.validate(["a", "b", "c"])).toBe("max.length");
  });

  test("rejects values without length and ignores empty values", () => {
    const rule = new MaxLengthRule(5);

    expect(rule.validate(10)).toBe("max.length");
    expect(rule.validate("")).toBeNull();
    expect(rule.validate(undefined)).toBeNull();
  });
});
