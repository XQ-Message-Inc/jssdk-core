import {
  AuthorizeAlias,
  CommunicationsEnum,
  FetchKey,
  GeneratePacket,
  ServerResponse,
} from "../src";
import { ensureCredentialsPresent, sdk, testEmail } from "./utils/setupFiles";
import { IGeneratePacketParams } from "../src/com/xqmsg/sdk/v2/services/GeneratePacket";

describe("Testing manual key management", () => {
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

  const payload: IGeneratePacketParams = {
    [GeneratePacket.KEY]: "TEST KEY",
    [GeneratePacket.EXPIRES_HOURS]: 1,
    [GeneratePacket.RECIPIENTS]: ["recipient@xqmsg.com"],
    [GeneratePacket.DELETE_ON_RECEIPT]: false,
    [GeneratePacket.TYPE]: CommunicationsEnum.EMAIL,
    [GeneratePacket.META]: null,
  };

  const generatePacket = () =>
    new GeneratePacket(sdk).supplyAsync(payload).then((response) => {
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

  const fetchKey = (token: string) =>
    new FetchKey(sdk)
      .supplyAsync({ [FetchKey.LOCATOR_KEY]: token })
      .then((response) => {
        if (!response) {
          return false;
        }
        switch (response.status) {
          case ServerResponse.OK: {
            return response.payload;
          }
          case ServerResponse.ERROR: {
            return false;
          }
        }
      });

  beforeAll(() => ensureCredentialsPresent());

  it(`should successfully generate and fetch key packet`, async () =>
    expect(
      await authorizeUser(testEmail).then((userResponse) => {
        if (!userResponse) {
          return false;
        }
        switch (userResponse.status) {
          case ServerResponse.OK: {
            return generatePacket().then((keyResponse) => {
              if (!keyResponse) {
                return false;
              }
              switch (keyResponse.status) {
                case ServerResponse.OK: {
                  const token = keyResponse.payload;
                  return fetchKey(token);
                }
                case ServerResponse.ERROR: {
                  return false;
                }
              }
            });
          }
          case ServerResponse.ERROR: {
            return false;
          }
        }
      })
    ).toEqual(payload.key));
});
