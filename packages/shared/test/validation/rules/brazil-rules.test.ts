import { CepRule, CnpjRule, CpfRule, PhoneBrRule, RgRule } from "../../../src/index";

describe("Brazil rules", () => {
  test("CpfRule validates a CPF check digit", () => {
    const rule = new CpfRule();

    expect(rule.validate("529.982.247-25")).toBeNull();
    expect(rule.validate("123.456.789-09")).toBeNull();
    expect(rule.validate("000.000.006-04")).toBeNull();
    expect(rule.validate("000.000.018-30")).toBeNull();
    expect(rule.validate("529.982.247-15")).toBe("cpf");
    expect(rule.validate("111.111.111-11")).toBe("cpf");
    expect(rule.validate(12345678901)).toBe("cpf");
  });

  test("CnpjRule validates a CNPJ check digit", () => {
    const rule = new CnpjRule();

    expect(rule.validate("04.252.011/0001-10")).toBeNull();
    expect(rule.validate("123")).toBe("cnpj");
    expect(rule.validate("11.111.111/1111-11")).toBe("cnpj");
  });

  test("CepRule validates the CEP format", () => {
    const rule = new CepRule();

    expect(rule.validate("12345-678")).toBeNull();
    expect(rule.validate("12345678")).toBe("cep");
  });

  test("PhoneBrRule validates Brazilian phone numbers", () => {
    const rule = new PhoneBrRule();

    expect(rule.validate("(11) 99999-9999")).toBeNull();
    expect(rule.validate("+55 (11) 3456-7890")).toBeNull();
    expect(rule.validate("01999999999")).toBe("phone.br");
    expect(rule.validate("123")).toBe("phone.br");
  });

  test("RgRule validates the basic RG format", () => {
    const rule = new RgRule();

    expect(rule.validate("12.345.678-9")).toBeNull();
    expect(rule.validate("12345678X")).toBeNull();
    expect(rule.validate("1234")).toBe("rg");
  });
});
