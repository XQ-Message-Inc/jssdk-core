/* eslint-disable @typescript-eslint/indent */
/* eslint-disable no-redeclare */
import CTREncryption from "./algorithms/CTREncryption";
import CallMethod from "./CallMethod";
import EncryptionAlgorithm from "./algorithms/EncryptionAlgorithm";
import GCMEncryption from "./algorithms/GCMEncryption";
import NTVEncryption from "./algorithms/NTVEncryption";
import OTPEncryption from "./algorithms/OTPEncryption";
import ServerResponse from "./ServerResponse";
import StatusException from "./exceptions/StatusException";
import ValidationException from "./exceptions/ValidationException";
import XQSimpleCache from "./caching/XQSimpleCache";

import handleException from "./exceptions/handleException";

import memoryCache from "memory-cache";

var XMLHttpRequest = require("xhr2");

const DELTA_SERVER_URL = "https://delta.xqmsg.net/v3";

interface XQSDKProps {
  /** A string representing the AES 256 GCM encryption algorithm */
  GCM_ALGORITHM: string;

  /** A string representing the AES 256 CTR encryption algorithm */
  CTR_ALGORITHM: string;

  /** A string representing the Natively produced AES encryption algorithm */
  NTV_ALGORITHM: string;

  /** A object which contains encryption algorithm instances */
  ALGORITHMS: Record<
    string,
    OTPEncryption | CTREncryption | GCMEncryption | NTVEncryption
  >;

  /** A string representing the OTP encryption algorithm */
  OTP_ALGORITHM: string;

  /** A string representing the Delta server URL */
  DELTA_SERVER_URL: string;

