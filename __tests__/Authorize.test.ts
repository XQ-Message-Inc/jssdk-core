import { Authorize, ServerResponse } from "../src";
import {
  ensureCredentialsPresent,
  invalidUser,
  sdk,
  testEmail,
  testPhone,
} from "./utils/setupFiles";

describe("Testing `Authorize` service", () => {
  const testAuthorization = async (user: string) =>
    await new Authorize(sdk)
      .supplyAsync({ [Authorize.USER]: user })
      .then((response) => {
        switch (response.status) {
          case ServerResponse.OK: {
            return true;
          }
          case ServerResponse.ERROR: {
            return false;
          }
        }
      });

  beforeAll(() => ensureCredentialsPresent());

  it(`should successfully test authorization for a given email: ${testEmail}`, async () =>
    expect(await testAuthorization(testEmail)).toEqual(true));

  it(`should successfully test authorization for a given phone #: ${testPhone}`, async () =>
    expect(await testAuthorization(testPhone)).toEqual(true));

  it(`should fail to authorize an invalid user: ${invalidUser}`, async () =>
    expect(await testAuthorization(invalidUser)).toEqual(false));
});
