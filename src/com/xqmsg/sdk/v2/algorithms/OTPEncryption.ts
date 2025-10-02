import EncryptionAlgorithm from "./EncryptionAlgorithm";
import ServerResponse from "../ServerResponse";
// eslint-disable-next-line sort-imports
import { XQEncryptionAlgorithms, XQServices } from "../XQServicesEnum";
import XQSDK from "../XQSDK";
import { XQWebCrypto } from "../../../web-crypto/webcrypto";

import handleException from "../exceptions/handleException";

type ParsedFile = {
  locator: string;
  nameEncrypted: Uint8Array;
  contentEncrypted: ArrayBuffer;
};

export default class OTPEncryption extends EncryptionAlgorithm {
  /**
   * Takes an encrypted file and attempts to decrypt with the provided key.
   * @param  {File} sourceFile - the file to decrypt.
   * @param  {String} key The encryption key.
   * @return {Promise<ServerResponse<{payload:{decryptedText:string}}>>} A Promise of the Response containing the decrypted text.
   */
  decryptFile: (
    sourceFile: File,
    locateFn: (aLocatorToken: string) => Promise<string>
  ) => Promise<ServerResponse>;

  /**
   * Takes an OTP encrypted text string and attempts to decrypt with the provided key.
   * @param  {String} text - the text to decrypt.
   * @param  {String} key - the encryption key.
   * @return {Promise<ServerResponse<{payload:{decryptedText:string}}>>} A Promise of the Response containing the decrypted text.
   */
  decryptText: (text: string, key: string) => Promise<ServerResponse>;

