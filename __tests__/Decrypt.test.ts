import {
  AESAlgorithm,
  IDecryptParams,
  IEncryptParams,
  OTPv2Algorithm,
  ensureCredentialsPresent,
  sdk,
  testEmail,
  testToFailEncryptionPayload,
  testToSucceedEncryptionPayload,
} from "./utils/setupFiles";

import {
  AuthorizeAlias,
  Decrypt,
  Encrypt,
  EncryptionAlgorithm,
  ServerResponse,
} from "../src";

describe("Testing `Decrypt` service", () => {
  // Step 1. Authorize User
  const authorizeUser = () =>
    new AuthorizeAlias(sdk)
      .supplyAsync({ [AuthorizeAlias.USER]: testEmail })
      .then((response) => {
        switch (response.status) {
          case ServerResponse.OK: {
            return response;
          }
          case ServerResponse.ERROR: {
            return false;
          }
        }
      });

  // Step 2. Encrypt the message
  const encryptMessage = (
    payload: IEncryptParams,
    algorithm: EncryptionAlgorithm
  ) =>
    new Encrypt(sdk, algorithm).supplyAsync(payload).then((response) => {
      if (!response) {
        return false;
      }

      switch (response.status) {
        case ServerResponse.OK: {
          return response;
        }
        case ServerResponse.ERROR: {
          return false;
        }
      }
    });

  // Step 3. Decrypt the encrypted message
  const decryptMessage = (
    payload: IDecryptParams,
    algorithm: EncryptionAlgorithm
  ) =>
    new Decrypt(sdk, algorithm).supplyAsync(payload).then((response) => {
      if (!response) {
        return false;
      }

      switch (response.status) {
        case ServerResponse.OK: {
          return true;
        }
        case ServerResponse.ERROR: {
          return false;
        }
      }
    });

  const testDecrypt = (
    payload: IEncryptParams,
    algorithm: EncryptionAlgorithm
  ) => {
    return authorizeUser().then((response) => {
      if (!response) {
        return false;
      }

      sdk.getCache().putActiveProfile(payload.recipients[0]);

      return encryptMessage(payload, algorithm).then((response) => {
        if (!response) {
          return false;
        }
        const data = response.payload;
        const locatorKey = data[Encrypt.LOCATOR_KEY];
        const encryptedText = data[Encrypt.ENCRYPTED_TEXT];

        const testDecryptionPayload = {
          [Decrypt.LOCATOR_KEY]: locatorKey,
          [Decrypt.ENCRYPTED_TEXT]: encryptedText,
        };

        return decryptMessage(testDecryptionPayload, algorithm);
      });
    });
  };

  beforeAll(() => ensureCredentialsPresent());

  it(`should successfully encrypt the given text via AES algorithm`, async () =>
    expect(
      await testDecrypt(testToSucceedEncryptionPayload, AESAlgorithm)
    ).toEqual(true));

  it(`should successfully encrypt the given text via OTPv2 algorithm`, async () =>
    expect(
      await testDecrypt(testToSucceedEncryptionPayload, OTPv2Algorithm)
    ).toEqual(true));

  it(`should fail to encrypt the given text via AES algorithm`, async () => {
    const originalError = console.error;
    console.error = jest.fn();

    expect(
      await testDecrypt(testToFailEncryptionPayload, AESAlgorithm)
    ).toEqual(false);

    console.error = originalError;
  });

  it(`should fail to encrypt the given text via OTPv2 algorithm`, async () => {
    const originalError = console.error;
    console.error = jest.fn();

    expect(
      await testDecrypt(testToFailEncryptionPayload, AESAlgorithm)
    ).toEqual(false);

    console.error = originalError;
  });
});
