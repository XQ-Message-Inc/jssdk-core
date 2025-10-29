import EncryptionAlgorithm from "../../../shared/algorithms/EncryptionAlgorithm";
import ServerResponse from "../../../shared/ServerResponse";
import handleException from "../../../shared/exceptions/handleException";
import { XQServices } from "../../../shared/XQServicesEnum";
import XQModule from "../../XQModule";
import XQSDKv3 from "../../XQSDKv3";
import LookupKey from "./LookupKey";

export interface IDecryptParams {
  locatorKey: string;
  encryptedText: string;
}

/**
 * Decrypt textual content using the Delta API stack.
 */
export default class Decrypt extends XQModule {
  algorithm: EncryptionAlgorithm;
  requiredFields: string[];

  static ENCRYPTED_TEXT: "encryptedText" = "encryptedText";
  static LOCATOR_KEY: "locatorKey" = "locatorKey";

  supplyAsync: (
    maybePayload: IDecryptParams
  ) => Promise<ServerResponse>;

  constructor(sdk: XQSDKv3, algorithm: EncryptionAlgorithm) {
    super(sdk);

    this.algorithm = algorithm;
    this.requiredFields = [Decrypt.LOCATOR_KEY, Decrypt.ENCRYPTED_TEXT];

    this.supplyAsync = (maybePayload) => {
      try {
        this.sdk.validateInput(
          maybePayload as unknown as Record<string, unknown>,
          this.requiredFields
        );

        const locatorKey = maybePayload[Decrypt.LOCATOR_KEY];
        const encryptedText = maybePayload[Decrypt.ENCRYPTED_TEXT];

        return new LookupKey(this.sdk)
          .supplyAsync({ [LookupKey.TOKEN]: locatorKey })
          .then((lookupResponse: ServerResponse) => {
            if (lookupResponse.status !== ServerResponse.OK) {
              return handleException(
                lookupResponse,
                XQServices.DeltaDecrypt
              ) as ServerResponse;
            }

            const encryptionKey = lookupResponse.payload as string;
            return this.algorithm
              .decryptText(encryptedText, encryptionKey)
              .then((decryptResponse: ServerResponse) => {
                if (decryptResponse.status === ServerResponse.OK) {
                  return decryptResponse;
                }

                return handleException(
                  decryptResponse,
                  XQServices.DeltaDecrypt
                ) as ServerResponse;
              });
          });
      } catch (exception) {
        return Promise.resolve(
          handleException(exception, XQServices.DeltaDecrypt)
        );
      }
    };
  }
}
