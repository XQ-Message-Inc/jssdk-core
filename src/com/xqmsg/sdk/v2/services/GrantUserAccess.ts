import CallMethod from "./../CallMethod";
import ServerResponse from "../ServerResponse";
import XQModule from "./XQModule";
import XQSDK from "../XQSDK";
import { XQServices } from "../XQServicesEnum";

import handleException from "../exceptions/handleException";

/**
 * A service which is utilized to grant access for a particular user to a specified key. The
 * person granting access must be the one who owns the key.
 *
 * @class [GrantUserAccess]
 */
export default class GrantUserAccess extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing the locator token */
  static LOCATOR_TOKEN: "locatorToken" = "locatorToken";

  /** The field name representing the list of recipients */
  static RECIPIENTS: "recipients" = "recipients";

  /**
   * @param {Map} maybePayload - the container for the request parameters supplied to this method.
   * @param {[String]} maybePayload.recipients  - the list of emails of users intended to have read access to the encrypted content
   * @param {String} maybePayload.locatorToken - a URL encoded version of the key locator token to fetch the key from the server.
   * @see #encodeURIComponent function encodeURIComponent (built-in since ES-5)
   * @returns {Promise<ServerResponse<{payload:{data:{}}}>>}
   */
  supplyAsync: (maybePayload: {
    recipients: string[];
    locatorToken: string;
  }) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);

    this.serviceName = "grant";
    this.requiredFields = [
      GrantUserAccess.LOCATOR_TOKEN,
      GrantUserAccess.RECIPIENTS,
    ];

    this.supplyAsync = (maybePayload) => {
      try {
        this.sdk.validateInput(maybePayload, this.requiredFields);
        const accessToken = this.sdk.validateAccessToken();

        const recipientList = maybePayload[GrantUserAccess.RECIPIENTS];

        const payload = {
          [GrantUserAccess.RECIPIENTS]: recipientList,
        };

        const additionalHeaderProperties = {
          Authorization: "Bearer " + accessToken,
        };

        return this.sdk
          .call(
            this.sdk.VALIDATION_SERVER_URL,
            this.serviceName +
              "/" +
              encodeURIComponent(maybePayload[GrantUserAccess.LOCATOR_TOKEN]),
            CallMethod.POST,
            additionalHeaderProperties,
            payload,
            true
          )
          .then((response: ServerResponse) => {
            switch (response.status) {
              case ServerResponse.OK: {
                return response;
              }
              case ServerResponse.ERROR: {
                return handleException(response, XQServices.GrantUserAccess);
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.GrantUserAccess))
        );
      }
    };
  }
}

GrantUserAccess.RECIPIENTS = "recipients";
GrantUserAccess.LOCATOR_TOKEN = "locatorToken";
