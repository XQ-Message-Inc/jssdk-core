import CallMethod from "../../CallMethod";
import Destination from "../../Destination";
import ServerResponse from "../../ServerResponse";
import XQModule from "../XQModule";
import XQSDK from "../../XQSDK";
import { XQServices } from "../../XQServicesEnum";

import handleException from "../../exceptions/handleException";

/**
 * A service which is utilized to update an existing business
 *
 * @class [UpdateBusiness]
 */
export default class UpdateBusiness extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing the main business email */
  static EMAIL: "email" = "email";

  /** The field name representing the name of the business */
  static NAME: "name" = "name";

  /** The field name representing the street address of the business */
  static STREET: "street" = "street";

  /** The field name representing the business city */
  static CITY: "city" = "city";

  /** The field name representing the business state */
  static STATE: "state" = "state";

  /** The field name representing the business country */
  static COUNTRY: "country" = "country";

  /** The field name representing the telephone number of the business */
  static TELEPHONE: "telephone" = "telephone";

  /** The field name representing the zip code of the business */
  static POSTAL: "postal" = "postal";

  /** The field name representing the tagline for the business */
  static TAG: "tag" = "tag";

  /* The field name of a flag designating whether or not the business is locked. If it is locked,
   * all keys are no longer accessible.
   */
  static LOCKED: "locked" = "locked";

  /**
   * @param {Map} maybePayload - the container for the request parameters supplied to this method.
   * @param {String} email - the main business email
   * @param {String} name - the name of the business
   * @param {String} street - the street address of the business
   * @param {String} city - the city of the business
   * @param {String} state - the state of the business
   * @param {String} country - the country of the business
   * @param {String} telephone - the telephone number of the business
   * @param {String} postal - the zip code of the business
   * @param {String} tag - the tagline of the business
   * @param {Boolean} locked - the flag for whether or the business is locked.
   * @returns {Promise<ServerResponse<{payload:{}}>>}
   */
  supplyAsync: (maybePayload: {
    [UpdateBusiness.EMAIL]?: string;
    [UpdateBusiness.NAME]?: string;
    [UpdateBusiness.STREET]?: string;
    [UpdateBusiness.CITY]?: string;
    [UpdateBusiness.STATE]?: string;
    [UpdateBusiness.COUNTRY]?: string;
    [UpdateBusiness.TELEPHONE]?: string;
    [UpdateBusiness.POSTAL]?: string;
    [UpdateBusiness.TAG]?: string;
    [UpdateBusiness.LOCKED]?: boolean;
  }) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = "business";
    this.requiredFields = [];

    this.supplyAsync = (maybePayload) => {
      try {
        this.sdk.validateInput(maybePayload, this.requiredFields);

        const dashboardAccessToken = this.sdk.validateAccessToken(
          Destination.DASHBOARD
        );

        const additionalHeaderProperties = {
          Authorization: "Bearer " + dashboardAccessToken,
        };

        return this.sdk
          .call(
            this.sdk.DASHBOARD_SERVER_URL,
            this.serviceName,
            CallMethod.PATCH,
            additionalHeaderProperties,
            maybePayload,
            true,
            Destination.DASHBOARD
          )
          .then(async (response: ServerResponse) => {
            switch (response.status) {
              case ServerResponse.OK: {
                return response;
              }
              case ServerResponse.ERROR: {
                return handleException(response, XQServices.UpdateBusiness);
              }
            }
          });
      } catch (exception) {
        return new Promise((resolve) =>
          resolve(handleException(exception, XQServices.UpdateBusiness))
        );
      }
    };
  }
}
