import { AuthorizeAlias, ServerResponse } from "../src";
import { sdk, testEmail, testPhone } from "./utils/setupFiles";

describe("Testing `AuthorizeAlias` service", () => {
  const testAuthorization = async (user: string) =>
    await new AuthorizeAlias(sdk)
      .supplyAsync({ [AuthorizeAlias.USER]: user })
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

  it(`should successfully test authorization for a given email: ${testEmail}`, async () =>
    expect(await testAuthorization(testEmail)).toEqual(true));

  it(`should successfully test authorization for a given phone #: ${testPhone}`, async () =>
    expect(await testAuthorization(testPhone)).toEqual(true));
});
