/* eslint-disable @typescript-eslint/no-explicit-any */
import memoryCache from "memory-cache";

import CTREncryption from "../shared/algorithms/CTREncryption";
import EncryptionAlgorithm from "../shared/algorithms/EncryptionAlgorithm";
import GCMEncryption from "../shared/algorithms/GCMEncryption";
import NTVEncryption from "../shared/algorithms/NTVEncryption";
import OTPEncryption from "../shared/algorithms/OTPEncryption";
import CallMethod from "../shared/CallMethod";
import Destination from "../shared/Destination";
import ServerResponse from "../shared/ServerResponse";
import StatusException from "../shared/exceptions/StatusException";
import XQSimpleCache from "../shared/caching/XQSimpleCache";

const XMLHttpRequest = require("xhr2");

/**
 * The XQ SDK v3 for Delta API
 *
 * @class [XQSDKv3]
 */
export default class XQSDKv3 {
  /** The API Key for Delta API */
  DELTA_API_KEY: string;

  /** The Delta API server URL */
  DELTA_SERVER_URL: string;

  /** The cache instance for storing tokens and profiles */
  cache: XQSimpleCache;

  /** Identifier for the OTP algorithm */
  OTP_ALGORITHM: string;

  /** Identifier for the AES-GCM algorithm */
  GCM_ALGORITHM: string;

  /** Identifier for the AES-CTR algorithm */
  CTR_ALGORITHM: string;

  /** Identifier for the native algorithm */
  NTV_ALGORITHM: string;

  /** Default algorithm identifier */
  DEFAULT_ALGORITHM: string;

  /** Map of available encryption algorithms */
  ALGORITHMS: Record<string, EncryptionAlgorithm>;

  /** HTTP header name for API Key */
  static API_KEY: "Api-Key" = "Api-Key";

  /** HTTP header name for Access Control */
  static ACCESS_CONTROL_ALLOW_ORIGIN: "Access-Control-Allow-Origin" =
    "Access-Control-Allow-Origin";

  /** Wildcard value */
  static ANY: "*" = "*";

  /** HTTP header name for Content Type */
  static CONTENT_TYPE: "Content-Type" = "Content-Type";

  /** JSON content type value */
  static APPLICATION_JSON: "application/json" = "application/json";

  /** Function to make HTTP requests */
  makeRequest: (
    url: string,
    method: string,
    maybeService: string | null,
    maybeHeaderProperties: Record<string, string> | null,
    maybePayload: Record<string, any> | null,
    requiresAPIKey: boolean,
    destination: string
  ) => Promise<ServerResponse>;

  /** Function to make API calls */
  call: (
    baseUrl: string,
    maybeService: string | null,
    method: string,
    maybeHeaderProperties: Record<string, string> | null,
    maybePayload: Record<string, any> | null,
    requiresAPIKey: boolean,
    destination?: string
  ) => Promise<ServerResponse>;

  /** Function to build query parameters */
  buildQueryParams: (paramsObject: Record<string, string>) => string;

  /** Retrieve an encryption algorithm instance */
  getAlgorithm: (key: string) => EncryptionAlgorithm;

  /** Function to assert conditions */
  assert: (condition: boolean, message?: string) => void;

  /** Function to get the cache instance */
  getCache: () => XQSimpleCache;

  /** Function to validate input */
  validateInput: (
    maybeArgs: Record<string, any> | null,
    requiredFields: string[]
  ) => Record<string, any>;

  /** Function to validate and retrieve an access token */
  validateAccessToken: (destination?: string) => string;

