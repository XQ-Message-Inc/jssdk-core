import EncryptionAlgorithm, { XQSDKLike } from "./EncryptionAlgorithm";
import ServerResponse from "../ServerResponse";
import { XQEncryptionAlgorithms, XQServices } from "../XQServicesEnum";
import { XQWebCrypto } from "../../../web-crypto/webcrypto";

import handleException from "../exceptions/handleException";

type ParsedFile = {
  locator: string;
  nameEncrypted: Uint8Array;
  contentEncrypted: ArrayBuffer;
};

export default class CTREncryption extends EncryptionAlgorithm {
  decryptFile: (
    sourceFile: File,
    locateFn: (aLocatorToken: string) => Promise<string>
  ) => Promise<ServerResponse>;

  decryptText: (text: string, key: string) => Promise<ServerResponse>;

  encryptFile: (
    sourceFile: File,
    expandedKey: string | void,
    locatorKey: string
  ) => Promise<ServerResponse>;

  encryptText: (text: string, key: string) => Promise<ServerResponse>;

  parseFileForDecrypt: (file: File) => Promise<ParsedFile>;

  prefix: string;

  filePrefix: string;

  constructor(sdk: XQSDKLike) {
    super(sdk);
    this.prefix = `.${XQWebCrypto.ctr.scheme}`;
    this.filePrefix = `.${XQWebCrypto.ctr.scheme}`;

    this.encryptText = (text, key, skipKeyExpansion = false) => {
      try {
        const self = this;
        self.sdk.validateAccessToken();

        return new Promise((resolve) => {
          if (key === "" || key == undefined) {
            console.error("CTR Source Key cannot be empty.");
            resolve(
              new ServerResponse(
                ServerResponse.ERROR,
                500,
                "CTR Source Key cannot be empty."
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
          XQWebCrypto.ctr.encrypt(text, prefixedKey, false).then(
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
                  handleException(
                    reason,
                    XQEncryptionAlgorithms.CTREncryption
                  )
                );
              });
            }
          );
        });
      } catch (exception) {
        return new Promise((resolve) => {
          resolve(
            handleException(exception, XQEncryptionAlgorithms.CTREncryption)
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
            (success: boolean, rawContentOrError: Blob | string) => {
              if (success) {
                const blob = rawContentOrError as Blob;
                resolve(
                  new ServerResponse(
                    ServerResponse.OK,
                    200,
                    new File([blob], `${file.name}.xqf`)
                  )
                );
              } else {
                const error = rawContentOrError as string;

                console.error(
                  `failed to encrypt file ${file.name}, reason: ${error}`
                );
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
            handleException(exception, XQEncryptionAlgorithms.CTREncryption)
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
            XQWebCrypto.ctr.decrypt(text, prefixedKey, false).then(
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
                      XQEncryptionAlgorithms.CTREncryption
                    )
                  );
                });
              }
            );
          } catch (exception) {
            return new Promise((resolve) => {
              resolve(
                handleException(
                  exception,
                  XQEncryptionAlgorithms.CTREncryption
                )
              );
            });
          }
        });
      } catch (exception) {
        return new Promise((resolve) => {
          resolve(
            handleException(exception, XQEncryptionAlgorithms.CTREncryption)
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
          XQWebCrypto.ctr.decryptFile(
            sourceFile,
            function (token: string, onFetched: (key: string) => void) {
              onFetched(prefixedKey);
            },
            function (
              success: boolean,
              filenameOrError: string,
              rawContent?: Blob
            ) {
              if (success && rawContent) {
                const file = new File([rawContent], filenameOrError);
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
      const headerSlice = file.slice(0, 1024);
      const fileDataBytes = await new Response(headerSlice).arrayBuffer();

      let start = 0;
      let end = 4;
      const locatorSize = new Uint32Array(fileDataBytes.slice(start, end))[0];
      if (locatorSize > 256) {
        throw new Error(
          "Unable to parse file, check that the file is valid and not damaged"
        );
      }
      start = end;
      end = start + locatorSize - 1;
      const locator = new TextDecoder().decode(
        new Uint8Array(fileDataBytes.slice(start, end))
      );
      start = end;
      end = start + 4;
      const fileNameSize = new Uint32Array(fileDataBytes.slice(start, end))[0];
      if (fileNameSize < 2 || fileNameSize > 2000) {
        throw new Error(
          "Unable to parse file, check that the file is valid and not damaged"
        );
      }
      start = end;
      end = start + fileNameSize - 1;
      const nameEncrypted = new Uint8Array(fileDataBytes.slice(start, end));
      start = end;
      const contentEncrypted = fileDataBytes.slice(start);
      return {
        locator,
        nameEncrypted,
        contentEncrypted,
      };
    };
  }
}
