import ServerResponse from "../ServerResponse";

export interface XQSDKLike {
  validateAccessToken: (destination?: string) => unknown;
}

/**
 * Super class for Encryption Algorithms supported by XQ Message:
 * * GCMEncryption
 * * OTPEncryption
 *
 * @class [EncryptionAlgorithm]
 */
export default class EncryptionAlgorithm {
  decryptText!: (text: string, key: string) => Promise<ServerResponse>;

  encryptFile!: (
    sourceFile: File,
    expandedKey: string | void,
    locatorToken: string
  ) => Promise<ServerResponse>;

  decryptFile!: (
    sourceFile: File,
    locateFn: (aLocatorToken: string) => Promise<string>
  ) => Promise<ServerResponse>;

  encryptText!: (
    text: string,
    key: string,
    skipKeyExpansion?: boolean
  ) => Promise<ServerResponse>;

  expandKey: (k: string, extendTo: number) => string | void;

  prefix!: string;

  sdk: XQSDKLike;

  shuffle: (s: string) => string;

  static DECRYPTED_TEXT: "decryptedText" = "decryptedText";

  static ENCRYPTED_TEXT: "encrpytedText" = "encrpytedText";

  static KEY: "key" = "key";

  constructor(sdk: XQSDKLike) {
    this.sdk = sdk;

    this.expandKey = (k, extendTo) => {
      const key = k.replace(/\n$/, "");
      if (key.length > extendTo) {
        return this.shuffle(key.substring(0, extendTo));
      }
      let g = key;
      while (g.length < extendTo) {
        g += this.shuffle(key);
      }
      return g;
    };

    this.shuffle = (s: string) => {
      const a = s.split("");
      const n = a.length;
      for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
      }
      return a.join("");
    };
  }
}
