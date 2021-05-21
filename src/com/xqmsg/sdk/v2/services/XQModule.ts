import ServerResponse from "../ServerResponse";
import StatusException from "../exceptions/StatusException";
import ValidationException from "../exceptions/ValidationException";
import XQSDK from "../XQSDK";

export type SupplyAsync = (
  maybePayLoad: Record<string, any>
) => Promise<ServerResponse>;

/**
 * @class [XQModule]
 */
export default class XQModule {
  sdk: any;
  cache: any;
  assert: (condition: boolean, message: string) => void;
  getCache: () => any;

  constructor(sdk: XQSDK) {
    this.sdk = sdk;
    this.cache = sdk.getCache();

    this.assert = (condition, message) => {
      if (!condition) {
        let msg = message || "Assertion failed";
        console.info(msg);
        throw msg;
      }
    };

    /**
     * @return SimpleXQCache
     */
    this.getCache = () => {
      return this.cache;
    };
  }
}
