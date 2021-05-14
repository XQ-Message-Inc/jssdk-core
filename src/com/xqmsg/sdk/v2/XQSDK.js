import SimpleXQCache from './caching/XQSimpleCache.js';
import OTPv2Encryption from './algorithms/OTPv2Encryption.js';
import AESEncryption from './algorithms/AESEncryption.js';
import ServerResponse from './ServerResponse.js';
import CallMethod from "./CallMethod.js";
import Destination from "./Destination.js";
import ValidationException from "./exceptions/ValidationException.js";
import StatusException from "./exceptions/StatusException.js";
import Config from "./Config.js";

/**
 * @class [XQSDK]
 */
export default class XQSDK {

    constructor() {

        let config = new Config();

        this.XQ_API_KEY = config.application.XQ_API_KEY;
        this.DASHBOARD_API_KEY = config.application.DASHBOARD_API_KEY;

        this.cache = new SimpleXQCache(localStorage);
        this.OTPv2_ALGORITHM = "OTPV2";
        this.AES_ALGORITHM = "AES";

        this.SUBSCRIPTION_SERVER_URL = config.application.SUBSCRIPTION_SERVER_URL;
        this.DASHBOARD_SERVER_URL = config.application.DASHBOARD_SERVER_URL;
        this.VALIDATION_SERVER_URL = config.application.VALIDATION_SERVER_URL;
        this.KEY_SERVER_URL = config.application.KEY_SERVER_URL;

        this.ALGORITHMS={};
        this.ALGORITHMS[this.OTPv2_ALGORITHM]=new OTPv2Encryption(this);
        this.ALGORITHMS[this.AES_ALGORITHM]=new AESEncryption(this);


    }

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
    call = function (baseUrl, maybeService, method, maybeHeaderProperties, maybePayload, requiresAPIKey, destination= Destination.prototype.XQ) {

        this.assert(baseUrl != null, "baseUrl cannot be null");
        this.assert(method != null, "method cannot be null");

        if (maybePayload && [CallMethod.prototype.POST, CallMethod.prototype.PATCH,  CallMethod.prototype.OPTIONS].includes(method)) {

            const URL = baseUrl + (maybeService ? "/" + maybeService : "");

            return this.makeRequest(URL, method, maybeService, maybeHeaderProperties, maybePayload, requiresAPIKey, destination);
        } else {

            var URL = baseUrl +
                (maybeService ? "/" + maybeService : "") +
                (maybePayload ? "?" + this.buildQeryParams(maybePayload) : "");

            return this.makeRequest(URL, method, maybeService, maybeHeaderProperties, maybePayload, requiresAPIKey, destination);
        }
    }

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
    makeRequest = function (url, method, maybeService, maybeHeaderProperties, maybePayload, requiresAPIKey, destination) {

        let self = this;

        return new Promise(function (resolve, reject) {
            const xhttp = new XMLHttpRequest();
            const ASYNC = true
            xhttp.open(method, url, ASYNC);
            xhttp.timeout = 60000;
            if (requiresAPIKey) {
                switch (destination) {
                    case Destination.prototype.XQ:{
                        xhttp.setRequestHeader(self.API_KEY, self.XQ_API_KEY);
                        xhttp.setRequestHeader(self.ACCESS_CONTROL_ALLOW_ORIGIN, self.ANY);
                        break;
                    }
                    case Destination.prototype.DASHBOARD:{
                        xhttp.setRequestHeader(self.API_KEY, self.DASHBOARD_API_KEY);
                        xhttp.setRequestHeader(self.ACCESS_CONTROL_ALLOW_ORIGIN, self.ANY);
                        break;
                    }
                }
            }
            if (maybeHeaderProperties) {
                const entries = Object.entries(maybeHeaderProperties);
                for (let [name, value] of entries) {
                    xhttp.setRequestHeader(name, value);
                }
                if (!maybeHeaderProperties[self.CONTENT_TYPE]) {
                    xhttp.setRequestHeader(self.CONTENT_TYPE, self.APPLICATION_JSON);
                }
            } else {
                xhttp.setRequestHeader(self.CONTENT_TYPE, self.APPLICATION_JSON);
            }
            xhttp.ontimeout = function (e) {
                resolve(new ServerResponse(
                    ServerResponse.prototype.ERROR,
                    this.status,
                    this.statusText
                ));
            };
            xhttp.onerror = function (e) {
                resolve(new ServerResponse(
                    ServerResponse.prototype.ERROR,
                    this.status,
                    this.statusText));
            };
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4) {
                    if (this.status >= 200 && this.status <= 299) {

                        let responseString = this.responseText;
                        switch (responseString) {
                            case "":
                                return resolve(new ServerResponse(
                                    ServerResponse.prototype.OK,
                                    this.status,
                                    "No Content"
                                ));
                            default: {
                                if (responseString.includes("status")) {
                                    let dataMap = null;
                                    try {
                                        dataMap = JSON.parse(responseString.replace(/\n/g, ''));
                                    } catch (e) {
                                        return resolve(new ServerResponse(
                                            ServerResponse.prototype.ERROR,
                                            this.status,
                                            e.errorText
                                       ));
                                    }
                                    return resolve(new ServerResponse(
                                        ServerResponse.prototype.OK,
                                        this.status,
                                        dataMap
                                    ));
                                } else {
                                    return resolve(new ServerResponse(
                                        ServerResponse.prototype.OK,
                                        this.status,
                                        responseString
                                    ));
                                }
                            }
                        }

                } else {
                        return resolve(new ServerResponse(
                            ServerResponse.prototype.ERROR,
                            this.status,
                            this.responseText
                    ));
                }
            }
        };
        if (maybePayload && [CallMethod.prototype.POST, CallMethod.prototype.PATCH].includes(method)) {
            if (maybeHeaderProperties != null && maybeHeaderProperties[self.CONTENT_TYPE] == self.TEXT_PLAIN_UTF_8) {
                var plainTextData = maybePayload["data"];
                xhttp.send(plainTextData);
            } else {
                var jsonData = JSON.stringify(maybePayload);
                xhttp.send(jsonData);
            }
        } else {
            xhttp.send();
        }
    }
)
    ;
}
    /**
     *
     * @param {XQSDK#String}key
     * @returns {OTPv2Encryption}
     */
    getAlgorithm = function (key) {
    return this.ALGORITHMS[key];
}

