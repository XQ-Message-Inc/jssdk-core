/* eslint-disable @typescript-eslint/no-explicit-any */
import ServerResponse from "../ServerResponse";
import XQSDK from "../XQSDK";

export type SupplyAsync = (
  maybePayLoad: Record<string, string>
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
        const msg = message || "Assertion failed";
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
