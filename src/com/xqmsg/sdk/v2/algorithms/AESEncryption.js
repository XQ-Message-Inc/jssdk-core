import EncryptionAlgorithm from '../algorithms/EncryptionAlgorithm.js';
import ServerResponse from '../ServerResponse.js';

export default class AESEncryption extends EncryptionAlgorithm {

    constructor(sdk) {
        super(sdk);
        this.prefix = ".X"

    }

    /**
     * Takes a string and AES encrypts it using the provided quantum key.
     *
     * @param  {String} text The text to encrypt.
     * @param  {String} key The encryption key.
     * @return {Promise<ServerResponse>} The encrypted text.
     */
    encryptText = function (text, key) {
        try {
            const self = this;
            self.sdk.validateAccessToken();

            return new Promise(function (resolve, reject) {

                try {
                    if (key === '' | key == undefined) {
                        console.error("AES Source Key cannot be empty.");
                        resolve(new ServerResponse(
                            ServerResponse.prototype.ERROR,
                            500,
                            "AES Source Key cannot be empty."
                        ));
                    }

                    var encryptedText = CryptoJS.AES.encrypt(text, key).toString();

                    resolve(new ServerResponse(
                        ServerResponse.prototype.OK,
                        200,
                        {
                            [EncryptionAlgorithm.prototype.ENCRYPTED_TEXT]: encryptedText,
                            [EncryptionAlgorithm.prototype.KEY]: key
                        }
                    ));

                } catch (error) {
                    console.error(error.message);

                    resolve(new ServerResponse(
                        ServerResponse.prototype.ERROR,
                        500,
                        error.message
                    ));
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

    /**
     * Takes an encrypted AES text string and attempts to decrypt with the provided key.
     * @param  {String} text The text to decrypt.
     * @param  {String} key The encryption key.
     * @return {Promise<ServerResponse<{payload:{decryptedText:string}}>>} A Promise of the Response containing the decrypted text.
     */
    decryptText = function (text, key) {

        try {
            const self = this;
            self.sdk.validateAccessToken();

            return new Promise(function (resolve, reject) {
                try {
                    if (key === '' | key == undefined) {
                        console.error("AES Source Key cannot be empty.");
                        resolve(new ServerResponse(
                            ServerResponse.prototype.ERROR,
                            500,
                            "AES Source Key cannot be empty."
                        ));
                    }
                    var bytes = CryptoJS.AES.decrypt(text, key);
                    var decryptedText = bytes.toString(CryptoJS.enc.Utf8);

                    resolve(new ServerResponse(
                        ServerResponse.prototype.OK,
                        200,
                        {
                            [EncryptionAlgorithm.prototype.DECRYPTED_TEXT]: decryptedText
                        }
                    ));
                } catch (error) {
                    console.error(error.message);
                    resolve(new ServerResponse(
                        ServerResponse.prototype.ERROR,
                        500,
                        error.message
                    ));
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