import EncryptionAlgorithm from "../algorithms/EncryptionAlgorithm";
import FetchKey from "./FetchKey";
import ServerResponse from "../ServerResponse";
import XQModule from "./XQModule";
import XQSDK from "../XQSDK";
import { XQServices } from "../XQServicesEnum";

import handleException from "../exceptions/handleException";

/**
 * A service which is utilized to decrypt encrypted textual data using the {@link EncryptionAlgorithm} provided.
 *
 * @class [Decrypt]
 */
export default class Decrypt extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** The token which represents the security credentials used to validate a user's identity */
  accessToken: string;

  /** The encryption algorithm used for this service */
  algorithm: EncryptionAlgorithm;

  /** The field name representing the encrypted text content */
  static ENCRYPTED_TEXT: "encryptedText" = "encryptedText";

  /** The field name representing the key used to fetch the encryption key from the server */
  static LOCATOR_KEY: "locatorKey" = "locatorKey";
  /**
   * @param {Map} maybePayload - the container for the request parameters supplied to this method.
   * @param {String} maybePayload.locatorKey - the key used to fetch the encryption key from the server
   * @param {String} maybePayload.encryptedText  - the encrypted text to decrypt.
   * @returns {Promise<ServerResponse<{payload:{decryptedText:string}}>>}
   */
  supplyAsync: (maybePayload: {
    locatorKey: string;
    encryptedText: string;
  }) => Promise<ServerResponse | undefined>;

  constructor(sdk: XQSDK, algorithm: EncryptionAlgorithm) {
    super(sdk);

    this.algorithm = algorithm;
    this.requiredFields = [Decrypt.LOCATOR_KEY, Decrypt.ENCRYPTED_TEXT];

    this.supplyAsync = (maybePayload) => {
      try {
        this.sdk.validateInput(maybePayload, this.requiredFields);

        // const accessToken = this.accessToken;
        const algorithm = this.algorithm;
        const locatorKey = maybePayload[Decrypt.LOCATOR_KEY];
        const encryptedText = maybePayload[Decrypt.ENCRYPTED_TEXT];

        return new FetchKey(this.sdk)
          .supplyAsync({ [FetchKey.LOCATOR_KEY]: locatorKey })
          .then((keyRetrievalResponse: ServerResponse) => {
            switch (keyRetrievalResponse.status) {
              case ServerResponse.OK: {
                const encryptionKey = keyRetrievalResponse.payload;
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
                return handleException(
                  keyRetrievalResponse,
                  XQServices.Decrypt
                );
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.Decrypt))
        );
      }
    };
  }
}
