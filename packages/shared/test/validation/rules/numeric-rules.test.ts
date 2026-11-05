import {
  IntegerRule,
  MaxValueRule,
  MinValueRule,
  NegativeRule,
  PositiveRule,
  PrecisionRule,
  RangeValueRule,
} from "../../../src/index";

describe("Numeric rules", () => {
  test("MinValueRule validates the minimum value and rejects invalid types", () => {
    const rule = new MinValueRule(5);

    expect(rule.validate(5)).toBeNull();
    expect(rule.validate(10)).toBeNull();
    expect(rule.validate(4)).toBe("min.value");
    expect(rule.validate("5")).toBe("min.value");
    expect(rule.validate(undefined)).toBeNull();
  });

  test("MaxValueRule validates the maximum value", () => {
    const rule = new MaxValueRule(5);

    expect(rule.validate(4)).toBeNull();
    expect(rule.validate(6)).toBe("max.value");
  });

  test("RangeValueRule validates numeric values and arrays", () => {
    const rule = new RangeValueRule(1, 3);

    expect(rule.validate([1, 2, 3])).toBeNull();
    expect(rule.validate(4)).toBe("range.value");
  });

  test("IntegerRule accepts finite integers only", () => {
    const rule = new IntegerRule();

    expect(rule.validate(-2)).toBeNull();
    expect(rule.validate(1.2)).toBe("integer");
    expect(rule.validate(Number.NaN)).toBe("integer");
  });

  test("PositiveRule accepts numbers greater than zero only", () => {
    const rule = new PositiveRule();

    expect(rule.validate(1)).toBeNull();
    expect(rule.validate(0)).toBe("positive");
  });

  test("NegativeRule accepts numbers less than zero only", () => {
    const rule = new NegativeRule();

    expect(rule.validate(-1)).toBeNull();
    expect(rule.validate(0)).toBe("negative");
  });

  test("PrecisionRule limits the number of decimal places", () => {
    const rule = new PrecisionRule(2);
    const scientificRule = new PrecisionRule(6);
    const integerScientificRule = new PrecisionRule(0);

    expect(rule.validate(1)).toBeNull();
    expect(rule.validate(1.23)).toBeNull();
    expect(rule.validate(1.234)).toBe("precision");
    expect(scientificRule.validate(1e-7)).toBe("precision");
    expect(integerScientificRule.validate(1e3)).toBeNull();
  });
});
