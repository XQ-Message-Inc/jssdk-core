import EncryptionAlgorithm from "../algorithms/EncryptionAlgorithm";
import FetchKey from "./FetchKey";
import ServerResponse from "../ServerResponse";
import XQModule, { SupplyAsync } from "./XQModule";
import XQSDK from "../XQSDK";

/**
 * @class [Decrypt]
 */
export default class Decrypt extends XQModule {
  accessToken: string;
  algorithm: EncryptionAlgorithm;
  requiredFields: string[];
  static ENCRYPTED_TEXT: string;
  static LOCATOR_KEY: string;
  supplyAsync: SupplyAsync;

  constructor(sdk: XQSDK, algorithm: EncryptionAlgorithm) {
    super(sdk);

    this.algorithm = algorithm;
    this.requiredFields = [Decrypt.LOCATOR_KEY, Decrypt.ENCRYPTED_TEXT];

    /**
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @param {String} maybePayLoad.locatorToken - The locator token needed to fetch the encryption key from the server
     * @param {String} maybePayLoad.encryptedText  - The text to decrypt.
     * @returns {Promise<ServerResponse<{payload:{decryptedText:string}}>>}
     */
    this.supplyAsync = (maybePayLoad) => {
      try {
        this.sdk.validateInput(maybePayLoad, this.requiredFields);

        const accessToken = this.accessToken;
        const algorithm = this.algorithm;
        let locatorKey = maybePayLoad[Decrypt.LOCATOR_KEY];
        let encryptedText = maybePayLoad[Decrypt.ENCRYPTED_TEXT];

        return new FetchKey(this.sdk)
          .supplyAsync({ [FetchKey.LOCATOR_KEY]: locatorKey })
          .then((keyRetrievalResponse: ServerResponse) => {
            switch (keyRetrievalResponse.status) {
              case ServerResponse.OK: {
                let encryptionKey = keyRetrievalResponse.payload;
                return algorithm
                  .decryptText(encryptedText, encryptionKey)
                  .then((decryptResponse: ServerResponse) => {
                    switch (decryptResponse.status) {
                      case ServerResponse.OK: {
                        return decryptResponse;
                      }
                      case ServerResponse.ERROR: {
                        console.error(
                          `${algorithm.constructor.name}.decryptText(...) failed, code: ${decryptResponse.statusCode}, reason: ${decryptResponse.payload}`
                        );
                        return decryptResponse;
                      }
                    }
                  });
              }
              case ServerResponse.ERROR: {
                console.info(keyRetrievalResponse);
                return keyRetrievalResponse;
              }
            }
          });
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
    };
  }
}

//**key to fetch the encryption key from the server*/
Decrypt.LOCATOR_KEY = "locatorKey";
Decrypt.ENCRYPTED_TEXT = "encryptedText";
