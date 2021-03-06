import {
  AESAlgorithm,
  IEncryptParams,
  OTPv2Algorithm,
  ensureCredentialsPresent,
  sdk,
  testToSucceedEncryptionPayload,
} from "./utils/setupFiles";

import {
  AuthorizeAlias,
  Encrypt,
  EncryptionAlgorithm,
  ServerResponse,
} from "../src";

describe("Testing `Encrypt` service", () => {
  const authorizeUser = (user: string) =>
    new AuthorizeAlias(sdk)
      .supplyAsync({ [AuthorizeAlias.USER]: user })
      .then((response) => {
        sdk.getCache().putActiveProfile(user);

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

  const testEncrypt = async (
    payload: IEncryptParams,
    algorithm: EncryptionAlgorithm
  ) => {
    const userToAuthorize = payload.recipients[0];

    return authorizeUser(userToAuthorize).then((response) => {
      if (!response) {
        return false;
      }

      sdk.getCache().putActiveProfile(userToAuthorize);

      return encryptMessage(payload, algorithm).then((response) => {
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
    });
  };

  beforeAll(() => ensureCredentialsPresent());

  it(`should successfully encrypt the given text via AES algorithm`, async () =>
    expect(
      await testEncrypt(testToSucceedEncryptionPayload, AESAlgorithm)
    ).toEqual(true));
  it(`should successfully encrypt the given text via OTPv2 algorithm`, async () =>
    expect(
      await testEncrypt(testToSucceedEncryptionPayload, OTPv2Algorithm)
    ).toEqual(true));
});
