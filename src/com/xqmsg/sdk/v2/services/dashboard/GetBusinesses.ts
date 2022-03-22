import CallMethod from "../../CallMethod";
import Destination from "../../Destination";
import ServerResponse from "../../ServerResponse";
import XQModule from "../XQModule";
import XQSDK from "../../XQSDK";

/**
 * A service which is utilized to find a given dashboard's Businesses
 *
 * @class [GetBusinesses]
 */
export default class GetBusinesses extends XQModule {
  /** The required fields of the payload needed to utilize the service */
  requiredFields: string[];

  /** Specified name of the service */
  serviceName: string;

  static BUSINESSES: "businesses" = "businesses";

  /**
   * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
   *
   * @returns {Promise<ServerResponse<{payload:{businesses:[{canAccessBusiness: boolean, domain: string, id: int, isPersonal: boolean, name: string}]}}>>}
   */
  supplyAsync: (maybePayload: null) => Promise<ServerResponse>;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.serviceName = GetBusinesses.BUSINESSES;
    this.requiredFields = [];

    // TODO(joshuaskatz - 3.22.22): add filter capabilities
    this.supplyAsync = () => {
      try {
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
            CallMethod.GET,
            additionalHeaderProperties,
            null,
            true,
            Destination.DASHBOARD
          )
          .then(async (response: ServerResponse) => {
            switch (response.status) {
              case ServerResponse.OK: {
                const businesses = response.payload.businesses;
                return new ServerResponse(ServerResponse.OK, 200, {
                  businesses,
                });
              }
              case ServerResponse.ERROR: {
                console.error(
                  `GetBusinesses failed, code: ${response.statusCode}, reason: ${response.payload}`
                );
                return response;
              }
            }
          });
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
