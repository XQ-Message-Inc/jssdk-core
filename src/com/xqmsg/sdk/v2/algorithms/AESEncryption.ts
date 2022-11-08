import AES from "crypto-js/aes";
import EncryptionAlgorithm from "./EncryptionAlgorithm";
import ServerResponse from "../ServerResponse";
import XQSDK from "../XQSDK";
import encodeUTF8 from "crypto-js/enc-utf8";

/**
 * A class for the [Advanced Encryption Standard (AES)](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard#Definitive_standards).
 *
 * The algorithm described by AES is a symmetric-key algorithm, meaning the same key is used for both encrypting and decrypting the data.
 *
 * @class [AESEncryption]
 */
export default class AESEncryption extends EncryptionAlgorithm {
  /**
   * Takes an encrypted AES text string and attempts to decrypt with the provided key.
   * @param  {String} text The text to decrypt.
   * @param  {String} key The encryption key.
   * @return {Promise<ServerResponse<{payload:{decryptedText:string}}>>} A Promise of the Response containing the decrypted text.
   */
  decryptText: (text: string, key: string) => Promise<ServerResponse>;

  /**
   * Takes a string and AES encrypts it using the provided quantum key.
   *
   * @param  {String} text The text to encrypt.
   * @param  {String} key The encryption key.
   * @return {Promise<ServerResponse>} The encrypted text.
   */
  encryptText: (text: string, key: string) => Promise<ServerResponse>;

  prefix: string;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.prefix = ".X";

    this.encryptText = (text, key) => {
      try {
        const self = this;
        self.sdk.validateAccessToken();

        return new Promise((resolve) => {
          try {
            if (key === "" || key == undefined) {
              console.error("AES Source Key cannot be empty.");
              resolve(
                new ServerResponse(
                  ServerResponse.ERROR,
                  500,
                  "AES Source Key cannot be empty."
                )
              );
            }

            var encryptedText = AES.encrypt(text, key).toString();

            resolve(
              new ServerResponse(ServerResponse.OK, 200, {
                [EncryptionAlgorithm.ENCRYPTED_TEXT]: encryptedText,
                [EncryptionAlgorithm.KEY]: key,
              })
            );
          } catch (error) {
            console.error(error.message);

            resolve(
              new ServerResponse(ServerResponse.ERROR, 500, error.message)
            );
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

    this.decryptText = (text, key) => {
      try {
        const self = this;
        self.sdk.validateAccessToken();

        return new Promise((resolve) => {
          try {
            if (key === "" || key == undefined) {
              console.error("AES Source Key cannot be empty.");
              resolve(
                new ServerResponse(
                  ServerResponse.ERROR,
                  500,
                  "AES Source Key cannot be empty."
                )
              );
            }
            var bytes = AES.decrypt(text, key);
            var decryptedText = bytes.toString(encodeUTF8);

            resolve(
              new ServerResponse(ServerResponse.OK, 200, {
                [EncryptionAlgorithm.DECRYPTED_TEXT]: decryptedText,
              })
            );
          } catch (error) {
            console.error(error.message);
            resolve(
              new ServerResponse(ServerResponse.ERROR, 500, error.message)
            );
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
