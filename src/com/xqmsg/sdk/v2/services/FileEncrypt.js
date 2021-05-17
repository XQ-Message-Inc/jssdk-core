import XQModule from "./XQModule.js";
import ServerResponse from "../ServerResponse.js";
import FetchQuantumEntropy from "../quantum/FetchQuantumEntropy.js";
import GeneratePacket from "./GeneratePacket.js";
import ValidatePacket from "./ValidatePacket.js";

/**
 *
 * Encrypts data stored in a file using the {@link EncryptionAlgorithm} provided.
 *
 * @class [FileEncrypt]
 */
export default class FileEncrypt extends XQModule {
  constructor(sdk, algorithm) {
    super(sdk);

    this.algorithm = algorithm;
    this.requiredFields = [
      FileEncrypt.SOURCE_FILE,
      FileEncrypt.RECIPIENTS,
      FileEncrypt.EXPIRES_HOURS,
    ];
  }

  /**
   * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
   * @param {File} maybePayLoad.sourceFile - The file to be encrypted.
   * @param {[String]} maybePayLoad.recipients  - List of emails of users intended to have read access to the encrypted content.
   * @param {Long} maybePayLoad.expires - Life span of the encrypted content, measured in hours.
   * @param {Boolean} [maybePayLoad.dor=false] - Should the content be deleted after opening.
   *
   * @returns {Promise<ServerResponse<{payload:File}>>}
   */
  supplyAsync = function (maybePayLoad) {
    try {
      this.sdk.validateInput(maybePayLoad, this.requiredFields);

      const algorithm = this.algorithm;
      const sdk = this.sdk;
      const sourceFile = maybePayLoad[FileEncrypt.SOURCE_FILE];
      const recipients = maybePayLoad[FileEncrypt.RECIPIENTS];
      const expiration = maybePayLoad[FileEncrypt.EXPIRES_HOURS];
      const deleteOnReceipt = maybePayLoad[FileEncrypt.DELETE_ON_RECEIPT];

      return new FetchQuantumEntropy(sdk)
        .supplyAsync({ [FetchQuantumEntropy.KS]: FetchQuantumEntropy._256 })
        .then(function (keyResponse) {
          switch (keyResponse.status) {
            case ServerResponse.OK: {
              const initialKey = keyResponse.payload;
              let expandedKey = algorithm.expandKey(
                initialKey,
                sourceFile.size > 4096 ? 4096 : Math.max(2048, sourceFile.size)
              );
              return new GeneratePacket(sdk)
                .supplyAsync({
                  [FileEncrypt.KEY]: algorithm.prefix + expandedKey,
                  [FileEncrypt.RECIPIENTS]: recipients,
                  [FileEncrypt.EXPIRES_HOURS]: expiration,
                  [FileEncrypt.DELETE_ON_RECEIPT]: deleteOnReceipt
                    ? deleteOnReceipt
                    : false,
                })
                .then(function (uploadResponse) {
                  switch (uploadResponse.status) {
                    case ServerResponse.OK: {
                      const packet = uploadResponse.payload;
                      return new ValidatePacket(sdk)
                        .supplyAsync({ [ValidatePacket.PACKET]: packet })
                        .then(function (validateResponse) {
                          switch (validateResponse.status) {
                            case ServerResponse.OK: {
                              const locatorToken = validateResponse.payload;
                              return algorithm
                                .encryptFile(
                                  sourceFile,
                                  expandedKey,
                                  locatorToken
                                )
                                .then(function (fileEncryptResponse) {
                                  switch (fileEncryptResponse.status) {
                                    case ServerResponse.OK: {
                                      return fileEncryptResponse;
                                    }
                                    case ServerResponse.ERROR: {
                                      console.error(
                                        `${algorithm.constructor.name}.encryptFile() failed, code: ${fileEncryptResponse.statusCode}, reason: ${fileEncryptResponse.payload}`
                                      );
                                      return fileEncryptResponse;
                                    }
                                  }
                                });
                            }
                            case ServerResponse.ERROR: {
                              console.error(
                                `ValidateNewKeyPacket failed, code: ${validateResponse.statusCode}, reason: ${validateResponse.payload}`
                              );
                              return validateResponse;
                            }
                          }
                        });
                    }
                    case ServerResponse.ERROR: {
                      console.error(
                        `GeneratePacket failed, code: ${uploadResponse.statusCode}, reason: ${uploadResponse.payload}`
                      );
                      return uploadResponse;
                    }
                  }
                });
            }
            case ServerResponse.ERROR: {
              console.error(
                `FetchQuantumEntropy failed, code: ${keyResponse.statusCode}, reason: ${keyResponse.payload}`
              );
              return keyResponse;
            }
          }
        });
    } catch (validationException) {
      return new Promise(function (resolve) {
        resolve(
          new ServerResponse(
            ServerResponse.ERROR,
            validationException.code,
            validationException.reason
          )
        );
      });
    }
  };
}

/** Encryption Key.*/
FileEncrypt.KEY = "key";
/** The File to be encrypted.*/
FileEncrypt.SOURCE_FILE = "sourceFile";
/** List of emails of users intended to have read access to the encrypted content*/
FileEncrypt.RECIPIENTS = "recipients";
/** Should the content be deleted after opening*/
FileEncrypt.DELETE_ON_RECEIPT = "dor";
/** Life span of the encrypted content*/
FileEncrypt.EXPIRES_HOURS = "expires";
