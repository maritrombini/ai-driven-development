import {
  BcryptHashRule,
  HasLowerCaseRule,
  HasNumberRule,
  HasSpecialCharRule,
  HasUpperCaseRule,
  NoCommonPasswordRule,
  NoRepeatCharsRule,
  StrongPasswordRule,
} from "../../../src/index";

describe("Security rules", () => {
  test("BcryptHashRule validates bcrypt hashes", () => {
    const rule = new BcryptHashRule();

    expect(
      rule.validate("$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"),
    ).toBeNull();
    expect(
      rule.validate("$2y$12$EXRkfkdmXn2gzds2SSitu.J8Y7qjY7oV9eVQ7H5PHeTtNKgH0W8wC"),
    ).toBeNull();
    expect(rule.validate("Senha@123")).toBe("bcrypt.hash");
    expect(
      rule.validate("$2b$10$short-hash"),
    ).toBe("bcrypt.hash");
  });

  test("StrongPasswordRule validates a strong password", () => {
    const defaultRule = new StrongPasswordRule();
    const customRule = new StrongPasswordRule(12);

    expect(defaultRule.validate("Abcdef1!")).toBeNull();
    expect(defaultRule.validate("abcdef1!")).toBe("strong.password");
    expect(customRule.validate("Abcd1!")).toBe("strong.password");
  });

  test("NoCommonPasswordRule blocks blacklisted passwords", () => {
    const defaultRule = new NoCommonPasswordRule();
    const customRule = new NoCommonPasswordRule(["password123"]);

    expect(defaultRule.validate("123456")).toBe("no.common.password");
    expect(customRule.validate(" password123 ")).toBe("no.common.password");
    expect(defaultRule.validate("Complex@123")).toBeNull();
  });

  test("NoRepeatCharsRule blocks consecutive repeated characters", () => {
    const defaultRule = new NoRepeatCharsRule();
    const customRule = new NoRepeatCharsRule(1);

    expect(defaultRule.validate("aabbcc")).toBeNull();
    expect(defaultRule.validate("aaab")).toBe("no.repeat.chars");
    expect(customRule.validate("aab")).toBe("no.repeat.chars");
  });

  test("HasUpperCaseRule requires at least one uppercase letter", () => {
    const rule = new HasUpperCaseRule();

    expect(rule.validate("abcD")).toBeNull();
    expect(rule.validate("abcd")).toBe("has.upper.case");
  });

  test("HasLowerCaseRule requires at least one lowercase letter", () => {
    const rule = new HasLowerCaseRule();

    expect(rule.validate("ABCd")).toBeNull();
    expect(rule.validate("ABCD")).toBe("has.lower.case");
  });

  test("HasNumberRule requires at least one number", () => {
    const rule = new HasNumberRule();

    expect(rule.validate("abc1")).toBeNull();
    expect(rule.validate("abc")).toBe("has.number");
  });

  test("HasSpecialCharRule requires at least one special character", () => {
    const rule = new HasSpecialCharRule();

    expect(rule.validate("abc!")).toBeNull();
    expect(rule.validate("abc1")).toBe("has.special.char");
  });
});
