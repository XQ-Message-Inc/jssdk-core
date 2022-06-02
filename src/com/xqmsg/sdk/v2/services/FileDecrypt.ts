import EncryptionAlgorithm from "../algorithms/EncryptionAlgorithm";
import FetchKey from "./FetchKey";
import ServerResponse from "../ServerResponse";
import XQModule from "./XQModule";
import XQSDK from "../XQSDK";
import { XQServices } from "../XQServicesEnum";

import handleException from "../exceptions/handleException";

/**
 * A service which is utilized to decrypt data stored in a file using the {@link EncryptionAlgorithm} provided.
 *
 * @class [FileDecrypt]
 */
export default class FileDecrypt extends XQModule {
  /** The encryption algorithm used for this service */
  algorithm: EncryptionAlgorithm;

  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** The field name representing the specified source file to decrypt */
  static SOURCE_FILE: "sourceFile" = "sourceFile";

  /**
   * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
   * @param {File} maybePayLoad.sourceFile - The file to be decrypted.
   *
   *  @returns {Promise<ServerResponse<{payload:File}>>}
   */
  supplyAsync: (maybePayload: { sourceFile: File }) => Promise<ServerResponse>;

  constructor(sdk: XQSDK, algorithm: EncryptionAlgorithm) {
    super(sdk);

    this.algorithm = algorithm;
    this.requiredFields = [FileDecrypt.SOURCE_FILE];

    this.supplyAsync = (maybePayLoad) => {
      try {
        this.sdk.validateInput(maybePayLoad, this.requiredFields);
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.FileDecrypt))
        );
      }
      const algorithm = this.algorithm;
      const sdk = this.sdk;
      const sourceFile = maybePayLoad[FileDecrypt.SOURCE_FILE];

      try {
        return algorithm.decryptFile(
          sourceFile,
          async (aLocatorToken: string) => {
            const response = await new FetchKey(sdk).supplyAsync({
              [FetchKey.LOCATOR_KEY]: aLocatorToken,
            });
            switch (response.status) {
              case ServerResponse.OK: {
                return response.payload as string;
              }
              default: {
                throw response;
              }
            }
          }
        );
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.FileDecrypt))
        );
      }
    };
  }
}