/**
 *
 * @param {{}} paramsObject
 * @returns {String} of query parameters
 */
buildQeryParams = function (paramsObject) {
    var i = 1;
    var buffer = '';
    const entries = Object.entries(paramsObject);
    for (let [name, value] of entries) {
        buffer += name + '=' + encodeURIComponent(value);
        if (i < entries.length) {
            buffer += '&';
            i++;
        }
    }
    return buffer;
}

    /**
     *
     * @param {boolean} condition
     * @param {String} message
     */
    assert = function (condition, message) {
        if (!condition) {
            let msg = message || "Assertion failed";
            console.info(msg)
            throw msg;
        }
   }


    /**
     * @return SimpleXQCache
     */
      getCache = function() {
        return this.cache;
    }

    /**
     * @method validateInput
     * @param {Map} maybeArgs - The arguments supplied to this service
     * @param {[String]} requiredFields - The necessary fields to be supplied for this service to function
     * @throws Required Field Exception
     * @returns {Map} validated arguments
     */
    validateInput = function (maybeArgs, requiredFields) {

        if (requiredFields.length == 0) {
            return maybeArgs;
        }
        if (maybeArgs == null) {
            throw new ValidationException(500, `Missing input parameters: [${requiredFields}]`);
        }
        let input = Object.getOwnPropertyNames(maybeArgs);

        let missing = requiredFields.filter(function (m) {
            return !input.includes(m)
        });

        if (missing.length > 0) {
            let msg = "missing [" + missing + "] !";
            console.error(msg);
            throw msg;
        }
        return maybeArgs;

    }

    validatePreAuthToken = function () {

        // Ensure that there is an active profile.
        let activeProfile = this.cache.getActiveProfile(true);

        let preAuthToken = this.cache.getXQPreAuthToken(activeProfile, true);
        if (preAuthToken == null) {
            throw new StatusException(401, `pre authorization Token not Found for ${activeProfile}`);
        }
        return preAuthToken;

    }
    /**
     *
     * @param {Destination}destination
     * @returns {string}
     */
    validateAccessToken = function (destination= Destination.prototype.XQ) {

        // Ensure that there is an active profile.
        let activeProfile = this.cache.getActiveProfile(true);
        let accessToken = null;

        switch (destination) {
            case Destination.prototype.XQ:{
                accessToken =  this.cache.getXQAccess(activeProfile, true);
                break;
            }
            case Destination.prototype.DASHBOARD:{
                accessToken = this.cache.getDashboardAccess(activeProfile, true);
                break;
            }
        }
        if (accessToken == null) {
            throw new StatusException(401, `Access Token not Found for ${activeProfile}`);
        }
        return accessToken;

    }

}

XQSDK.prototype.API_KEY = "api-key";
XQSDK.prototype.CONTENT_TYPE = "content-type";
XQSDK.prototype.ACCESS_CONTROL_ALLOW_ORIGIN = "Access-Control-Allow-Origin";
XQSDK.prototype.APPLICATION_JSON = "application/json";
XQSDK.prototype.TEXT_PLAIN_UTF_8 = "text/plain;charset=UTF-8";
XQSDK.prototype.ANY = "*";

