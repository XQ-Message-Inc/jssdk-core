/* eslint-disable @typescript-eslint/indent */
/* eslint-disable no-redeclare */
import AESEncryption from "./algorithms/AESEncryption";
import CallMethod from "./CallMethod";
import Destination from "./Destination";
import EncryptionAlgorithm from "./algorithms/EncryptionAlgorithm";
import OTPv2Encryption from "./algorithms/OTPv2Encryption";
import ServerResponse from "./ServerResponse";
import StatusException from "./exceptions/StatusException";
import ValidationException from "./exceptions/ValidationException";
import XQSimpleCache from "./caching/XQSimpleCache";

import memoryCache from "memory-cache";

var XMLHttpRequest = require("xhr2");

const DASHBOARD_SERVER_URL = "https://dashboard.xqmsg.net/v2";
const KEY_SERVER_URL = "https://quantum.xqmsg.net/v2/";
const SUBSCRIPTION_SERVER_URL = "https://subscription.xqmsg.net/v2";
const VALIDATION_SERVER_URL = "https://validation.xqmsg.net/v2";

interface XQSDKProps {
  /** A string representing the AES encryption algorithm */
  AES_ALGORITHM: string;

  /** A object which contains encryption algorithm instances */
  ALGORITHMS: Record<string, OTPv2Encryption | AESEncryption>;

  /** A string representing the Dashboard API key*/
  DASHBOARD_API_KEY: string;

  /** A string representing the Dashboard server URL */
  DASHBOARD_SERVER_URL: string;

  /** A string representing the key server URL */
  KEY_SERVER_URL: string;

  /** A string representing the OTP encryption algorithm */
  OTPv2_ALGORITHM: string;

  /** A string representing the subscription server URL*/
  SUBSCRIPTION_SERVER_URL: string;

  /** A string representing the validation server URL*/
  VALIDATION_SERVER_URL: string;

  /** A string representing the XQ General API key */
  XQ_API_KEY: string;

  /** The XQ Cache */
  cache: XQSimpleCache;

  /**
   *
   * @param {boolean} condition
   * @param {String} message
   */
  assert: (condition: boolean, message: string) => void;

  /**
   * Wrapper method whose purpose is to construct the complete URL before it is passing its args to the underlying {@link makeRequest}
   * @param {String} baseUrl
   * @param {String} maybeService
   * @param {CallMethod#String} method
   * @param {{}}maybeHeaderProperties
   * @param {{}}maybePayload
   * @param {boolean}requiresAPIKey
   * @param {Destination}destination
   * @returns {Promise<ServerResponse<{}>>}
   */
  call: (
    baseUrl: string,
    maybeService: string,
    method: "POST" | "PATCH",
    maybeHeaderProperties: Record<string, string>,
    maybePayload: Record<string, string>,
    requiresAPIKey: boolean,
    destination?: string
  ) => Promise<unknown>;

  /**
   *
   * @param {{}} paramsObject
   * @returns {String} of query parameters
   */
  buildQueryParams: (paramsObject: Record<string, string>) => string;

  /**
   *
   * @param {XQSDK#String}key
   * @returns {OTPv2Encryption}
   */
  getAlgorithm: (key: string) => EncryptionAlgorithm;

  /**
   * @return SimpleXQCache
   */
  getCache: () => XQSimpleCache;

  /**
   * Core communication with the server happens here, via {@link XMLHttpRequest}.
   * @param {String} url
   * @param {CallMethod#String} method
   * @param {String} maybeService
   * @param {{}} maybeHeaderProperties
   * @param {{}} maybePayload
   * @param {boolean} requiresAPIKey
   * @param {Destination}destination
   * @returns {Promise<ServerResponse<{}>>}
   */
  makeRequest: (
    url: string,
    method: "POST" | "PATCH",
    maybeService: string,
    maybeHeaderProperties: Record<string, string>,
    maybePayload: Record<string, string>,
    requiresAPIKey: boolean,
    destination: string
  ) => Promise<unknown>;

  /**
   *
   * @param {Destination}destination
   * @returns {string}
   */
  validateAccessToken: (destination?: string) => StatusException | string;

  /**
   * @method validateInput
   * @param {Map} maybeArgs - The arguments supplied to this service
   * @param {[String]} requiredFields - The necessary fields to be supplied for this service to function
   * @throws Required Field Exception
   * @returns {Map} validated arguments
   */
  validateInput: (
    maybeArgs: Record<string, string>,
    requiredFields: string[]
  ) => Record<string, string>;

  validatePreAuthToken: () => string;
}

interface XQSDK extends XQSDKProps {}

/**
 * @class [XQSDK]
 */
class XQSDK {
  /** A field name representing the Access-Control-Allow-Origin request header */
  static ACCESS_CONTROL_ALLOW_ORIGIN: "Access-Control-Allow-Origin" =
    "Access-Control-Allow-Origin";

  /** A field name representing the any (wildcard) request header */
  static ANY: "*" = "*";

