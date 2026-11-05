import { DomainRule, PhoneRule, UrlRule } from "../../../src/index";

describe("Contact rules", () => {
  test("UrlRule accepts http or https URLs only", () => {
    const rule = new UrlRule();

    expect(rule.validate("https://example.com")).toBeNull();
    expect(rule.validate("http://example.com/path")).toBeNull();
    expect(rule.validate("ftp://example.com")).toBe("url");
    expect(rule.validate("example.com")).toBe("url");
  });

  test("PhoneRule uses E.164 by default and accepts a custom regex", () => {
    const defaultRule = new PhoneRule();
    const customRule = new PhoneRule(/^\d{10,11}$/);

    expect(defaultRule.validate("+5511999999999")).toBeNull();
    expect(defaultRule.validate("11999999999")).toBe("phone");
    expect(customRule.validate("11999999999")).toBeNull();
    expect(customRule.validate("telefone")).toBe("phone");
  });

  test("DomainRule validates domains without a protocol", () => {
    const rule = new DomainRule();

    expect(rule.validate("example.com")).toBeNull();
    expect(rule.validate("sub.example.com")).toBeNull();
    expect(rule.validate("https://example.com")).toBe("domain");
    expect(rule.validate("localhost")).toBe("domain");
  });
});
