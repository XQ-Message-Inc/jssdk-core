import { CommunicationsEnum } from "../CommunicationsEnum";

import EncryptionAlgorithm from "../algorithms/EncryptionAlgorithm";
import FetchKey from "./FetchKey";
import FetchQuantumEntropy from "../quantum/FetchQuantumEntropy";
import GeneratePacket from "./GeneratePacket";
import ServerResponse from "../ServerResponse";
import XQModule from "./XQModule";
import XQSDK from "../XQSDK";
import { XQServices } from "../XQServicesEnum";

import handleException from "../exceptions/handleException";

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
   * @param {Map} maybePayload - the container for the request parameters supplied to this method.
   * @param {[String]} maybePayload.recipients  - the list of emails of users intended to have read access to the encrypted content
   * @param {String} maybePayload.text - the text that will be encrypted
   * @param {Number} maybePayload.expires - the number of hours of life span until access to the encrypted text is expired
   * @param {Boolean} [maybePayload.dor=false] - an optional boolean value which specifies if the content should be deleted after opening
   * @param {String} maybePayload.locatorKey - an optional string value that may be used to utilize a pre-existing locator key
   * @param {String} maybePayload.encryptionKey - an optional string value that may be used to utilize a pre-existing encryption key
   * @param {String} maybePayload.type - an optional string value which specifies the type of communication the user is encrypting. Defaults to `unknown`
   * @param {Map} maybePayload.meta - an optional map value which can contain any arbitrary metadata the user wants
   *
   * @returns {Promise<ServerResponse<{payload:{locatorKey:string, encryptedText:string}}>>}
   */
  supplyAsync: (
    maybePayload: IEncryptParams
  ) => Promise<ServerResponse | undefined>;

  constructor(sdk: XQSDK, algorithm: EncryptionAlgorithm) {
    super(sdk);

    this.algorithm = algorithm;
    this.requiredFields = [
      Encrypt.RECIPIENTS,
      Encrypt.TEXT,
      Encrypt.EXPIRES_HOURS,
    ];

    this.supplyAsync = (maybePayload) => {
      try {
        this.sdk.validateInput(maybePayload, this.requiredFields);

        const sdk = this.sdk;
        const algorithm = this.algorithm;
        const message = maybePayload[Encrypt.TEXT];
        const recipients = maybePayload[Encrypt.RECIPIENTS];
        const expiresHours = maybePayload[Encrypt.EXPIRES_HOURS];
        const deleteOnReceipt =
          maybePayload[Encrypt.DELETE_ON_RECEIPT] ?? false;

        const locatorKey = maybePayload[Encrypt.LOCATOR_KEY];
        const encryptionKey = maybePayload[Encrypt.ENCRYPTION_KEY];

        const type = maybePayload[Encrypt.TYPE] ?? CommunicationsEnum.UNKNOWN;
        const meta = maybePayload[Encrypt.META] ?? null;

        /**
         * A function utilized to take an encryption key and encrypt textual data.
         * @param expandedKey - the encryption key
         * @returns {locatorKey: string, encryptedText: string }
         */
        const encryptText = (expandedKey: string, skipKeyExpansion = false) => {
          return algorithm
            .encryptText(message, expandedKey, skipKeyExpansion)
            .then((response: ServerResponse) => {
              switch (response.status) {
                case ServerResponse.OK: {
                  const encryptResult = response.payload;
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
                    .then((response: ServerResponse) => {
                      switch (response.status) {
                        case ServerResponse.OK: {
                          const locator = response.payload;
                          return new ServerResponse(ServerResponse.OK, 200, {
                            [Encrypt.LOCATOR_KEY]: locator,
                            [Encrypt.ENCRYPTED_TEXT]: encryptedText,
                          });
                        }
                        default: {
                          return handleException(response, XQServices.Encrypt);
                        }
                      }
                    });
                }
                case ServerResponse.ERROR: {
                  return handleException(response, XQServices.Encrypt);
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
          .then((response: ServerResponse) => {
            switch (response.status) {
              case ServerResponse.OK: {
                const initialKey = response.payload;

                const expandedKey = algorithm.expandKey(
                  initialKey,
                  message.length > 4096 ? 4096 : Math.max(2048, message.length)
                ) as string;

                return encryptText(expandedKey);
              }
              case ServerResponse.ERROR: {
                return handleException(response, XQServices.Encrypt);
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.Encrypt))
        );
      }
    };
  }
}
