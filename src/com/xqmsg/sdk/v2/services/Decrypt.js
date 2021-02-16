import XQModule from "./XQModule.js";
import ServerResponse from '../ServerResponse.js';
import FetchKey from './FetchKey.js';

export default class Decrypt extends XQModule {

    constructor(sdk, algorithm) {
        super(sdk);

        this.algorithm = algorithm;
        this.requiredFields = [this.LOCATOR_KEY, this.ENCRYPTED_TEXT];

    }

    /**
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @param {String} maybePayLoad.locatorToken - The locator token needed to fetch the encryption key from the server
     * @param {String} maybePayLoad.encryptedText  - The text to decrypt.
     * @returns {Promise<ServerResponse<{payload:{decryptedText:string}}>>}
     */
    supplyAsync = function (maybePayLoad) {

        try {
            let self = this;
            self.sdk.validateInput(maybePayLoad, self.requiredFields);

            const sdk = self.sdk;
            const accessToken = self.accessToken;
            const algorithm = self.algorithm;
            let locatorKey = maybePayLoad[self.LOCATOR_KEY];
            let encryptedText = maybePayLoad[self.ENCRYPTED_TEXT];

            return new FetchKey (sdk, accessToken)
                .supplyAsync({[FetchKey.prototype.LOCATOR_KEY]: locatorKey})
                .then(function (keyRetrievalResponse) {
                    switch (keyRetrievalResponse.status) {
                        case ServerResponse.prototype.OK: {
                            let encryptionKey = keyRetrievalResponse.payload;
                            return algorithm
                                .decryptText(encryptedText, encryptionKey)
                                .then(function (decryptResponse) {
                                    switch (decryptResponse.status) {
                                        case ServerResponse.prototype.OK: {
                                            return decryptResponse;
                                        }
                                        case ServerResponse.prototype.ERROR: {
                                            console.error(`${algorithm.constructor.name}.decryptText(...) failed, code: ${decryptResponse.statusCode}, reason: ${decryptResponse.payload}`);
                                            return decryptResponse;
                                        }
                                    }
                                });
                        }
                        case ServerResponse.prototype.ERROR: {
                            console.info(keyRetrievalResponse);
                            return keyRetrievalResponse;
                        }
                    }
                });

        } catch (validationException) {
            return new Promise(function (resolve, reject) {
                resolve(new ServerResponse(
                    ServerResponse.prototype.ERROR,
                    validationException.code,
                    validationException.reason
                ));
            });
        }

    }


}

//**key to fetch the encryption key from the server*/
Decrypt.prototype.LOCATOR_KEY = "locatorKey";
Decrypt.prototype.ENCRYPTED_TEXT = "encryptedText";