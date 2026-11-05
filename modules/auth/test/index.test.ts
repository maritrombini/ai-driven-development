import { getModuleName } from "../src/index";

test("returns the configured module name", () => {
  expect(getModuleName()).toBe("auth");
});
