import XQModule from "./XQModule.js";
import ServerResponse from '../ServerResponse.js';
import FetchQuantumEntropy from '../quantum/FetchQuantumEntropy.js';
import GeneratePacket from './GeneratePacket.js';
import ValidatePacket from './ValidatePacket.js';
import EncryptionAlgorithm from '../algorithms/EncryptionAlgorithm.js';
import ExchangeForAccessToken from './ExchangeForAccessToken.js';

/**
 * @class
 * Encrypts textual data using the {@link EncryptionAlgorithm} provided.
 */
export default class Encrypt extends XQModule{


    constructor(sdk, algorithm) {
        super(sdk);

        this.algorithm = algorithm;
        this.requiredFields = [this.USER, this.RECIPIENTS, this.TEXT, this.EXPIRES_HOURS];

    }

    /**
     * @param {Map} maybePayLoad - Container for the request parameters supplied to this method.
     * @param {String} maybePayLoad.user - Email of the validated user and author of the message.
     * @param {[String]} maybePayLoad.recipients  - List of emails of users intended to have read access to the encrypted content.
     * @param {String} maybePayLoad.text - Text to be encrypted.
     * @param {Long} maybePayLoad.expires - Life span of the encrypted content, measured in hours.
     * @param {Boolean} [maybePayLoad.dor=false] - Should the content be deleted after opening.
     *
     * @returns {Promise<ServerResponse<{payload:{locatorKey:string, encryptedText:string}}>>}
     */
    supplyAsync = function (maybePayLoad) {

        try {
            let self = this;
            self.sdk.validateInput(maybePayLoad, self.requiredFields);

            const sdk = self.sdk;
            const algorithm = self.algorithm;
            const message = maybePayLoad[self.TEXT];
            const recipients = maybePayLoad[self.RECIPIENTS];
            const expiresHours = maybePayLoad[self.EXPIRES_HOURS];
            const deleteOnReceipt = maybePayLoad[self.DELETE_ON_RECEIPT];

            return new  FetchQuantumEntropy(sdk)
                .supplyAsync({[FetchQuantumEntropy.prototype.KS]: FetchQuantumEntropy.prototype._256})
                .then(function (keyResponse) {
                    switch (keyResponse.status) {
                        case ServerResponse.prototype.OK: {
                            let initialKey = keyResponse.payload;
                            let expandedKey = algorithm.expandKey(initialKey, message.length > 4096 ? 4096 : Math.max(2048, message.length));

                            return algorithm
                                .encryptText(message, expandedKey)
                                .then(function (encryptResponse) {
                                    switch (encryptResponse.status) {
                                        case ServerResponse.prototype.OK: {
                                            let encryptResult = encryptResponse.payload;
                                            let encryptedText = encryptResult[EncryptionAlgorithm.prototype.ENCRYPTED_TEXT];
                                            let expandedKey = encryptResult[EncryptionAlgorithm.prototype.KEY];

                                            return new GeneratePacket(sdk)
                                                .supplyAsync({
                                                    [GeneratePacket.prototype.KEY]: algorithm.prefix + expandedKey,
                                                    [GeneratePacket.prototype.RECIPIENTS]: recipients,
                                                    [GeneratePacket.prototype.EXPIRES_HOURS]: expiresHours,
                                                    [GeneratePacket.prototype.DELETE_ON_RECEIPT]: deleteOnReceipt?deleteOnReceipt:false
                                                })
                                                .then(function (uploadResponse) {
                                                    switch (uploadResponse.status) {
                                                        case ServerResponse.prototype.OK: {
                                                            let packet = uploadResponse.payload;
                                                            return new ValidatePacket(sdk)
                                                                .supplyAsync({[ValidatePacket.prototype.PACKET]: packet})
                                                                .then(function (packetValidationResponse) {
                                                                    switch (packetValidationResponse.status) {
                                                                        case ServerResponse.prototype.OK: {
                                                                            let locator = packetValidationResponse.payload;
                                                                            return new ServerResponse(
                                                                                ServerResponse.prototype.OK,
                                                                                200,
                                                                                {
                                                                                    [self.LOCATOR_KEY]: locator,
                                                                                    [self.ENCRYPTED_TEXT]: encryptedText
                                                                                }
                                                                            );
                                                                        }
                                                                        case ServerResponse.prototype.ERROR: {
                                                                            console.error(`PacketValidation failed, code: ${packetValidationResponse.statusCode}, reason: ${packetValidationResponse.payload}`);
                                                                            return packetValidationResponse;
                                                                        }
                                                                    }
                                                                });
                                                        }
                                                        case ServerResponse.prototype.ERROR: {
                                                            console.error(`GeneratePacket failed, code: ${uploadResponse.statusCode}, reason: ${uploadResponse.payload}`);
                                                            return uploadResponse;
                                                        }
                                                    }
                                                });
                                        }
                                        case ServerResponse.prototype.ERROR: {
                                            console.error(`${algorithm.constructor.name}.encryptText(...) failed,  code: ${encryptResponse.statusCode}, reason: ${encryptResponse.payload}`);
                                            return encryptResponse;
                                        }
                                    }

                                });
                        }
                        case ServerResponse.prototype.ERROR: {
                            console.error(`FetchQuantumEntropy failed, code: ${keyResponse.statusCode}, reason: ${keyResponse.payload}`);
                            return null;
                        }
                    }
                });

        } catch (exception) {
        return new Promise(function (resolve, reject) {
            resolve(new ServerResponse(
                ServerResponse.prototype.ERROR,
                exception.code,
                exception.reason
            ));
        });
    }

    }

}


/** Email of the validated user and author of the message.*/
Encrypt.prototype.USER = "user";
/** List of emails of users intended to have read access to the encrypted content*/
Encrypt.prototype.RECIPIENTS = "recipients";
/** Should the content be deleted after opening*/
Encrypt.prototype.DELETE_ON_RECEIPT = "dor";
/** Life span of the encrypted content*/
Encrypt.prototype.EXPIRES_HOURS = "expires";
/** Text to be encrypted.*/
Encrypt.prototype.TEXT = "text";

/** Token by which to fetch the encryption key from the serve*/
Encrypt.prototype.LOCATOR_KEY = "locatorKey";
/** Encrypted Text*/
Encrypt.prototype.ENCRYPTED_TEXT = "encryptedText";
