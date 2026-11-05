import { ValidationException } from "@piggy/shared";
import { RegisterUser, User } from "../../../src";
import { FakeCryptoProvider, FakeUserRepository } from "../../mock";

const VALID_PASSWORD = "Strong@123";

describe("RegisterUser", () => {
  test("validates a strong password, hashes it, validates the user, and persists", async () => {
    const cryptoProvider = new FakeCryptoProvider();
    const userRepository = new FakeUserRepository();
    const validateSpy = jest.spyOn(User.prototype, "validate");
    const useCase = new RegisterUser(cryptoProvider, userRepository);

    await expect(
      useCase.execute({
        name: "John Smith",
        email: "john@example.com",
        password: VALID_PASSWORD,
      }),
    ).resolves.toBeUndefined();

    expect(cryptoProvider.encryptedPasswords).toEqual([VALID_PASSWORD]);
    expect(validateSpy).toHaveBeenCalledTimes(1);
    expect(userRepository.createdUsers).toHaveLength(1);

    const persistedUser = userRepository.createdUsers[0];

    expect(persistedUser).toBeInstanceOf(User);
    expect(persistedUser?.name).toBe("John Smith");
    expect(persistedUser?.email).toBe("john@example.com");
    expect(persistedUser?.password).toMatch(/^\$2[abxy]\$\d{2}\$[./A-Za-z0-9]{53}$/);
    await expect(
      cryptoProvider.compare(VALID_PASSWORD, persistedUser!.password),
    ).resolves.toBe(true);

    validateSpy.mockRestore();
  });

  test("fails before hashing and persisting when the password is not strong", async () => {
    const cryptoProvider = new FakeCryptoProvider();
    const userRepository = new FakeUserRepository();
    const useCase = new RegisterUser(cryptoProvider, userRepository);

    await expect(
      useCase.execute({
        name: "John Smith",
        email: "john@example.com",
        password: "123456",
      }),
    ).rejects.toThrow(ValidationException);

    expect(cryptoProvider.encryptedPasswords).toEqual([]);
    expect(userRepository.createdUsers).toEqual([]);
  });
});