  /** A field name representing the api-key request header */
  static API_KEY: "api-key" = "api-key";

  /** A field name representing the application/json request header */
  static APPLICATION_JSON: "application/json" = "application/json";

  /** A field name representing the content-type request header */
  static CONTENT_TYPE: "content-type" = "content-type";

  static TEXT_PLAIN_UTF_8: "text/plain;charset=UTF-8" =
    "text/plain;charset=UTF-8";

  constructor(
    credentials: { XQ_API_KEY: string; DASHBOARD_API_KEY: string },
    serverConfig?: {
      DASHBOARD_SERVER_URL?: string;
      KEY_SERVER_URL?: string;
      SUBSCRIPTION_SERVER_URL?: string;
      VALIDATION_SERVER_URL?: string;
    }
  ) {
    /** The required API keys to utilize XQ Services */
    const credentialConfiguration = {
      XQ_API_KEY: credentials.XQ_API_KEY,
      DASHBOARD_API_KEY: credentials.DASHBOARD_API_KEY,
    };

    /** The parameterized server URLs */
    const serverConfiguration = {
      SUBSCRIPTION_SERVER_URL:
        serverConfig?.SUBSCRIPTION_SERVER_URL || SUBSCRIPTION_SERVER_URL,
      DASHBOARD_SERVER_URL:
        serverConfig?.DASHBOARD_SERVER_URL || DASHBOARD_SERVER_URL,
      KEY_SERVER_URL: serverConfig?.KEY_SERVER_URL || KEY_SERVER_URL,
      VALIDATION_SERVER_URL:
        serverConfig?.VALIDATION_SERVER_URL || VALIDATION_SERVER_URL,
    };

    const config = {
      application: {
        ...credentialConfiguration,
        ...serverConfiguration,
      },
    };

    this.XQ_API_KEY = config.application.XQ_API_KEY;
    this.DASHBOARD_API_KEY = config.application.DASHBOARD_API_KEY;

    this.cache = new XQSimpleCache(memoryCache);
    this.OTPv2_ALGORITHM = "OTPv2";
    this.AES_ALGORITHM = "AES";

    this.SUBSCRIPTION_SERVER_URL = config.application.SUBSCRIPTION_SERVER_URL;
    this.DASHBOARD_SERVER_URL = config.application.DASHBOARD_SERVER_URL;
    this.VALIDATION_SERVER_URL = config.application.VALIDATION_SERVER_URL;
    this.KEY_SERVER_URL = config.application.KEY_SERVER_URL;

    this.ALGORITHMS = {};
    this.ALGORITHMS[this.OTPv2_ALGORITHM] = new OTPv2Encryption(this);
    this.ALGORITHMS[this.AES_ALGORITHM] = new AESEncryption(this);

    this.call = function (
      baseUrl,
      maybeService,
      method,
      maybeHeaderProperties,
      maybePayload,
      requiresAPIKey,
      destination = Destination.XQ
    ) {
      this.assert(baseUrl != null, "baseUrl cannot be null");
      this.assert(method != null, "method cannot be null");

      if (
        maybePayload &&
        [CallMethod.POST, CallMethod.PATCH, CallMethod.OPTIONS].includes(method)
      ) {
        const URL = baseUrl + (maybeService ? "/" + maybeService : "");

        return this.makeRequest(
          URL,
          method,
          maybeService,
          maybeHeaderProperties,
          maybePayload,
          requiresAPIKey,
          destination
        );
      } else {
        var URL =
          baseUrl +
          (maybeService ? "/" + maybeService : "") +
          (maybePayload ? "?" + this.buildQueryParams(maybePayload) : "");

        return this.makeRequest(
          URL,
          method,
          maybeService,
          maybeHeaderProperties,
          maybePayload,
          requiresAPIKey,
          destination
        );
      }
    };

    this.makeRequest = (
      url,
      method,
      maybeService,
      maybeHeaderProperties,
      maybePayload,
      requiresAPIKey,
      destination
    ) => {
      const self = this;

      return new Promise((resolve) => {
        const xhttp = new XMLHttpRequest();
        const ASYNC = true;
        xhttp.open(method, url, ASYNC);
        xhttp.timeout = 60000;
        if (requiresAPIKey) {
          switch (destination) {
            case Destination.XQ: {
              xhttp.setRequestHeader(XQSDK.API_KEY, self.XQ_API_KEY);
              xhttp.setRequestHeader(
                XQSDK.ACCESS_CONTROL_ALLOW_ORIGIN,
                XQSDK.ANY
              );
              break;
            }
            case Destination.DASHBOARD: {
              xhttp.setRequestHeader(XQSDK.API_KEY, self.DASHBOARD_API_KEY);
              xhttp.setRequestHeader(
                XQSDK.ACCESS_CONTROL_ALLOW_ORIGIN,
                XQSDK.ANY
              );
              break;
            }
          }
        }
        if (maybeHeaderProperties) {
          const entries = Object.entries(maybeHeaderProperties);
          for (const [name, value] of entries) {
            xhttp.setRequestHeader(name, value as string);
          }
          if (!maybeHeaderProperties[XQSDK.CONTENT_TYPE]) {
            xhttp.setRequestHeader(XQSDK.CONTENT_TYPE, XQSDK.APPLICATION_JSON);
          }
        } else {
          xhttp.setRequestHeader(XQSDK.CONTENT_TYPE, XQSDK.APPLICATION_JSON);
        }
        xhttp.ontimeout = function () {
          resolve(
            new ServerResponse(
              ServerResponse.ERROR,
              this.status,
              this.statusText
            )
          );
        };
        xhttp.onerror = function () {
          resolve(
            new ServerResponse(
              ServerResponse.ERROR,
              this.status,
              this.statusText
            )
          );
        };
        xhttp.onreadystatechange = function () {
          if (this.readyState == 4) {
            if (this.status >= 200 && this.status <= 299) {
              const responseString = this.responseText;
              switch (responseString) {
                case "":
                  return resolve(
                    new ServerResponse(
                      ServerResponse.OK,
                      this.status,
                      "No Content"
                    )
                  );
                default: {
                  if (responseString.includes("status")) {
                    let dataMap = null;
                    try {
                      dataMap = JSON.parse(responseString.replace(/\n/g, ""));
                    } catch (e) {
                      return resolve(
                        new ServerResponse(
                          ServerResponse.ERROR,
                          this.status,
                          e.errorText
                        )
                      );
                    }
                    return resolve(
                      new ServerResponse(
                        ServerResponse.OK,
                        this.status,
                        dataMap
                      )
                    );
                  } else {
                    return resolve(
                      new ServerResponse(
                        ServerResponse.OK,
                        this.status,
                        responseString
                      )
                    );
                  }
                }
              }
            } else {
              return resolve(
                new ServerResponse(
                  ServerResponse.ERROR,
                  this.status,
                  this.responseText
                )
              );
            }
          }
        };
        if (
          maybePayload &&
          [CallMethod.POST, CallMethod.PATCH, CallMethod.DELETE].includes(
            method
          )
        ) {
          if (
            maybeHeaderProperties != null &&
            maybeHeaderProperties[XQSDK.CONTENT_TYPE] == XQSDK.TEXT_PLAIN_UTF_8
          ) {
            var plainTextData = maybePayload["data"];
            xhttp.send(plainTextData);
          } else {
            var jsonData = JSON.stringify(maybePayload);
            xhttp.send(jsonData);
          }
        } else {
          xhttp.send();
        }
      });
    };

    this.getAlgorithm = (key) => {
      return this.ALGORITHMS[key];
    };

    this.buildQueryParams = (paramsObject: Record<string, string>) => {
      var i = 1;
      var buffer = "";
      const entries = Object.entries(paramsObject);
      for (const [name, value] of entries) {
        buffer += name + "=" + encodeURIComponent(value);
        if (i < entries.length) {
          buffer += "&";
          i++;
        }
      }
      return buffer;
    };

    this.assert = (condition, message) => {
      if (!condition) {
        const msg = message || "Assertion failed";
        console.info(msg);
        throw msg;
      }
    };

    this.getCache = () => {
      return this.cache;
    };

    this.validateInput = (maybeArgs, requiredFields) => {
      if (requiredFields.length == 0) {
        return maybeArgs;
      }
      if (maybeArgs == null) {
        throw new ValidationException(
          500,
          `Missing input parameters: [${requiredFields}]`
        );
      }
      const input = Object.getOwnPropertyNames(maybeArgs);

      const missing = requiredFields.filter((m) => {
        return !input.includes(m);
      });

      if (missing.length > 0) {
        const msg = "missing [" + missing + "] !";
        console.error(msg);
        throw msg;
      }
      return maybeArgs;
    };

    this.validatePreAuthToken = () => {
      // Ensure that there is an active profile.
      const activeProfile = this.cache.getActiveProfile(true);

      if (activeProfile == null) {
        throw new StatusException(401, `No active profile found`);
      }

      const preAuthToken = this.cache.getXQPreAuthToken(activeProfile);
      if (preAuthToken == null) {
        throw new StatusException(
          401,
          `Pre-authorization token not found for ${activeProfile}`
        );
      }
      return preAuthToken;
    };

    this.validateAccessToken = (destination = Destination.XQ) => {
      // Ensure that there is an active profile.
      const activeProfile = this.cache.getActiveProfile(true);
      let accessToken = null;

      if (activeProfile == null) {
        throw new StatusException(401, `No active profile found`);
      }

      switch (destination) {
        case Destination.XQ: {
          accessToken = this.cache.getXQAccess(activeProfile, true);
          break;
        }
        case Destination.DASHBOARD: {
          accessToken = this.cache.getDashboardAccess(activeProfile, true);
          break;
        }
      }
      if (accessToken == null) {
        throw new StatusException(
          401,
          `Access Token not found for ${activeProfile}`
        );
      }
      return accessToken;
    };
  }
}

export default XQSDK;
