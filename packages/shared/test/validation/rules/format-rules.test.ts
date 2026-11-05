import {
  HexColorRule,
  JsonStringRule,
  SlugRule,
  UuidRule,
} from "../../../src/index";

describe("Format rules", () => {
  test("UuidRule accepts UUID v4 only", () => {
    const rule = new UuidRule();

    expect(rule.validate("550e8400-e29b-41d4-a716-446655440000")).toBeNull();
    expect(rule.validate("6ba7b810-9dad-11d1-80b4-00c04fd430c8")).toBe("uuid");
  });

  test("SlugRule accepts valid slugs only", () => {
    const rule = new SlugRule();

    expect(rule.validate("meu-texto-aqui")).toBeNull();
    expect(rule.validate("MeuTextoAqui")).toBe("slug");
  });

  test("HexColorRule validates hexadecimal colors", () => {
    const rule = new HexColorRule();

    expect(rule.validate("#FFF")).toBeNull();
    expect(rule.validate("#ffffff")).toBeNull();
    expect(rule.validate("FFF")).toBe("hex.color");
  });

  test("JsonStringRule validates parseable JSON", () => {
    const rule = new JsonStringRule();

    expect(rule.validate('{"name":"john"}')).toBeNull();
    expect(rule.validate("[]")).toBeNull();
    expect(rule.validate("{")).toBe("json.string");
    expect(rule.validate("")).toBeNull();
  });
});
