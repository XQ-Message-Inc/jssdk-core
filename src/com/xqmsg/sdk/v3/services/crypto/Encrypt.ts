import EncryptionAlgorithm from "../../../shared/algorithms/EncryptionAlgorithm";
import ServerResponse from "../../../shared/ServerResponse";
import handleException from "../../../shared/exceptions/handleException";
import { XQServices } from "../../../shared/XQServicesEnum";
import XQModule from "../../XQModule";
import XQSDKv3 from "../../XQSDKv3";
import FetchEntropy from "./FetchEntropy";
import AddPacket from "./AddPacket";
import LookupKey from "./LookupKey";

export interface IEncryptParams {
  recipients: string[] | string;
  text: string;
  expires: number;
  dor?: boolean;
  locatorKey?: string;
  encryptionKey?: string;
  type?: string;
  meta?: Record<string, unknown> | null;
}

/**
 * Encrypt textual content using the Delta API stack.
 */
export default class Encrypt extends XQModule {
  /** Encryption algorithm instance */
  algorithm: EncryptionAlgorithm;

  /** Required fields */
  requiredFields: string[];

  static DELETE_ON_RECEIPT: "dor" = "dor";
  static ENCRYPTED_TEXT: "encryptedText" = "encryptedText";
  static EXPIRES_HOURS: "expires" = "expires";
  static LOCATOR_KEY: "locatorKey" = "locatorKey";
  static ENCRYPTION_KEY: "encryptionKey" = "encryptionKey";
  static RECIPIENTS: "recipients" = "recipients";
  static TEXT: "text" = "text";
  static TYPE: "type" = "type";
  static META: "meta" = "meta";

  supplyAsync: (
    maybePayload: IEncryptParams
  ) => Promise<ServerResponse>;

  constructor(sdk: XQSDKv3, algorithm: EncryptionAlgorithm) {
    super(sdk);

    this.algorithm = algorithm;
    this.requiredFields = [
      Encrypt.RECIPIENTS,
      Encrypt.TEXT,
      Encrypt.EXPIRES_HOURS,
    ];

    this.supplyAsync = (maybePayload) => {
      try {
        this.sdk.validateInput(
          maybePayload as unknown as Record<string, unknown>,
          this.requiredFields
        );

        const message = maybePayload[Encrypt.TEXT];
        const recipients = this.normalizeRecipients(
          maybePayload[Encrypt.RECIPIENTS]
        );
        const expiresHours = maybePayload[Encrypt.EXPIRES_HOURS];
        const deleteOnReceipt = maybePayload[Encrypt.DELETE_ON_RECEIPT] ?? false;
        const providedLocatorKey = maybePayload[Encrypt.LOCATOR_KEY];
        const providedEncryptionKey = maybePayload[Encrypt.ENCRYPTION_KEY];
        const type = maybePayload[Encrypt.TYPE] ?? "unknown";
        const meta = maybePayload[Encrypt.META] ?? null;

        const encryptWithKey = (
          key: string,
          skipKeyExpansion = false
        ): Promise<ServerResponse> => {
          return this.algorithm
            .encryptText(message, key, skipKeyExpansion)
            .then((encryptionResponse: ServerResponse) => {
              if (encryptionResponse.status !== ServerResponse.OK) {
                return handleException(
                  encryptionResponse,
                  XQServices.DeltaEncrypt
                ) as ServerResponse;
              }

              const encryptedPayload = encryptionResponse.payload;
              const encryptedText =
                encryptedPayload[EncryptionAlgorithm.ENCRYPTED_TEXT];
              const expandedKey = encryptedPayload[EncryptionAlgorithm.KEY];

              return new AddPacket(this.sdk)
                .supplyAsync({
                  [AddPacket.KEY]: this.algorithm.prefix + expandedKey,
                  [AddPacket.RECIPIENTS]: recipients,
                  [AddPacket.EXPIRES_HOURS]: expiresHours,
                  [AddPacket.DELETE_ON_RECEIPT]: deleteOnReceipt,
                  [AddPacket.TYPE]: type,
                  [AddPacket.META]: meta,
                })
                .then((packetResponse: ServerResponse) => {
                  if (packetResponse.status !== ServerResponse.OK) {
                    return handleException(
                      packetResponse,
                      XQServices.DeltaEncrypt
                    ) as ServerResponse;
                  }

                  const locator = packetResponse.payload;
                  return new ServerResponse(ServerResponse.OK, 200, {
                    [Encrypt.LOCATOR_KEY]: locator,
                    [Encrypt.ENCRYPTED_TEXT]: encryptedText,
                  });
                });
            });
        };

        if (providedEncryptionKey) {
          return encryptWithKey(providedEncryptionKey, true);
        }

        if (providedLocatorKey) {
          return new LookupKey(this.sdk)
            .supplyAsync({ [LookupKey.TOKEN]: providedLocatorKey })
            .then((lookupResponse: ServerResponse) => {
              if (lookupResponse.status !== ServerResponse.OK) {
                return handleException(
                  lookupResponse,
                  XQServices.DeltaEncrypt
                ) as ServerResponse;
              }
              const key = lookupResponse.payload as string;
              return encryptWithKey(key, true);
            });
        }

        return new FetchEntropy(this.sdk)
          .supplyAsync({ length: 32, type: "uint8" })
          .then((entropyResponse: ServerResponse) => {
            if (entropyResponse.status !== ServerResponse.OK) {
              return handleException(
                entropyResponse,
                XQServices.DeltaEncrypt
              ) as ServerResponse;
            }

            const entropyPayload = entropyResponse.payload as {
              data?: number[];
              value?: string;
            };
            const initialKey = this.coerceEntropyToKey(entropyPayload);

            const expandedKey = this.algorithm.expandKey(
              initialKey,
              message.length > 4096
                ? 4096
                : Math.max(2048, message.length)
            ) as string;

            return encryptWithKey(expandedKey);
          });
      } catch (exception) {
        return Promise.resolve(
          handleException(exception, XQServices.DeltaEncrypt)
        );
      }
    };
  }

  private normalizeRecipients(recipients: string[] | string): string[] {
    if (Array.isArray(recipients)) {
      return recipients.map((entry) => entry.trim()).filter(Boolean);
    }

    return recipients
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  private coerceEntropyToKey(payload: unknown): string {
    if (!payload) {
      return "";
    }

    if (typeof payload === "string") {
      return payload;
    }

    if (
      typeof payload === "object" &&
      payload !== null &&
      Array.isArray((payload as { data?: unknown }).data)
    ) {
      const data = (payload as { data: number[] }).data;
      return data
        .map((value) => (value & 0xff).toString(16).padStart(2, "0"))
        .join("");
    }

    if (
      typeof payload === "object" &&
      payload !== null &&
      typeof (payload as { value?: unknown }).value === "string"
    ) {
      return (payload as { value: string }).value;
    }

    return String(payload);
  }
}
