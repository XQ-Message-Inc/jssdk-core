import { Encrypt, XQSDK } from "../../src";

// XQ API Keys
const credentials = {
  XQ_API_KEY: "YOUR_XQ_API_KEY",
  DASHBOARD_API_KEY: "YOUR_DASHBOARD_API_KEY",
};

/**
 * A function utilized to test if the necessary XQ API keys are present in order to run the JS SDK services
 * @returns void
 */
export const ensureCredentialsPresent = () => {
  const credentialsPresent =
    credentials.XQ_API_KEY !== "YOUR_XQ_API_KEY" &&
    credentials.DASHBOARD_API_KEY.length > 0 &&
    credentials.DASHBOARD_API_KEY !== "YOUR_DASHBOARD_API_KEY" &&
    credentials.DASHBOARD_API_KEY.length > 0;

  if (!credentialsPresent) {
    throw new Error(
      "No credentials present. Please input the necessary XQ API keys in `__tests__/utils/setupFiles.ts` to run tests. (See #API Keys section in README.md for more information)"
    );
  }
};

// SDK Initialization
export const sdk = new XQSDK(credentials);

// User Variables
export const testEmail = "test@xqmsg.com";

export const test2Email = "test2@xqmsg.com";

export const testPhone = "(111) 222-3333";

export const invalidUser = "invalidUserString";

// Test Payloads
export const testToSucceedEncryptionPayload = {
  [Encrypt.TEXT]: "My message to encrypt",
  [Encrypt.RECIPIENTS]: [testEmail, test2Email],
  [Encrypt.EXPIRES_HOURS]: 24,
};

export const testToFailEncryptionPayload = {
  [Encrypt.TEXT]: "My message to encrypt",
  [Encrypt.RECIPIENTS]: [invalidUser],
  [Encrypt.EXPIRES_HOURS]: 24,
};

// Algorithms
export const AESAlgorithm = sdk.getAlgorithm("AES");

export const OTPv2Algorithm = sdk.getAlgorithm("OTPV2");

// Types
export interface IEncryptParams {
  recipients: string[];
  text: string;
  expires: number;
  dor?: boolean;
}

export interface IDecryptParams {
  locatorKey: string;
  encryptedText: string;
}
