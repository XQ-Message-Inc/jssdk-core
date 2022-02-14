import EncryptionAlgorithm from "../algorithms/EncryptionAlgorithm";
import FetchKey from "./FetchKey";
import FetchQuantumEntropy from "../quantum/FetchQuantumEntropy";
import GeneratePacket from "./GeneratePacket";
import ServerResponse from "../ServerResponse";
import XQModule from "./XQModule";
import XQSDK from "../XQSDK";
import { CommunicationsEnum } from "../CommunicationsEnum";

interface IEncryptParams {
  recipients: string[];
  text: string;
  expires: number;
  dor?: boolean;
  locatorKey?: string;
  encryptionKey?: string;
  type?: CommunicationsEnum;
  meta?: Record<string, unknown>;
}

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
  static DELETE_ON_RECEIPT: "dor" = "dor";

  /** The field name representing the encrypted text */
  static ENCRYPTED_TEXT: "encryptedText" = "encryptedText";

  /** The field name representing the number of hours of life span until access to the encrypted text is expired */
  static EXPIRES_HOURS: "expires" = "expires";

  /** The field name representing the key used to fetch the encryption key from the server */
  static LOCATOR_KEY: "locatorKey" = "locatorKey";

  /** The field name representing a (optional) previously generated encryption key */
  static ENCRYPTION_KEY: "encryptionKey" = "encryptionKey";

  /** The field name representing the list of emails of users intended to have read access to the encrypted content */
  static RECIPIENTS: "recipients" = "recipients";

  /** The field name representing the text that will be encrypted */
  static TEXT: "text" = "text";

  /** The field name representing the type of communication that the user is encrypting (ex. File, Email, Chat, etc.) */
  static TYPE: "type" = "type";

  /** The field name representing the arbitrary metadata the user would like to attach to the log of the encrypted payload */
  static META: "meta" = "meta";

  /**
   * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
   * @param {[String]} maybePayLoad.recipients  - the list of emails of users intended to have read access to the encrypted content
   * @param {String} maybePayLoad.text - the text that will be encrypted
   * @param {Number} maybePayLoad.expires - the number of hours of life span until access to the encrypted text is expired
   * @param {Boolean} [maybePayLoad.dor=false] - an optional boolean value which specifies if the content should be deleted after opening
   * @param {String} maybePayLoad.locatorKey - an optional string value that may be used to utilize a pre-existing locator key
   * @param {String} maybePayLoad.encryptionKey - an optional string value that may be used to utilize a pre-existing encryption key
   * @param {String} maybePayLoad.type - an optional string value which specifies the type of communication the user is encrypting. Defaults to `unknown`
   * @param {Map} maybePayLoad.meta - an optional map value which can contain any arbitrary metadata the user wants
   *
   * @returns {Promise<ServerResponse<{payload:{locatorKey:string, encryptedText:string}}>>}
   */
  supplyAsync: (
    maybePayLoad: IEncryptParams
  ) => Promise<ServerResponse | undefined>;

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
        const deleteOnReceipt =
          maybePayLoad[Encrypt.DELETE_ON_RECEIPT] ?? false;

        const locatorKey = maybePayLoad[Encrypt.LOCATOR_KEY];
        const encryptionKey = maybePayLoad[Encrypt.ENCRYPTION_KEY];

        const type = maybePayLoad[Encrypt.TYPE] ?? CommunicationsEnum.UNKNOWN;
        const meta = maybePayLoad[Encrypt.META] ?? null;

        /**
         * A function utilized to take an encryption key and encrypt textual data.
         * @param expandedKey - the encryption key
         * @returns {locatorKey: string, encryptedText: string }
         */
        const encryptText = (expandedKey: string, skipKeyExpansion = false) => {
          return algorithm
            .encryptText(message, expandedKey, skipKeyExpansion)
            .then((encryptResponse: ServerResponse) => {
              switch (encryptResponse.status) {
                case ServerResponse.OK: {
                  const encryptResult = encryptResponse.payload;
                  const encryptedText =
                    encryptResult[EncryptionAlgorithm.ENCRYPTED_TEXT];
                  const expandedKey = encryptResult[EncryptionAlgorithm.KEY];

                  return new GeneratePacket(sdk)
                    .supplyAsync({
                      [GeneratePacket.KEY]: algorithm.prefix + expandedKey,
                      [GeneratePacket.RECIPIENTS]: recipients,
                      [GeneratePacket.EXPIRES_HOURS]: expiresHours,
                      [GeneratePacket.DELETE_ON_RECEIPT]: deleteOnReceipt
                        ? deleteOnReceipt
                        : false,
                      [GeneratePacket.TYPE]: type,
                      [GeneratePacket.META]: meta,
                    })
                    .then((uploadResponse: ServerResponse) => {
                      switch (uploadResponse.status) {
                        case ServerResponse.OK: {
                          const locator = uploadResponse.payload;
                          return new ServerResponse(ServerResponse.OK, 200, {
                            [Encrypt.LOCATOR_KEY]: locator,
                            [Encrypt.ENCRYPTED_TEXT]: encryptedText,
                          });
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
        };

        // allow the user to utilize a pre-existing locator key, if available
        if (locatorKey) {
          // allow the user to utilize a pre-existing encryption key, if available
          if (encryptionKey) {
            return encryptText(encryptionKey, true);
          }

          return new FetchKey(sdk)
            .supplyAsync({ locatorKey })
            .then((fetchKeyResponse: ServerResponse) => {
              const encryptionKey = fetchKeyResponse.payload;
              return encryptText(encryptionKey, true);
            });
        }

        // allow the user to utilize a pre-existing encryption key, if available
        if (encryptionKey) {
          return encryptText(encryptionKey, true);
        }

        return new FetchQuantumEntropy(sdk)
          .supplyAsync({ [FetchQuantumEntropy.KS]: FetchQuantumEntropy._256 })
          .then((keyResponse: ServerResponse) => {
            switch (keyResponse.status) {
              case ServerResponse.OK: {
                const initialKey = keyResponse.payload;

                const expandedKey = algorithm.expandKey(
                  initialKey,
                  message.length > 4096 ? 4096 : Math.max(2048, message.length)
                ) as string;

                return encryptText(expandedKey);
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
