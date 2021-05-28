import EncryptionAlgorithm from "../algorithms/EncryptionAlgorithm";
import FetchQuantumEntropy from "../quantum/FetchQuantumEntropy";
import GeneratePacket from "./GeneratePacket";
import ServerResponse from "../ServerResponse";
import XQModule from "./XQModule";
import XQSDK from "../XQSDK";

/**
 * A service which is utilized to encrypt textual data using the {@link EncryptionAlgorithm} provided.
 *
 * @class [Encrypt]
 */
export default class Encrypt extends XQModule {
  /** The encryption algorithm used for this service */
  algorithm: EncryptionAlgorithm;

  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** The field name representing the boolean value which specifies if the content should be deleted after opening */
  static DELETE_ON_RECEIPT: "dor";

  /** The field name representing the encrypted text */
  static ENCRYPTED_TEXT: "encryptedText";

  /** The field name representing the number of hours of life span until access to the encrypted text is expired */
  static EXPIRES_HOURS: "expires";

  /** The field name representing the key used to fetch the encryption key from the server */
  static LOCATOR_KEY: "locatorKey";

  /** The field name representing the list of emails of users intended to have read access to the encrypted content */
  static RECIPIENTS: "recipients";

  /** The field name representing the text that will be encrypted */
  static TEXT: "text";

  /**
   * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
   * @param {[String]} maybePayLoad.recipients  - the list of emails of users intended to have read access to the encrypted content
   * @param {String} maybePayLoad.text - the text that will be encrypted
   * @param {Long} maybePayLoad.expires - the number of hours of life span until access to the encrypted text is expired
   * @param {Boolean} [maybePayLoad.dor=false] - the boolean value which specifies if the content should be deleted after opening
   *
   * @returns {Promise<ServerResponse<{payload:{locatorKey:string, encryptedText:string}}>>}
   */
  supplyAsync: (maybePayLoad: {
    recipients: string[];
    text: string;
    expires: number;
    dor: boolean;
  }) => Promise<ServerResponse | undefined>;

  constructor(sdk: XQSDK, algorithm: EncryptionAlgorithm) {
    super(sdk);

    this.algorithm = algorithm;
    this.requiredFields = [
      Encrypt.RECIPIENTS,
      Encrypt.TEXT,
      Encrypt.EXPIRES_HOURS,
    ];

    this.supplyAsync = (maybePayLoad) => {
      try {
        this.sdk.validateInput(maybePayLoad, this.requiredFields);

        const sdk = this.sdk;
        const algorithm = this.algorithm;
        const message = maybePayLoad[Encrypt.TEXT];
        const recipients = maybePayLoad[Encrypt.RECIPIENTS];
        const expiresHours = maybePayLoad[Encrypt.EXPIRES_HOURS];
        const deleteOnReceipt = maybePayLoad[Encrypt.DELETE_ON_RECEIPT];

        return new FetchQuantumEntropy(sdk)
          .supplyAsync({ [FetchQuantumEntropy.KS]: FetchQuantumEntropy._256 })
          .then((keyResponse: ServerResponse) => {
            switch (keyResponse.status) {
              case ServerResponse.OK: {
                const initialKey = keyResponse.payload.data;

                const expandedKey = algorithm.expandKey(
                  initialKey,
                  message.length > 4096 ? 4096 : Math.max(2048, message.length)
                ) as string;

                return algorithm
                  .encryptText(message, expandedKey)
                  .then((encryptResponse: ServerResponse) => {
                    switch (encryptResponse.status) {
                      case ServerResponse.OK: {
                        const encryptResult = encryptResponse.payload;
                        const encryptedText =
                          encryptResult[EncryptionAlgorithm.ENCRYPTED_TEXT];
                        const expandedKey =
                          encryptResult[EncryptionAlgorithm.KEY];

                        return new GeneratePacket(sdk)
                          .supplyAsync({
                            [GeneratePacket.KEY]:
                              algorithm.prefix + expandedKey,
                            [GeneratePacket.RECIPIENTS]: recipients,
                            [GeneratePacket.EXPIRES_HOURS]: expiresHours,
                            [GeneratePacket.DELETE_ON_RECEIPT]: deleteOnReceipt
                              ? deleteOnReceipt
                              : false,
                          })
                          .then((uploadResponse: ServerResponse) => {
                            switch (uploadResponse.status) {
                              case ServerResponse.OK: {
                                const locator = uploadResponse.payload;
                                return new ServerResponse(
                                  ServerResponse.OK,
                                  200,
                                  {
                                    [Encrypt.LOCATOR_KEY]: locator,
                                    [Encrypt.ENCRYPTED_TEXT]: encryptedText,
                                  }
                                );
                              }

                              case ServerResponse.ERROR: {
                                console.error(
                                  `PacketValidation failed, code: ${uploadResponse.statusCode}, reason: ${uploadResponse.payload}`
                                );
                                return uploadResponse;
                              }
                            }
                          });
                      }
                      case ServerResponse.ERROR: {
                        console.error(
                          `${algorithm.constructor.name}.encryptText(...) failed,  code: ${encryptResponse.statusCode}, reason: ${encryptResponse.payload}`
                        );
                        return encryptResponse;
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
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(
            new ServerResponse(
              ServerResponse.ERROR,
              exception.code,
              exception.reason
            )
          )
        );
      }
    };
  }
}
