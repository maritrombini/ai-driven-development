import { AgeRule } from "../../../src/index";

describe("AgeRule", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-31T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("accepts an age inside the range", () => {
    const rule = new AgeRule(18, 65);

    expect(rule.validate("2000-03-31")).toBeNull();
    expect(rule.validate("1961-03-31")).toBeNull();
  });

  test("rejects an age outside the range", () => {
    const rule = new AgeRule(18, 65);

    expect(rule.validate("2010-04-01")).toBe("age.range");
    expect(rule.validate("1940-03-30")).toBe("age.range");
  });

  test("rejects an invalid date and ignores empty values", () => {
    const rule = new AgeRule(18, 65);

    expect(rule.validate("data-invalida")).toBe("age.range");
    expect(rule.validate("")).toBeNull();
    expect(rule.validate(null)).toBeNull();
  });

  test("adjusts the age when the birthday has not happened yet in the reference year", () => {
    const rule = new AgeRule(18, 65) as AgeRule & {
      getAgeFromBirthDate(birthDate: Date, referenceDate: Date): number;
    };

    expect(
      rule.getAgeFromBirthDate(
        new Date(2008, 3, 1),
        new Date(2026, 2, 31, 12),
      ),
    ).toBe(17);
  });
});
