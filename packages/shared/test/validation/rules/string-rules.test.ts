import {
  AlphaNumericRule,
  AlphaRule,
  ContainsRule,
  EndsWithRule,
  LowerCaseRule,
  NoWhitespaceRule,
  PersonNameRule,
  RegexRule,
  StartsWithRule,
  TrimRule,
  UpperCaseRule,
} from "../../../src/index";

describe("String rules", () => {
  test("TrimRule accepts strings without outer spaces and ignores empty values", () => {
    const rule = new TrimRule();

    expect(rule.validate("texto")).toBeNull();
    expect(rule.validate(["abc", "def"])).toBeNull();
    expect(rule.validate(" texto ")).toBe("trim");
    expect(rule.validate("")).toBeNull();
    expect(rule.validate(null)).toBeNull();
  });

  test("NoWhitespaceRule rejects any whitespace", () => {
    const rule = new NoWhitespaceRule();

    expect(rule.validate("abcdef")).toBeNull();
    expect(rule.validate("abc def")).toBe("no.whitespace");
    expect(rule.validate(123)).toBe("no.whitespace");
  });

  test("AlphaRule accepts letters only", () => {
    const rule = new AlphaRule();

    expect(rule.validate("abcXYZ")).toBeNull();
    expect(rule.validate("abc1")).toBe("alpha");
  });

  test("PersonNameRule accepts full names with extra spaces and rejects invalid formats", () => {
    const rule = new PersonNameRule();

    expect(rule.validate("John Smith")).toBeNull();
    expect(rule.validate("  Mary   Claire  Jones ")).toBeNull();
    expect(rule.validate("Anna Mary")).toBeNull();
    expect(rule.validate("John")).toBe("person.name");
    expect(rule.validate("J@hn Smith")).toBe("person.name");
    expect(rule.validate("John 123 Smith")).toBe("person.name");
  });

  test("AlphaNumericRule accepts letters and numbers only", () => {
    const rule = new AlphaNumericRule();

    expect(rule.validate("abc123")).toBeNull();
    expect(rule.validate("abc-123")).toBe("alpha.numeric");
  });

  test("StartsWithRule validates prefixes", () => {
    const rule = new StartsWithRule("pre");

    expect(rule.validate(["prefix", "prepare"])).toBeNull();
    expect(rule.validate("suffix")).toBe("starts.with");
  });

  test("EndsWithRule validates suffixes", () => {
    const rule = new EndsWithRule(".txt");

    expect(rule.validate("notes.txt")).toBeNull();
    expect(rule.validate("notes.csv")).toBe("ends.with");
  });

  test("ContainsRule validates a substring", () => {
    const rule = new ContainsRule("mid");

    expect(rule.validate("prefix-mid-suffix")).toBeNull();
    expect(rule.validate("prefix-suffix")).toBe("contains");
  });

  test("RegexRule accepts a string or regexp and resets lastIndex", () => {
    const globalRule = new RegexRule(/foo/g);
    const stringRule = new RegexRule("^\\d+$");

    expect(globalRule.validate("foo")).toBeNull();
    expect(globalRule.validate("foo")).toBeNull();
    expect(stringRule.validate("123")).toBeNull();
    expect(stringRule.validate("abc")).toBe("regex");
  });

  test("UpperCaseRule accepts uppercase letters only", () => {
    const rule = new UpperCaseRule();

    expect(rule.validate("ABC")).toBeNull();
    expect(rule.validate("AB1")).toBe("upper.case");
  });

  test("LowerCaseRule accepts lowercase letters only", () => {
    const rule = new LowerCaseRule();

    expect(rule.validate("abc")).toBeNull();
    expect(rule.validate("Abc")).toBe("lower.case");
  });
});