  /**
   * @param {File} file - the file to be encrypted
   * @param {String} expandedKey - a key expanded to the length to that of the text that needs encryption.
   * @param {String} locatorKey - the key used to fetch the encryption key from the server
   * @return {Promise<ServerResponse<{payload:File}>>}} A Promise of the response containing encrypted File.
   */
  encryptFile: (
    sourceFile: File,
    expandedKey: string | void,
    locatorKey: string
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
   *
   * @param {File} file
   * @return {Promise<{locator,nameEncrypted, contentEncrypted}>}
   */
  parseFileForDecrypt: (file: File) => Promise<ParsedFile>;

  /** a two character marker,
   * prepended to the key serving
   * to identify the algorithm used for text encryption
   * */
  prefix: string;

  /** a two character marker,
   * prepended to the key serving
   * to identify the algorithm used for file encryption
   * */
  filePrefix: string;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.prefix = `.${XQWebCrypto.otp.scheme}`;
    this.filePrefix = `.${XQWebCrypto.otp.fileScheme}`;

    this.encryptText = (text, key, skipKeyExpansion = false) => {
      try {
        const self = this;
        self.sdk.validateAccessToken();

        return new Promise((resolve) => {
          if (key === "" || key == undefined) {
            console.error("OTP Source Key cannot be empty.");
            resolve(
              new ServerResponse(
                ServerResponse.ERROR,
                500,
                "OTP Source Key cannot be empty."
              )
            );
          }
          const expandedKey = skipKeyExpansion
            ? key
            : self.expandKey(key, 2048);
          if (expandedKey == null) {
            console.error("Key could not be UTF8 encoded.");
            return resolve(
              new ServerResponse(
                ServerResponse.ERROR,
                500,
                "Key could not be UTF8 encoded."
              )
            );
          }
          const prefixedKey = `${this.prefix}${expandedKey}`;
          XQWebCrypto.otp.encrypt(text, prefixedKey, false).then(
            (encryptedText) => {
              resolve(
                new ServerResponse(ServerResponse.OK, 200, {
                  [EncryptionAlgorithm.ENCRYPTED_TEXT]: encryptedText,
                  [EncryptionAlgorithm.KEY]: expandedKey,
                })
              );
            },
            (reason) => {
              return new Promise((resolve) => {
                resolve(
                  handleException(reason, XQEncryptionAlgorithms.OTPEncryption)
                );
              });
            }
          );
        });
      } catch (exception) {
        return new Promise((resolve) => {
          resolve(
            handleException(exception, XQEncryptionAlgorithms.OTPEncryption)
          );
        });
      }
    };

    this.encryptFile = (file, expandedKey, locatorKey) => {
      try {
        const self = this;
        self.sdk.validateAccessToken();
        const prefixedKey = `${this.filePrefix}${expandedKey}`;
        return new Promise<ServerResponse>((resolve) => {
          XQWebCrypto.auto.encryptFile(
            file.name,
            locatorKey,
            prefixedKey,
            file,
            (success: boolean, rawContentOrError: Blob|string) => {
                if (success) {
                  const blob = rawContentOrError as Blob
                  resolve(
                    new ServerResponse(
                      ServerResponse.OK,
                      200,
                      new File([blob], `${file.name}.xqf`)
                    )
                  );
                } else {
                  const error = rawContentOrError as string

                  console.error(`failed to encrypt file ${file.name}, reason: ${error}`);
                  resolve(
                    new ServerResponse(
                      ServerResponse.ERROR,
                      500,
                      `failed to encrypt file ${file.name}, reason: ${error}`
                    )
                  );
                }
              }
            );
          });
      } catch (exception) {
        return new Promise((resolve) => {
          resolve(
            handleException(exception, XQEncryptionAlgorithms.OTPEncryption)
          );
        });
      }
    };

    this.decryptText = (text, key) => {
      try {
        const self = this;
        self.sdk.validateAccessToken();
        const prefixedKey = `${this.prefix}${key}`;

        return new Promise((resolve) => {
          try {
            XQWebCrypto.otp.decrypt(text, prefixedKey, false).then(
              (decryptedText) => {
                resolve(
                  new ServerResponse(ServerResponse.OK, 200, {
                    [EncryptionAlgorithm.DECRYPTED_TEXT]: decryptedText,
                  })
                );
              },
              (reason) => {
                return new Promise((resolve) => {
                  resolve(
                    handleException(
                      reason,
                      XQEncryptionAlgorithms.OTPEncryption
                    )
                  );
                });
              }
            );
          } catch (exception) {
            return new Promise((resolve) => {
              resolve(
                handleException(exception, XQEncryptionAlgorithms.OTPEncryption)
              );
            });
          }
        });
      } catch (exception) {
        return new Promise((resolve) => {
          resolve(
            handleException(exception, XQEncryptionAlgorithms.OTPEncryption)
          );
        });
      }
    };

    this.decryptFile = async (sourceFile, locateFn) => {
      try {
        const self = this;
        self.sdk.validateAccessToken();

        const { locator } = await this.parseFileForDecrypt(sourceFile);
        const prefixedKey = await locateFn(locator).then((key) => {
          return `${this.filePrefix}${key}`;
        });

        return new Promise<ServerResponse>((resolve) => {
          XQWebCrypto.otp.decryptFile(
            sourceFile,
            function (token: string, onFetched: (key: string) => void) {
              onFetched(prefixedKey);
            },
            function (
              success: boolean,
              filenameOrError: string,
              rawContent?: Uint8Array
            ) {
              if (success && rawContent) {
                const file = new File([Uint8Array.from(rawContent)], filenameOrError);
                return resolve(new ServerResponse(ServerResponse.OK, 200, file));
              } else {
                return resolve(
                  new ServerResponse(
                    ServerResponse.ERROR,
                    500,
                    `Failed to decrypt file: ${filenameOrError}`
                  )
                );
              }
            }
          );
        });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.FileDecrypt))
        );
      }
    };

    this.parseFileForDecrypt = async (file) => {
      // Only read the header portion
      const headerSlice = file.slice(0, 1024);
      const headerBytes = await new Response(headerSlice).arrayBuffer();

      let start = 0;
      let end = 4;
      const locatorSize = new Uint32Array(headerBytes.slice(start, end))[0];
      if (locatorSize > 256) {
        throw new Error(
          "Unable to parse file, check that the file is valid and not damaged"
        );
      }
      start = end;
      end = start + locatorSize - 1;
      const locator = new TextDecoder().decode(
        new Uint8Array(headerBytes.slice(start, end))
      );
      start = end;
      end = start + 4;
      const fileNameSize = new Uint32Array(headerBytes.slice(start, end))[0];
      if (fileNameSize < 2 || fileNameSize > 2000) {
        throw new Error(
          "Unable to parse file, check that the file is valid and not damaged"
        );
      }
      start = end;
      end = start + fileNameSize - 1;
      const nameEncrypted = new Uint8Array(headerBytes.slice(start, end));
      start = end;
      const contentEncrypted = headerBytes.slice(start);
      return {
        locator,
        nameEncrypted,
        contentEncrypted: new ArrayBuffer(0), // Empty placeholder for type compatibility
      };
    };
  }
}
