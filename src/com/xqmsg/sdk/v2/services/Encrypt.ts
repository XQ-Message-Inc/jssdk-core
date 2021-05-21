import EncryptionAlgorithm from "../algorithms/EncryptionAlgorithm";
import FetchQuantumEntropy from "../quantum/FetchQuantumEntropy";
import GeneratePacket from "./GeneratePacket";
import ServerResponse from "../ServerResponse";
import ValidatePacket from "./ValidatePacket";
import XQModule from "./XQModule";
import XQSDK from "../XQSDK";
/**
 *
 * Encrypts textual data using the {@link EncryptionAlgorithm} provided.
 *
 * @class [Encrypt]
 */
export default class Encrypt extends XQModule {
  algorithm: EncryptionAlgorithm;
  requiredFields: string[];
  static DELETE_ON_RECEIPT: string;
  static ENCRYPTED_TEXT: string;
  static EXPIRES_HOURS: string;
  static LOCATOR_KEY: string;
  static RECIPIENTS: string;
  static TEXT: string;
  supplyAsync: (maybePayLoad: Record<string, any>) => Promise<any>;

  constructor(sdk: XQSDK, algorithm: EncryptionAlgorithm) {
    super(sdk);

    this.algorithm = algorithm;
    this.requiredFields = [
      Encrypt.RECIPIENTS,
      Encrypt.TEXT,
      Encrypt.EXPIRES_HOURS,
    ];

    /**
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @param {[String]} maybePayLoad.recipients  - List of emails of users intended to have read access to the encrypted content.
     * @param {String} maybePayLoad.text - Text to be encrypted.
     * @param {Long} maybePayLoad.expires - Life span of the encrypted content, measured in hours.
     * @param {Boolean} [maybePayLoad.dor=false] - Should the content be deleted after opening.
     *
     * @returns {Promise<ServerResponse<{payload:{locatorKey:string, encryptedText:string}}>>}
     */
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
                let initialKey = keyResponse.payload as string;
                let expandedKey = algorithm.expandKey(
                  initialKey,
                  message.length > 4096 ? 4096 : Math.max(2048, message.length)
                ) as string;

                return algorithm
                  .encryptText(message, expandedKey)
                  .then((encryptResponse: ServerResponse) => {
                    switch (encryptResponse.status) {
                      case ServerResponse.OK: {
                        let encryptResult = encryptResponse.payload;
                        let encryptedText =
                          encryptResult[EncryptionAlgorithm.ENCRYPTED_TEXT];
                        let expandedKey =
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
                                let packet = uploadResponse.payload;
                                return new ValidatePacket(sdk)
                                  .supplyAsync({
                                    [ValidatePacket.PACKET]: packet,
                                  })
                                  .then(
                                    (
                                      packetValidationResponse: ServerResponse
                                    ) => {
                                      switch (packetValidationResponse.status) {
                                        case ServerResponse.OK: {
                                          let locator =
                                            packetValidationResponse.payload;
                                          return new ServerResponse(
                                            ServerResponse.OK,
                                            200,
                                            {
                                              [Encrypt.LOCATOR_KEY]: locator,
                                              [Encrypt.ENCRYPTED_TEXT]:
                                                encryptedText,
                                            }
                                          );
                                        }
                                        case ServerResponse.ERROR: {
                                          console.error(
                                            `PacketValidation failed, code: ${packetValidationResponse.statusCode}, reason: ${packetValidationResponse.payload}`
                                          );
                                          return packetValidationResponse;
                                        }
                                      }
                                    }
                                  );
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

/** List of emails of users intended to have read access to the encrypted content*/
Encrypt.RECIPIENTS = "recipients";
/** Should the content be deleted after opening*/
Encrypt.DELETE_ON_RECEIPT = "dor";
/** Life span of the encrypted content*/
Encrypt.EXPIRES_HOURS = "expires";
/** Text to be encrypted.*/
Encrypt.TEXT = "text";

/** Token by which to fetch the encryption key from the serve*/
Encrypt.LOCATOR_KEY = "locatorKey";
/** Encrypted Text*/
Encrypt.ENCRYPTED_TEXT = "encryptedText";
