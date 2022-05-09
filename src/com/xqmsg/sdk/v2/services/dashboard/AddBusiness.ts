import CallMethod from "../../CallMethod";
import Destination from "../../Destination";
import ServerResponse from "../../ServerResponse";
import XQModule from "../XQModule";
import XQSDK from "../../XQSDK";

/**
 * A service which is utilized to create a new business
 *
 * NOTE: this requires an enterprise level API key, not a user generated API key
 *
 * @class [AddBusiness]
 */
export default class AddBusiness extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  /** The field name representing the main business email */
  static EMAIL: "email" = "email";

  /** The field name representing the workspace for this business - must be unique */
  static WORKSPACE: "workspace" = "workspace";

  /** The field name representing the name of the business */
  static NAME: "name" = "name";

  /** The field name representing the email for the main administrator of the business */
  static ADMIN_EMAIL: "aemail" = "aemail";

  /** The field name representing the first name of the main administrator */
  static ADMIN_FIRST: "afirst" = "afirst";

  /** The field name representing the last name of the main administrator */
  static ADMIN_LAST: "alast" = "alast";

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

  /* The field name of a flag designating whether or not to convert the existing and current
   * business, into the one. This will copy over all contacts and data and then delete the old
   * business.
   */
  static CONVERT_FROM_EXISTING: "convertFromExisting" = "convertFromExisting";

  /**
   * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
   * @param {String} email - the main business email
   * @param {String} workspace - the desired workspace for the business
   * @param {String} name - the name of the business
   * @param {String} aemail - the email of the main administrator
   * @param {String} afirst - the first name of the main administrator
   * @param {String} alast - the last name of the main administrator
   * @param {String} street - the street address of the business
   * @param {String} city - the city of the business
   * @param {String} state - the state of the business
   * @param {String} country - the country of the business
   * @param {String} telephone - the telephone number of the business
   * @param {String} postal - the zip code of the business
   * @param {String} tag - the tagline of the business
   * @param {Boolean} convertFromExisting - the flag for whether or not to convert the existing dashboard into the newly created dashboard
   * @returns {Promise<ServerResponse<{payload: string}>>} - payload is the access token for the new business
   */
  supplyAsync: (maybePayLoad: {
    [AddBusiness.EMAIL]: string;
    [AddBusiness.WORKSPACE]: string;
    [AddBusiness.NAME]: string;
    [AddBusiness.ADMIN_EMAIL]: string;
    [AddBusiness.ADMIN_FIRST]?: string;
    [AddBusiness.ADMIN_LAST]?: string;
    [AddBusiness.STREET]?: string;
    [AddBusiness.CITY]?: string;
    [AddBusiness.STATE]?: string;
    [AddBusiness.COUNTRY]?: string;
    [AddBusiness.TELEPHONE]?: string;
    [AddBusiness.POSTAL]?: string;
    [AddBusiness.TAG]?: string;
    [AddBusiness.CONVERT_FROM_EXISTING]?: boolean;
  }) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = AddBusiness.BUSINESS;
    this.requiredFields = [
      AddBusiness.EMAIL,
      AddBusiness.NAME,
      AddBusiness.ADMIN_EMAIL,
      AddBusiness.WORKSPACE,
    ];

    this.supplyAsync = (maybePayLoad) => {
      try {
        this.sdk.validateInput(maybePayLoad, this.requiredFields);

        const dashboardAccessToken = this.sdk.validateAccessToken(
          Destination.DASHBOARD
        );

        const additionalHeaderProperties = {
          Authorization: "Bearer " + dashboardAccessToken,
        };

        return this.sdk.call(
          this.sdk.DASHBOARD_SERVER_URL,
          this.serviceName,
          CallMethod.POST,
          additionalHeaderProperties,
          maybePayLoad,
          true,
          Destination.DASHBOARD
        );
      } catch (exception) {
        return new Promise((resolve) => {
          resolve(
            new ServerResponse(
              ServerResponse.ERROR,
              exception.code,
              exception.reason
            )
          );
        });
      }
    };
  }
}
