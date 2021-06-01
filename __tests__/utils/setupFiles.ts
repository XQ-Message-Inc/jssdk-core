import { Encrypt, XQSDK } from "../../src";

// SDK Initialization
export const sdk = new XQSDK({
  XQ_API_KEY:
    "fa0c5740-9c10-40c3-8e9a-4a96cff93788-816f9192-8a78-42d5-8fda-de75e9a25da8",
  DASHBOARD_API_KEY:
    "b605a854-a436-4f62-8eae-b5d2a1069b75-90057426-a181-40f3-815a-856ddc5e3042",
});

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
