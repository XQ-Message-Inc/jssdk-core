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

export default class GCMEncryption extends EncryptionAlgorithm {
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
    this.prefix = `.${XQWebCrypto.gcm.scheme}`;
    this.filePrefix = `.${XQWebCrypto.gcm.scheme}`;

    this.encryptText = (text, key, skipKeyExpansion = false) => {
      try {
        const self = this;
        self.sdk.validateAccessToken();

        return new Promise((resolve) => {
          if (key === "" || key == undefined) {
            console.error("GCM Source Key cannot be empty.");
            resolve(
              new ServerResponse(
                ServerResponse.ERROR,
                500,
                "GCM Source Key cannot be empty."
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
          XQWebCrypto.gcm.encrypt(text, prefixedKey, false).then(
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
                    XQEncryptionAlgorithms.GCMEncryption
                  )
                );
              });
            }
          );
        });
      } catch (exception) {
        return new Promise((resolve) => {
          resolve(
            handleException(exception, XQEncryptionAlgorithms.GCMEncryption)
          );
        });
      }
    };

    this.encryptFile = (file, expandedKey, locatorKey) => {
      try {
        const self = this;
        self.sdk.validateAccessToken();
        const prefixedKey = `${this.filePrefix}${expandedKey}`;
        return new Response(file).arrayBuffer().then((fileArrayBuffer) => {
          return new Promise<ServerResponse>((resolve) => {
            XQWebCrypto.auto.encryptFile(
              file.name,
              locatorKey,
              prefixedKey,
              new Uint8Array(fileArrayBuffer),
              (success: boolean, rawContentOrError: Uint8Array | string) => {
                if (success) {
                  const rawContent = rawContentOrError as Uint8Array;
                  const blob = new Blob([rawContent], {
                    type: "application/octet-stream",
                  });
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
        });
      } catch (exception) {
        return new Promise((resolve) => {
          resolve(
            handleException(exception, XQEncryptionAlgorithms.GCMEncryption)
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
            XQWebCrypto.gcm.decrypt(text, prefixedKey, false).then(
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
                      XQEncryptionAlgorithms.GCMEncryption
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
                  XQEncryptionAlgorithms.GCMEncryption
                )
              );
            });
          }
        });
      } catch (exception) {
        return new Promise((resolve) => {
          resolve(
            handleException(exception, XQEncryptionAlgorithms.GCMEncryption)
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
        const fileDataArrayBuffer = await new Response(
          sourceFile
        ).arrayBuffer();

        return new Promise<ServerResponse>((resolve) => {
          XQWebCrypto.auto.decryptFile(
            fileDataArrayBuffer,
            function (token: string, onFetched: (key: string) => void) {
              onFetched(prefixedKey);
            },
            function (
              status: string,
              filename: string,
              rawContent: Uint8Array
            ) {
              const file = new File([Uint8Array.from(rawContent)], filename);
              return resolve(new ServerResponse(ServerResponse.OK, 200, file));
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
      const fileDataBytes = await new Response(file).arrayBuffer();

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
