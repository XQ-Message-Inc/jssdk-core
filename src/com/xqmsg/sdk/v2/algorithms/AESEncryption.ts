import AES from "crypto-js/aes";
import EncryptionAlgorithm, {
  DecryptText,
  EncryptText,
} from "./EncryptionAlgorithm";
import ServerResponse from "../ServerResponse";
import XQSDK from "../XQSDK";
import encodeUTF8 from "crypto-js/enc-utf8";

export default class AESEncryption extends EncryptionAlgorithm {
  decryptText: DecryptText;
  encryptText: EncryptText;
  prefix: string;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.prefix = ".X";

    /**
     * Takes a string and AES encrypts it using the provided quantum key.
     *
     * @param  {String} text The text to encrypt.
     * @param  {String} key The encryption key.
     * @return {Promise<ServerResponse>} The encrypted text.
     */
    this.encryptText = (text, key) => {
      try {
        const self = this;
        self.sdk.validateAccessToken();

        return new Promise((resolve, reject) => {
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
        return new Promise((resolve, reject) => {
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

    /**
     * Takes an encrypted AES text string and attempts to decrypt with the provided key.
     * @param  {String} text The text to decrypt.
     * @param  {String} key The encryption key.
     * @return {Promise<ServerResponse<{payload:{decryptedText:string}}>>} A Promise of the Response containing the decrypted text.
     */
    this.decryptText = (text, key) => {
      try {
        const self = this;
        self.sdk.validateAccessToken();

        return new Promise((resolve, reject) => {
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
        return new Promise((resolve, reject) => {
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
