import ServerResponse from "../../../shared/ServerResponse";
import handleException from "../../../shared/exceptions/handleException";
import { XQServices } from "../../../shared/XQServicesEnum";
import XQModule from "../../XQModule";
import XQSDKv3 from "../../XQSDKv3";
import EncryptionAlgorithm from "../../../shared/algorithms/EncryptionAlgorithm";
import LookupKey from "./LookupKey";

export interface IFileDecryptParams {
  sourceFile: File;
}

/**
 * Decrypt files using the Delta API stack.
 */
export default class FileDecrypt extends XQModule {
  algorithm: EncryptionAlgorithm;
  requiredFields: string[];

  static SOURCE_FILE: "sourceFile" = "sourceFile";

  supplyAsync: (
    maybePayload: IFileDecryptParams
  ) => Promise<ServerResponse>;

  constructor(sdk: XQSDKv3, algorithm: EncryptionAlgorithm) {
    super(sdk);

    this.algorithm = algorithm;
    this.requiredFields = [FileDecrypt.SOURCE_FILE];

    this.supplyAsync = (maybePayload) => {
      try {
        this.sdk.validateInput(
          maybePayload as unknown as Record<string, unknown>,
          this.requiredFields
        );

        const sourceFile = maybePayload[FileDecrypt.SOURCE_FILE];

        return this.algorithm.decryptFile(sourceFile, (token: string) =>
          new LookupKey(this.sdk)
            .supplyAsync({ [LookupKey.TOKEN]: token })
            .then((lookupResponse: ServerResponse) => {
              if (lookupResponse.status !== ServerResponse.OK) {
                const handled = handleException(
                  lookupResponse,
                  XQServices.DeltaFileDecrypt
                ) as ServerResponse;
                throw handled;
              }

              return lookupResponse.payload as string;
            })
        );
      } catch (exception) {
        return Promise.resolve(
          handleException(exception, XQServices.DeltaFileDecrypt)
        );
      }
    };
  }
}
