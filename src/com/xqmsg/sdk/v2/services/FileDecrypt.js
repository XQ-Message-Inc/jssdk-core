import XQModule from "./XQModule.js";
import ServerResponse from '../ServerResponse.js';
import FetchKey from './FetchKey.js';

/**
 *
 * Decrypts data stored in a file using the {@link EncryptionAlgorithm} provided.
 *
 * @class [FileDecrypt]
 */
export default class FileDecrypt extends XQModule {


    constructor(sdk, algorithm) {
        super(sdk);

        this.algorithm = algorithm;
        this.requiredFields=[this.SOURCE_FILE];
    }
    /**
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @param {File} maybePayLoad.sourceFile - The file to be decrypted.
     *
     *  @returns {Promise<ServerResponse<{payload:File}>>}
     */
    supplyAsync = function (maybePayLoad) {

        try {
            this.sdk.validateInput(maybePayLoad, this.requiredFields);
        }
        catch (validationException){
            return new Promise(function (resolve, reject) {
                resolve(new ServerResponse(
                    ServerResponse.prototype.ERROR,
                    validationException.code,
                    validationException.reason
                ));
            });
        }
        const algorithm = this.algorithm;
        const sdk = this.sdk;
        const accessToken = this.accessToken;
        const sourceFile = maybePayLoad[this.SOURCE_FILE];

        return algorithm
            .decryptFile(sourceFile,
                function (aLocatorToken) {
                    return new FetchKey(sdk, accessToken)
                        .supplyAsync({[FetchKey.prototype.LOCATOR_KEY]: aLocatorToken})
                        .then(function (retrieveKeyRespose) {
                            switch (retrieveKeyRespose.status) {
                                case ServerResponse.prototype.OK: {
                                    return  retrieveKeyRespose.payload;
                                }
                                case ServerResponse.prototype.ERROR: {
                                    console.error(`${algorithm.constructor.name}.decryptFile() failed, code: ${retrieveKeyRespose.statusCode}, reason: ${retrieveKeyRespose.payload}`);
                                    return retrieveKeyRespose;
                                }
                            }
                        });
                }
            );


    }

}


FileDecrypt.prototype.SOURCE_FILE = "sourceFile";
