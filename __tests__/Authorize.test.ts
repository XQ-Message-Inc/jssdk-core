/* eslint-disable no-unused-vars */
import { Authorize, ServerResponse } from "../src";
import {
  ensureCredentialsPresent,
  invalidUser,
  sdk,
  testEmail,
  testPhone,
} from "./utils/setupFiles";

describe("Testing `Authorize` service", () => {
  const testAuthorization = async (user: string) => {
    const callAuthorize = await new Authorize(sdk).supplyAsync({
      [Authorize.USER]: user,
    });

    return callAuthorize;
  };

  beforeAll(() => ensureCredentialsPresent());

  it(`should successfully test authorization for a given email: ${testEmail}`, async () => {
    expect(await testAuthorization(testEmail)).toBeInstanceOf(ServerResponse);
    expect(await testAuthorization(testEmail)).toHaveProperty(
      "statusCode",
      200
    );
  });

  it(`should successfully test authorization for a given phone #: ${testPhone}`, async () => {
    expect(await testAuthorization(testPhone)).toBeInstanceOf(ServerResponse);
    expect(await testAuthorization(testPhone)).toHaveProperty(
      "statusCode",
      200
    );
  });

  it(`should fail to authorize an invalid user: ${invalidUser}`, async () => {
    expect(await testAuthorization(invalidUser)).toBeInstanceOf(ServerResponse);
    expect(await testAuthorization(invalidUser)).toHaveProperty(
      "statusCode",
      400
    );
  });
});
