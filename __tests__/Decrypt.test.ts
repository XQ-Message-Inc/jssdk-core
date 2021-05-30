import {
  AuthorizeAlias,
  Decrypt,
  Encrypt,
  EncryptionAlgorithm,
  ServerResponse,
} from "../src";

import {
  AESAlgorithm,
  IDecryptParams,
  IEncryptParams,
  OTPv2Algorithm,
  sdk,
  testEmail,
  testToFailEncryptionPayload,
  testToSucceedEncryptionPayload,
} from "./utils/setupFiles";

describe("Testing `Decrypt` service", () => {
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

  it(`should successfully encrypt the given text via AES algorithm`, async () =>
    expect(
      await testDecrypt(testToSucceedEncryptionPayload, AESAlgorithm)
    ).toEqual(true));

  it(`should successfully encrypt the given text via OTPV2 algorithm`, async () =>
    expect(
      await testDecrypt(testToSucceedEncryptionPayload, OTPv2Algorithm)
    ).toEqual(true));

  it(`should fail to encrypt the given text via AES algorithm`, async () =>
    expect(
      await testDecrypt(testToFailEncryptionPayload, AESAlgorithm)
    ).toEqual(false));

  it(`should fail to encrypt the given text via OTPV2 algorithm`, async () =>
    expect(
      await testDecrypt(testToFailEncryptionPayload, OTPv2Algorithm)
    ).toEqual(false));
});
