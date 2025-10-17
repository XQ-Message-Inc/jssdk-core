import EncryptionAlgorithm from "../../../shared/algorithms/EncryptionAlgorithm";
import ServerResponse from "../../../shared/ServerResponse";
import handleException from "../../../shared/exceptions/handleException";
import { XQServices } from "../../../shared/XQServicesEnum";
import XQModule from "../../XQModule";
import XQSDKv3 from "../../XQSDKv3";
import FetchEntropy from "./FetchEntropy";
import AddPacket from "./AddPacket";

export interface IFileEncryptParams {
  sourceFile: File;
  recipients: string[] | string;
  expires: number;
  dor?: boolean;
  meta?: Record<string, unknown> | null;
}

/**
 * Encrypt files using the Delta API stack.
 */
export default class FileEncrypt extends XQModule {
  algorithm: EncryptionAlgorithm;
  requiredFields: string[];

  static SOURCE_FILE: "sourceFile" = "sourceFile";
  static RECIPIENTS: "recipients" = "recipients";
  static EXPIRES_HOURS: "expires" = "expires";
  static DELETE_ON_RECEIPT: "dor" = "dor";
  static META: "meta" = "meta";

  supplyAsync: (
    maybePayload: IFileEncryptParams
  ) => Promise<ServerResponse>;

  constructor(sdk: XQSDKv3, algorithm: EncryptionAlgorithm) {
    super(sdk);

    this.algorithm = algorithm;
    this.requiredFields = [
      FileEncrypt.SOURCE_FILE,
      FileEncrypt.RECIPIENTS,
      FileEncrypt.EXPIRES_HOURS,
    ];

    this.supplyAsync = (maybePayload) => {
      try {
        this.sdk.validateInput(
          maybePayload as unknown as Record<string, unknown>,
          this.requiredFields
        );

        const sourceFile = maybePayload[FileEncrypt.SOURCE_FILE];
        const recipients = this.normalizeRecipients(
          maybePayload[FileEncrypt.RECIPIENTS]
        );
        const expiresHours = maybePayload[FileEncrypt.EXPIRES_HOURS];
        const deleteOnReceipt = maybePayload[FileEncrypt.DELETE_ON_RECEIPT] ?? false;
        const meta = maybePayload[FileEncrypt.META] ?? null;

        return new FetchEntropy(this.sdk)
          .supplyAsync({ length: 32, type: "uint8" })
          .then((entropyResponse: ServerResponse) => {
            if (entropyResponse.status !== ServerResponse.OK) {
              return handleException(
                entropyResponse,
                XQServices.DeltaFileEncrypt
              ) as ServerResponse;
            }

            const entropyPayload = entropyResponse.payload as {
              data?: number[];
              value?: string;
            };
            const initialKey = this.coerceEntropyToKey(entropyPayload);

            const expandedKey = this.algorithm.expandKey(
              initialKey,
              sourceFile.size > 4096
                ? 4096
                : Math.max(2048, sourceFile.size)
            ) as string;

            return new AddPacket(this.sdk)
              .supplyAsync({
                [AddPacket.KEY]: this.algorithm.prefix + expandedKey,
                [AddPacket.RECIPIENTS]: recipients,
                [AddPacket.EXPIRES_HOURS]: expiresHours,
                [AddPacket.DELETE_ON_RECEIPT]: deleteOnReceipt,
                [AddPacket.TYPE]: "File",
                [AddPacket.META]: meta,
              })
              .then((packetResponse: ServerResponse) => {
                if (packetResponse.status !== ServerResponse.OK) {
                  return handleException(
                    packetResponse,
                    XQServices.DeltaFileEncrypt
                  ) as ServerResponse;
                }

                const locatorToken = packetResponse.payload as string;
                return this.algorithm.encryptFile(
                  sourceFile,
                  expandedKey,
                  locatorToken
                );
              });
          });
      } catch (exception) {
        return Promise.resolve(
          handleException(exception, XQServices.DeltaFileEncrypt)
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
