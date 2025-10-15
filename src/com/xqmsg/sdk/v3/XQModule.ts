import XQSDKv3 from "./XQSDKv3";
import XQSimpleCache from "../shared/caching/XQSimpleCache";

/**
 * Base class for all v3 service modules
 *
 * @class [XQModule]
 */
export default class XQModule {
  /** The XQ SDK v3 instance */
  sdk: XQSDKv3;

  /** The cache instance */
  cache: XQSimpleCache;

  /**
   * @param {XQSDKv3} sdk - The XQ SDK v3 instance
   */
  constructor(sdk: XQSDKv3) {
    this.sdk = sdk;
    this.cache = sdk.cache;
  }
}
