import ServerResponse from "../ServerResponse";
import XQSDK from "../XQSDK";

/**
 * Super class for Encryption Algorithms supported by XQ Message:
 * * AESEncryption
 * * OTPv2Encryption
 *
 * @class [EncryptionAlgorithm]
 */
export default class EncryptionAlgorithm {
  /**
   * Takes an encrypted text string and attempts to decrypt with the provided key.
   * @param  {String} text - the text to decrypt.
   * @param  {String} key - the encryption key.
   * @return {Promise<ServerResponse<{payload:{decryptedText:string}}>>} A Promise of the Response containing the decrypted text.
   */
  decryptText: (text: string, key: string) => Promise<ServerResponse>;

  /**
   * Takes an file and attempts to encrypt with the provided quantum key.
   * @param  {File} sourceFile - the file to decrypt.
   * @param  {String} key The encryption key.
   * @return {Promise<ServerResponse<{payload:{decryptedText:string}}>>} A Promise of the Response containing the decrypted text.
   */
  encryptFile: (
    sourceFile: File,
    expandedKey: string | void,
    locatorToken: string
  ) => Promise<ServerResponse>;

  decryptFile: (
    sourceFile: File,
    locateFn: (aLocatorToken: string) => Promise<Record<string, string>>
  ) => Promise<ServerResponse>;

  /**
   * Takes a string and encrypts it using the provided quantum key.
   *
   * @param  {String} text The text to encrypt.
   * @param  {String} key The encryption key.
   * @return {Promise<ServerResponse>} The encrypted text.
   */
  encryptText: (text: string, key: string) => Promise<ServerResponse>;

  /**
   * Expand a key length to that of the text that needs encryption.
   * @param {String} k - the original key ( cannot be empty
   * @param {Number} extendTo - the key length that we require
   * @returns {String} Expanded Key
   */
  expandKey: (k: string, extendTo: number) => string | void;

  /** The prefix prepended to an `expandedKey` string  */
  prefix: string;

  /** The XQ SDK instance */
  sdk: XQSDK;

  /** A function which takes `s` of type `String` and shuffles the elements of the string
   * @param {String} s - the string to be shuffled
   * @returns {String} shuffled string
   */
  shuffle: (s: string) => string;

  /** The field name representing the decrypted text value */
  static DECRYPTED_TEXT: "decryptedText" = "decryptedText";

  /** The field name representing the encrypted text value */
  static ENCRYPTED_TEXT: "encrpytedText" = "encrpytedText";

  /** The field name representing the encryption key */
  static KEY: "key" = "key";

  constructor(sdk: XQSDK) {
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
