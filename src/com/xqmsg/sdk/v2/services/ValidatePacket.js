import XQModule from "./XQModule.js";
import CallMethod from "./../CallMethod.js";
import XQSDK from '../XQSDK.js';
import ServerResponse from "../ServerResponse.js";

/**
 *  Validates your {@link Authorize} call.<br>
 *  Returns 204, "No Content" if successful.
 *  @class [ValidatePacket]
 */
export default class ValidatePacket extends XQModule{

    constructor(sdk) {
        super(sdk);

        this.serviceName =  "packet";
        this.requiredFields = [ValidatePacket.PACKET];

    }

    /**
     *
     * @param {{}} maybePayLoad:
     * @returns {Promise<ServerResponse<{}>>}
     */
    supplyAsync = function (maybePayLoad) {

        try {

            let self = this;
            self.sdk.validateInput(maybePayLoad, self.requiredFields);
            let accessToken = self.sdk.validateAccessToken();

            let additionalHeaderProperties = {
                "Authorization": "Bearer " + accessToken,
                [XQSDK.CONTENT_TYPE]: XQSDK.TEXT_PLAIN_UTF_8
            };

            return self.sdk.call(self.sdk.VALIDATION_SERVER_URL,
                self.serviceName,
                CallMethod.POST,
                additionalHeaderProperties,
                maybePayLoad,
                true);

        }
        catch (validationException){
            return new Promise(function (resolve, reject) {
                resolve(new ServerResponse(
                    ServerResponse.ERROR,
                    validationException.code,
                    validationException.reason
                ));
            });
        }

    }


}

ValidatePacket.PACKET = "data";
