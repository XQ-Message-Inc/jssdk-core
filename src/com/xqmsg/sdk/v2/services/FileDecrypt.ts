import FetchKey from "./FetchKey";
import ServerResponse from "../ServerResponse";
import XQModule from "./XQModule";
import XQSDK from "../XQSDK";

type EncryptionAlgorithm = {
  decryptFile: (
    sourceFile: string,
    locate: (aLocatorToken: string) => Promise<Record<string, any>>
  ) => void;
};
/**
 *
 * Decrypts data stored in a file using the {@link EncryptionAlgorithm} provided.
 *
 * @class [FileDecrypt]
 */
export default class FileDecrypt extends XQModule {
  algorithm: EncryptionAlgorithm;
  requiredFields: string[];
  static SOURCE_FILE: string;
  supplyAsync: (maybePayload: Record<string, any>) => void;

  constructor(sdk: XQSDK, algorithm: EncryptionAlgorithm) {
    super(sdk);

    this.algorithm = algorithm;
    this.requiredFields = [FileDecrypt.SOURCE_FILE];

    /**
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @param {File} maybePayLoad.sourceFile - The file to be decrypted.
     *
     *  @returns {Promise<ServerResponse<{payload:File}>>}
     */
    this.supplyAsync = (maybePayLoad) => {
      try {
        this.sdk.validateInput(maybePayLoad, this.requiredFields);
      } catch (validationException) {
        return new Promise((resolve, reject) => {
          resolve(
            new ServerResponse(
              ServerResponse.ERROR,
              validationException.code,
              validationException.reason
            )
          );
        });
      }
      const algorithm = this.algorithm;
      const sdk = this.sdk;
      const sourceFile = maybePayLoad[FileDecrypt.SOURCE_FILE];

      return algorithm.decryptFile(sourceFile, (aLocatorToken: string) => {
        return new FetchKey(sdk)
          .supplyAsync({ [FetchKey.LOCATOR_KEY]: aLocatorToken })
          .then((retrieveKeyRespose: ServerResponse) => {
            switch (retrieveKeyRespose.status) {
              case ServerResponse.OK: {
                return retrieveKeyRespose.payload;
              }
              case ServerResponse.ERROR: {
                console.error(
                  `${algorithm.constructor.name}.decryptFile() failed, code: ${retrieveKeyRespose.statusCode}, reason: ${retrieveKeyRespose.payload}`
                );
                return retrieveKeyRespose;
              }
            }
          });
      });
    };
  }
}

FileDecrypt.SOURCE_FILE = "sourceFile";
