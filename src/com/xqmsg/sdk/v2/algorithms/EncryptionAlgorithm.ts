import ServerResponse from "../ServerResponse";
import XQSDK from "../XQSDK";

export type DecryptText = (
  text: string,
  key: string
) => Promise<ServerResponse>;

export type EncryptText = (
  text: string,
  key: string
) => Promise<ServerResponse>;

export type EncryptFile = (
  sourceFile: File,
  expandedKey: string | void,
  locatorToken: string
) => Promise<ServerResponse>;

export type ExpandKey = (k: string, extendTo: number) => string | void;

/**
 * @class
 * Super class for Encryption Algorithms supported by XQ Message:
 * * AESEncryption
 * * OTPv2Encryption
 */
export default class EncryptionAlgorithm {
  encryptFile: EncryptFile;
  encryptText: EncryptText;
  expandKey: ExpandKey;
  prefix: string;
  sdk: XQSDK;
  static DECRYPTED_TEXT: string;
  static ENCRYPTED_TEXT: string;
  static KEY: string;
  decryptText: any;

  constructor(sdk: XQSDK) {
    this.sdk = sdk;

    this.expandKey = (k, extendTo) => {
      let key = k.replace(/\n$/, "");
      if (key.length > extendTo) {
        return this.shuffle(key.substring(0, extendTo));
      }
      let g = key;
      while (g.length < extendTo) {
        g += this.shuffle(key);
      }
      return g;
    };

    this.shuffle = (s) => {
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
  shuffle(arg0: any) {
    throw new Error("Method not implemented.");
  }
}

EncryptionAlgorithm.ENCRYPTED_TEXT = "encrpytedText";
EncryptionAlgorithm.DECRYPTED_TEXT = "decryptedText";
EncryptionAlgorithm.KEY = "key";
