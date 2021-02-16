
/**
 * @class ServerResponse
 * @property {Answered} status - binary reply from server.
 * @property {Number} code - A numeric representation of the actual status returned from the server. To be used for more specific error handling.
 * @property {Map<String,Any>} payload - The data that is being returned form the server
 *
 */

export default class ServerResponse {


    /**
     * @param {Answered} status
     * @param {Number}  code
     * @param {Map|Object} data
     */
    constructor(status, code, data) {

        this.status = status
        this.statusCode = code
        this.payload = data;
    }

}

ServerResponse.prototype.OK = "OK";
ServerResponse.prototype.ERROR = "ERROR";
