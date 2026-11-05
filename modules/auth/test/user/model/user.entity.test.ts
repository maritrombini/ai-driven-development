import { ValidationException } from "@piggy/shared";
import { User } from "../../../src";

const VALID_BCRYPT_HASH =
  "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

function getValidationMessages(callback: () => void): string[] {
  try {
    callback();
    return [];
  } catch (error) {
    return (error as ValidationException).errors.map((item) => item.message);
  }
}

describe("User", () => {
  test("creates a valid user and inherits timestamps from the base entity", () => {
    const entity = new User({
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "John Smith",
      email: "john@example.com",
      password: VALID_BCRYPT_HASH,
    });

    expect(entity.id).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(entity.name).toBe("John Smith");
    expect(entity.email).toBe("john@example.com");
    expect(entity.password).toBe(VALID_BCRYPT_HASH);
    expect(entity.createdAt).toBeInstanceOf(Date);
    expect(entity.updatedAt).toBeInstanceOf(Date);
    expect(entity.updatedAt.getTime()).toBe(entity.createdAt.getTime());
    expect(entity.deletedAt).toBeNull();
  });

  test("updates updatedAt when the entity is cloned", () => {
    const createdAt = new Date("2024-01-01T00:00:00.000Z");
    const updatedAt = new Date("2024-01-02T00:00:00.000Z");
    const entity = new User({
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "John Smith",
      email: "john@example.com",
      password: VALID_BCRYPT_HASH,
      createdAt,
      updatedAt,
    });

    const clonedEntity = entity.clone({
      name: "Mary Smith",
      email: "mary@example.com",
    });

    expect(clonedEntity).toBeInstanceOf(User);
    expect(clonedEntity).not.toBe(entity);
    expect(clonedEntity.id).toBe(entity.id);
    expect(clonedEntity.name).toBe("Mary Smith");
    expect(clonedEntity.email).toBe("mary@example.com");
    expect(clonedEntity.password).toBe(VALID_BCRYPT_HASH);
    expect(clonedEntity.createdAt.getTime()).toBe(createdAt.getTime());
    expect(clonedEntity.updatedAt.getTime()).toBeGreaterThan(updatedAt.getTime());
    expect(clonedEntity.deletedAt).toBeNull();
  });

  test("allows creating an invalid user and fails only when validation runs", () => {
    const user = new User({
      name: "J@hn",
      email: "invalid-email",
      password: "12345678",
    });

    expect(user.name).toBe("J@hn");
    expect(user.email).toBe("invalid-email");
    expect(user.password).toBe("12345678");
    expect(() => user.validate()).toThrow(ValidationException);
    expect(getValidationMessages(() => user.validate())).toEqual([
      "user.name.person.name",
      "user.email.invalid.email",
      "user.password.bcrypt.hash",
    ]);
  });

  test("validates the minimum and maximum name length", () => {
    const shortNameUser = new User({
      name: "Jo",
      email: "john@example.com",
      password: VALID_BCRYPT_HASH,
    });
    const longNameUser = new User({
      name: `${"a".repeat(40)} ${"b".repeat(40)}`,
      email: "john@example.com",
      password: VALID_BCRYPT_HASH,
    });

    expect(() => shortNameUser.validate()).toThrow(ValidationException);
    expect(getValidationMessages(() => shortNameUser.validate())).toEqual([
      "user.name.min.length",
      "user.name.person.name",
    ]);
    expect(getValidationMessages(() => longNameUser.validate())).toEqual([
      "user.name.max.length",
    ]);
  });

  test("requires a valid first and last name", () => {
    const singleNameUser = new User({
      name: "John",
      email: "john@example.com",
      password: VALID_BCRYPT_HASH,
    });
    const spacedNameUser = new User({
      name: "   John   ",
      email: "john@example.com",
      password: VALID_BCRYPT_HASH,
    });

    expect(() => singleNameUser.validate()).toThrow(ValidationException);
    expect(getValidationMessages(() => singleNameUser.validate())).toEqual([
      "user.name.person.name",
    ]);
    expect(getValidationMessages(() => spacedNameUser.validate())).toEqual([
      "user.name.person.name",
    ]);
  });

  test("requires a valid bcrypt password when a value is provided", () => {
    const user = new User({
      name: "John Smith",
      email: "john@example.com",
      password: "invalid-hash",
    });

    expect(() => user.validate()).toThrow(ValidationException);
    expect(getValidationMessages(() => user.validate())).toEqual([
      "user.password.bcrypt.hash",
    ]);
  });
});
