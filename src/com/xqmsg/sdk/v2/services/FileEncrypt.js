import XQModule from "./XQModule.js";
import ServerResponse from '../ServerResponse.js';
import FetchQuantumEntropy from '../quantum/FetchQuantumEntropy.js';
import GeneratePacket from './GeneratePacket.js';
import ValidatePacket from './ValidatePacket.js';

/**
 *
 * Encrypts data stored in a file using the {@link EncryptionAlgorithm} provided.
 *
 * @class [FileEncrypt]
 */
export default class FileEncrypt extends XQModule {

    constructor(sdk, algorithm) {
        super(sdk);

        this.algorithm = algorithm;
        this.requiredFields = [this.USER, this.SOURCE_FILE, this.RECIPIENTS, this.EXPIRES_HOURS];
    }


    /**
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @param {String} maybePayLoad.user - Email of the validated user and author of the message.
     * @param {File} maybePayLoad.sourceFile - The file to be encrypted.
     * @param {[String]} maybePayLoad.recipients  - List of emails of users intended to have read access to the encrypted content.
     * @param {Long} maybePayLoad.expires - Life span of the encrypted content, measured in hours.
     * @param {Boolean} [maybePayLoad.dor=false] - Should the content be deleted after opening.
     *
     * @returns {Promise<ServerResponse<{payload:File}>>}
     */
    supplyAsync = function (maybePayLoad) {

        try {
            let self = this;
            self.sdk.validateInput(maybePayLoad, self.requiredFields);

            const algorithm = self.algorithm;
            const sdk = self.sdk;
            const sourceFile = maybePayLoad[self.SOURCE_FILE];
            const recipients = maybePayLoad[self.RECIPIENTS];
            const expiration = maybePayLoad[self.EXPIRES_HOURS];
            const deleteOnReceipt = maybePayLoad[self.DELETE_ON_RECEIPT];

            return new  FetchQuantumEntropy(sdk)
                .supplyAsync({[FetchQuantumEntropy.prototype.KS]: FetchQuantumEntropy.prototype._256})
                .then(function (keyResponse) {
                    switch (keyResponse.status) {
                        case ServerResponse.prototype.OK: {
                            const initialKey = keyResponse.payload;
                            let expandedKey = algorithm.expandKey(initialKey, sourceFile.size > 4096 ? 4096 : Math.max(2048, sourceFile.size));
                            return new GeneratePacket(sdk)
                                .supplyAsync({
                                    [self.KEY]: algorithm.prefix + expandedKey,
                                    [self.RECIPIENTS]: recipients,
                                    [self.EXPIRES_HOURS]: expiration,
                                    [self.DELETE_ON_RECEIPT]: deleteOnReceipt ? deleteOnReceipt : false
                                })
                                .then(function (uploadResponse) {
                                    switch (uploadResponse.status) {
                                        case ServerResponse.prototype.OK: {
                                            const packet = uploadResponse.payload;
                                            return new ValidatePacket(sdk)
                                                .supplyAsync({[ValidatePacket.prototype.PACKET]: packet})
                                                .then(function (validateResponse) {
                                                    switch (validateResponse.status) {
                                                        case ServerResponse.prototype.OK: {
                                                            const locatorToken = validateResponse.payload;
                                                            return algorithm
                                                                .encryptFile(sourceFile, expandedKey, locatorToken)
                                                                .then(function (fileEncrpytResponse) {
                                                                    switch (fileEncrpytResponse.status) {
                                                                        case ServerResponse.prototype.OK: {
                                                                            const encryptedFile = fileEncrpytResponse.payload;
                                                                            return fileEncrpytResponse;
                                                                        }
                                                                        case ServerResponse.prototype.ERROR: {
                                                                            console.error(`${algorithm.constructor.name}.encryptFile() failed, code: ${decryptResponse.statusCode}, reason: ${decryptResponse.payload}`);
                                                                            return fileEncrpytResponse;
                                                                        }
                                                                    }

                                                                });
                                                        }
                                                        case ServerResponse.prototype.ERROR: {
                                                            console.error(`ValidateNewKeyPacket failed, code: ${validateResponse.statusCode}, reason: ${validateResponse.payload}`);
                                                            return validateResponse;
                                                        }
                                                    }

                                                });
                                        }
                                        case ServerResponse.prototype.ERROR: {
                                            console.error(`GeneratePacket failed, code: ${uploadResponse.statusCode}, reason: ${uploadResponse.payload}`);
                                            return uploadResponse;
                                            break;
                                        }
                                    }
                                });
                        }
                        case ServerResponse.prototype.ERROR: {
                            console.error(`FetchQuantumEntropy failed, code: ${keyResponse.statusCode}, reason: ${keyResponse.payload}`);
                            return  keyResponse;
                            break;
                        }
                            ;
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



/** Encryption Key.*/
FileEncrypt.prototype.KEY = "key";
/** The File to be encrypted.*/
FileEncrypt.prototype.SOURCE_FILE = "sourceFile";
/** Email of the validated user and author of the message.*/
FileEncrypt.prototype.USER = "user";
/** List of emails of users intended to have read access to the encrypted content*/
FileEncrypt.prototype.RECIPIENTS = "recipients";
/** Should the content be deleted after opening*/
FileEncrypt.prototype.DELETE_ON_RECEIPT = "dor";
/** Life span of the encrypted content*/
FileEncrypt.prototype.EXPIRES_HOURS = "expires";