  /** A string representing the API key */
  API_KEY: string;

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
   * @param {String} maybeService
   * @param {CallMethod#String} method
   * @param {{}}maybeHeaderProperties
   * @param {{}}maybePayload
   * @param {boolean}requiresAPIKey
   * @returns {Promise<ServerResponse<{}>>}
   */
  call: (
    maybeService: string,
    method: "POST" | "PATCH",
    maybeHeaderProperties: Record<string, string>,
    maybePayload: Record<string, string>,
    requiresAPIKey: boolean,
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
   * @returns {OTPEncryption}
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
   * @returns {Promise<ServerResponse<{}>>}
   */
  makeRequest: (
    url: string,
    method: "POST" | "PATCH",
    maybeService: string,
    maybeHeaderProperties: Record<string, string>,
    maybePayload: Record<string, string>,
    requiresAPIKey: boolean,
  ) => Promise<unknown>;

  /**
   * @returns {string}
   */
  validateAccessToken: () => StatusException | string;

  /**
   * @method validateInput
   * @param {Map} maybeArgs - The arguments supplied to this service
   * @param {[String]} requiredFields - The necessary fields to be supplied for this service to function
   * @throws Required Field Exception
   * @returns {Map} validated arguments
   */
  validateInput: (
    maybeArgs: Record<string, string>,
    requiredFields: string[],
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

  /** A field name representing the Api-Key request header */
  static API_KEY_HEADER: "Api-Key" = "Api-Key";

  /** A field name representing the X-Team-ID request header */
  static TEAM_ID_HEADER: "X-Team-ID" = "X-Team-ID";

  /** A field name representing the application/json request header */
  static APPLICATION_JSON: "application/json" = "application/json";

  /** A field name representing the content-type request header */
  static CONTENT_TYPE: "content-type" = "content-type";

  static TEXT_PLAIN_UTF_8: "text/plain;charset=UTF-8" =
    "text/plain;charset=UTF-8";

  constructor(
    credentials: { API_KEY: string },
    serverConfig?: {
      DELTA_SERVER_URL?: string;
    },
  ) {
    this.API_KEY = credentials.API_KEY;
    this.DELTA_SERVER_URL = serverConfig?.DELTA_SERVER_URL || DELTA_SERVER_URL;

    this.cache = new XQSimpleCache(memoryCache);
    this.OTP_ALGORITHM = "OTP";
    this.GCM_ALGORITHM = "GCM";
    this.CTR_ALGORITHM = "CTR";
    this.NTV_ALGORITHM = "NTV";

    this.ALGORITHMS = {};
    this.ALGORITHMS[this.OTP_ALGORITHM] = new OTPEncryption(this);
    this.ALGORITHMS[this.GCM_ALGORITHM] = new GCMEncryption(this);
    this.ALGORITHMS[this.CTR_ALGORITHM] = new CTREncryption(this);
    this.ALGORITHMS[this.NTV_ALGORITHM] = new NTVEncryption(this);

    this.call = function (
      maybeService,
      method,
      maybeHeaderProperties,
      maybePayload,
      requiresAPIKey,
    ) {
      this.assert(method != null, "method cannot be null");

      const baseUrl = this.DELTA_SERVER_URL;

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
    ) => {
      const self = this;

      return new Promise((resolve) => {
        const xhttp = new XMLHttpRequest();
        const ASYNC = true;
        xhttp.open(method, url, ASYNC);
        xhttp.timeout = 60000;
        if (requiresAPIKey) {
          xhttp.setRequestHeader(XQSDK.API_KEY_HEADER, self.API_KEY);
          xhttp.setRequestHeader(XQSDK.ACCESS_CONTROL_ALLOW_ORIGIN, XQSDK.ANY);
          // Add X-Team-ID header if team ID is set in cache
          const teamId = self.cache.getTeamId();
          if (teamId) {
            xhttp.setRequestHeader(XQSDK.TEAM_ID_HEADER, teamId);
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
              this.statusText,
            ),
          );
        };
        xhttp.onerror = function () {
          resolve(
            new ServerResponse(
              ServerResponse.ERROR,
              this.status,
              this.statusText,
            ),
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
                      "No Content",
                    ),
                  );
                default: {
                  if (responseString.includes("status")) {
                    let dataMap = null;
                    try {
                      dataMap = JSON.parse(responseString.replace(/\n/g, ""));
                    } catch (e) {
                      return new Promise((resolve) =>
                        resolve(handleException(e)),
                      );
                    }
                    return resolve(
                      new ServerResponse(
                        ServerResponse.OK,
                        this.status,
                        dataMap,
                      ),
                    );
                  } else {
                    return resolve(
                      new ServerResponse(
                        ServerResponse.OK,
                        this.status,
                        responseString,
                      ),
                    );
                  }
                }
              }
            } else {
              return resolve(
                new ServerResponse(
                  ServerResponse.ERROR,
                  this.status,
                  this.responseText,
                ),
              );
            }
          }
        };
        if (
          maybePayload &&
          [CallMethod.POST, CallMethod.PATCH, CallMethod.DELETE].includes(
            method,
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
          `Missing input parameters: [${requiredFields}]`,
        );
      }
      const input = Object.getOwnPropertyNames(maybeArgs);

      const missing = requiredFields.filter((m) => {
        return !input.includes(m);
      });

      if (missing.length > 0) {
        const msg = "missing [" + missing + "] !";
        console.error(msg);
        throw new ValidationException(
          500,
          `Missing input parameters: [${missing}]`,
        );
      }
      return maybeArgs;
    };

    this.validatePreAuthToken = () => {
      const preAuthToken = this.cache.getXQPreAuthToken();

      if (!preAuthToken) {
        throw new StatusException(401, `Pre-authorization token not found`);
      }

      return preAuthToken;
    };

    this.validateAccessToken = () => {
      // Ensure that there is an active profile.
      const activeProfile = this.cache.getActiveProfile(true);

      if (activeProfile == null) {
        throw new StatusException(401, `No active profile found`);
      }

      const accessToken = this.cache.getXQAccess(activeProfile, true);
      if (accessToken == null) {
        throw new StatusException(
          401,
          `Access Token not found for ${activeProfile}`,
        );
      }
      return accessToken;
    };
  }
}

export default XQSDK;
