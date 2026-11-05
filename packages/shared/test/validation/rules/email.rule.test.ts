import { EmailRule } from "../../../src/index";

describe("EmailRule", () => {
  test("accepts valid emails", () => {
    const rule = new EmailRule();

    expect(rule.validate("john@doe.com")).toBeNull();
    expect(rule.validate(" john@doe.com ")).toBeNull();
  });

  test("rejects invalid emails", () => {
    const rule = new EmailRule();

    expect(rule.validate("john@doe")).toBe("invalid.email");
    expect(rule.validate("john doe")).toBe("invalid.email");
    expect(rule.validate(123)).toBe("invalid.email");
  });

  test("ignores empty values so the field can stay optional", () => {
    const rule = new EmailRule();

    expect(rule.validate("")).toBeNull();
    expect(rule.validate("   ")).toBeNull();
    expect(rule.validate(null)).toBeNull();
    expect(rule.validate(undefined)).toBeNull();
  });
});