  /**
   * @param {Object} config - Configuration object
   * @param {string} config.DELTA_API_KEY - The API key for Delta API
   * @param {string} [config.DELTA_SERVER_URL="https://delta.xqmsg.dev/v3"] - The Delta API server URL
   */
  constructor(config: {
    DELTA_API_KEY: string;
    DELTA_SERVER_URL?: string;
  }) {
    this.DELTA_API_KEY = config.DELTA_API_KEY;
    this.DELTA_SERVER_URL =
      config.DELTA_SERVER_URL || "https://delta.xqmsg.dev/v3";
    this.cache = new XQSimpleCache(memoryCache);

    this.OTP_ALGORITHM = "OTP";
    this.GCM_ALGORITHM = "GCM";
    this.CTR_ALGORITHM = "CTR";
    this.NTV_ALGORITHM = "NTV";
    this.DEFAULT_ALGORITHM = this.GCM_ALGORITHM;

    this.ALGORITHMS = {
      [this.OTP_ALGORITHM]: new OTPEncryption(this),
      [this.GCM_ALGORITHM]: new GCMEncryption(this),
      [this.CTR_ALGORITHM]: new CTREncryption(this),
      [this.NTV_ALGORITHM]: new NTVEncryption(this),
    };

    this.call = function (
      baseUrl,
      maybeService,
      method,
      maybeHeaderProperties,
      maybePayload,
      requiresAPIKey,
      destination = Destination.DELTA
    ) {
      this.assert(baseUrl != null, "baseUrl cannot be null");
      this.assert(method != null, "method cannot be null");

      if (
        maybePayload &&
        [CallMethod.POST, CallMethod.PATCH, CallMethod.OPTIONS].includes(method as any)
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
          xhttp.setRequestHeader(XQSDKv3.API_KEY, self.DELTA_API_KEY);
          xhttp.setRequestHeader(
            XQSDKv3.ACCESS_CONTROL_ALLOW_ORIGIN,
            XQSDKv3.ANY
          );
        }

        const headers: Record<string, string> = {
          ...(maybeHeaderProperties || {}),
        };

        if (destination === Destination.DELTA && !headers["X-Team-ID"]) {
          const activeProfile = self.cache.getActiveProfile(false);
          if (activeProfile) {
            const teamId = self.cache.getDeltaTeamId(activeProfile);
            if (teamId) {
              headers["X-Team-ID"] = teamId;
            }
          }
        }

        if (!headers[XQSDKv3.CONTENT_TYPE]) {
          headers[XQSDKv3.CONTENT_TYPE] = XQSDKv3.APPLICATION_JSON;
        }

        const headerEntries = Object.entries(headers);
        for (const [name, value] of headerEntries) {
          if (value != null) {
            xhttp.setRequestHeader(name, value);
          }
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
                  // Try to parse JSON response
                  try {
                    const dataMap = JSON.parse(responseString.replace(/\n/g, ""));
                    return resolve(
                      new ServerResponse(ServerResponse.OK, this.status, dataMap)
                    );
                  } catch (e) {
                    // If not JSON, return as plain text
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
              // Error response
              try {
                const errorData = JSON.parse(this.responseText);
                return resolve(
                  new ServerResponse(
                    ServerResponse.ERROR,
                    this.status,
                    errorData
                  )
                );
              } catch (e) {
                return resolve(
                  new ServerResponse(
                    ServerResponse.ERROR,
                    this.status,
                    this.statusText || "Request failed"
                  )
                );
              }
            }
          }
        };

        if (maybePayload && method !== CallMethod.GET) {
          xhttp.send(JSON.stringify(maybePayload));
        } else {
          xhttp.send();
        }
      });
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

    this.getAlgorithm = (key) => {
      const normalizedKey = key?.toUpperCase?.() ?? this.DEFAULT_ALGORITHM;
      return (
        this.ALGORITHMS[normalizedKey] ||
        this.ALGORITHMS[this.DEFAULT_ALGORITHM]
      );
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
        return maybeArgs || {};
      }
      if (maybeArgs == null) {
        throw "No arguments were provided";
      }
      const missingFields = [];

      for (var i = 0; i < requiredFields.length; i++) {
        const requiredField = requiredFields[i];
        const value = maybeArgs[requiredField];

        if (value == null) {
          missingFields.push(requiredField);
        }
      }

      if (missingFields.length > 0) {
        throw `The following required fields are missing: ${missingFields}`;
      }

      return maybeArgs;
    };

    this.validateAccessToken = (destination = Destination.DELTA) => {
      const activeProfile = this.cache.getActiveProfile(true);

      if (!activeProfile) {
        throw new StatusException(401, "No active profile found");
      }

      switch (destination) {
        case Destination.DELTA:
        default: {
          const token = this.cache.getDeltaAccess(activeProfile, true);
          if (!token) {
            throw new StatusException(
              401,
              `Access Token not found for ${activeProfile}`
            );
          }
          return token as string;
        }
      }
    };
  }
}
