import EncryptionAlgorithm from "../algorithms/EncryptionAlgorithm.js";
import ServerResponse from "../ServerResponse.js";

export default class OTPv2Encryption extends EncryptionAlgorithm {
  constructor(sdk) {
    super(sdk);
    this.prefix = ".X";
    this.keyPos = 0;
    this.key;
  }

  /**
   *
   * Encrypt text given a crpyto key.
   * @param  {String} text: the text to encrypt
   * @param  {String} key: the crypto key used to encrypt the text.
   * @return {Promise<ServerResponse<{payload:{encryptedText:string, key:string}}>>} A Promise of the response containing encrypted text.
   */
  encryptText = function (text, key) {
    try {
      const self = this;
      self.sdk.validateAccessToken();

      return new Promise(function (resolve, reject) {
        if ((key === "") | (key == undefined)) {
          console.error("OTPv2 Source Key cannot be empty.");
          resolve(
            new ServerResponse(
              ServerResponse.ERROR,
              500,
              "OTPv2 Source Key cannot be empty."
            )
          );
        }
        const expandedKey = self.expandKey(key, text, 2048);
        if (expandedKey == null) {
          console.error("Key could not be UTF8 encoded.");
          resolve(
            new ServerResponse(
              ServerResponse.ERROR,
              500,
              "Key could not be UTF8 encoded."
            )
          );
        }
        const encryptedText = self.exclusiveDisjunction(text, expandedKey);
        resolve(
          new ServerResponse(ServerResponse.OK, 200, {
            [EncryptionAlgorithm.ENCRYPTED_TEXT]: encryptedText,
            [EncryptionAlgorithm.KEY]: expandedKey,
          })
        );
      });
    } catch (exception) {
      return new Promise(function (resolve, reject) {
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
   * @param {File} file
   * @param {String} expandedKey
   * @param {String} locatorToken
   * @return {Promise<ServerResponse<{payload:File}>>}} A Promise of the response containing encrypted File.
   */
  encryptFile = function (file, expandedKey, locatorToken) {
    try {
      const self = this;
      self.sdk.validateAccessToken();

      this.key = new TextEncoder().encode(expandedKey);
      let token = new TextEncoder().encode(locatorToken);
      let stream = new ReadableStream({
        async start(controller) {
          controller.enqueue(
            new Uint8Array(new Uint32Array([token.length]).buffer)
          );
          controller.enqueue(token);

          const name = self.doEncrypt(new TextEncoder().encode(file.name));
          self.keyPos = 0;
          controller.enqueue(
            new Uint8Array(new Uint32Array([name.length]).buffer)
          );
          controller.enqueue(name);

          const chunk = await new Response(file).arrayBuffer();
          controller.enqueue(self.doEncrypt(new Uint8Array(chunk)));

          // Close the controller once we are done
          controller.close();
        },
        pull(controller) {
          controller.desiredSize;
        },
        cancel() {},
      });

      return new Response(stream, {
        headers: { "Content-Type": "octet/stream" },
      })
        .blob()
        .then(
          function (bob) {
            return new Promise(function (resolve, reject) {
              resolve(
                new ServerResponse(
                  ServerResponse.OK,
                  200,
                  new File([bob], `${file.name}.xqf`)
                )
              );
            });
          },
          function (e) {
            console.error(e);
            return null;
          }
        );
    } catch (exception) {
      return new Promise(function (resolve, reject) {
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
   *
   * @param {Uint8Array}data
   * @return {Uint8Array}
   */
  doEncrypt = function (data) {
    const result = new Uint8Array(data.length);
    for (let i = 0; i < result.length; i++) {
      // eslint-disable-next-line no-bitwise
      result[i] = data[i] ^ this.key[this.keyPos % this.key.length];
      this.keyPos += 1;
    }
    return result;
  };

  /**
   * Takes an encrypted OTPv2 text string and attempts to decrypt with the provided key.
   *
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
          let payload = atob(text);

          let encoder = new TextEncoder("utf8");

          const keyBytes = encoder.encode(key);
          const payloadBytes = encoder.encode(payload);

          const j = [];

          for (let idx = 0; idx < payloadBytes.length; ++idx) {
            let mi = idx % keyBytes.length;
            j.push(payloadBytes[idx] ^ keyBytes[mi]);
          }

          let encoded = new TextDecoder("utf8").decode(new Uint8Array(j));

          try {
            const decoded = decodeURIComponent(encoded);
            resolve(
              new ServerResponse(ServerResponse.OK, 200, {
                [EncryptionAlgorithm.DECRYPTED_TEXT]: decoded,
              })
            );
          } catch (exception) {
            resolve(
              new ServerResponse(ServerResponse.ERROR, 500, exception.message)
            );
          }
        } catch (exception) {
          resolve(
            new ServerResponse(ServerResponse.ERROR, 500, exception.message)
          );
        }
      });
    } catch (exception) {
      return new Promise(function (resolve, reject) {
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
   * Takes a string and XOR's it with a quantum key.
   *  XOR a.k.a Exclusive Disjunction means: output true only when inputs differ.
   * @param  {String} text The text to encrypt.
   * @param  {String} key The encryption key.
   * @see #encodeURIComponent function encodeURIComponent (built-in since ES-5)
   * @return {String} The encrypted text.
   */
  exclusiveDisjunction = function (text, key) {
    try {
      let encoder = new TextEncoder("utf8");

      let keyBytes = encoder.encode(key);
      let payloadBytes = encoder.encode(encodeURIComponent(text));

      let j = [];

      for (let idx = 0; idx < payloadBytes.length; ++idx) {
        let mi = idx % keyBytes.length;
        j.push(payloadBytes[idx] ^ keyBytes[mi]);
      }

      let decoder = new TextDecoder("utf8");
      let dt = decoder.decode(new Uint8Array(j));

      return btoa(dt);
    } catch (err) {
      console.info("ERROR: " + err.message);
      return err.message;
    }
  };

  /**
   * A function to fetch the encryption key stored on the server.
   * @callback Function<String,String>
   * @param {String} locatorToken - The locator token used to fetch the key stored on the server.
   * @return {String} the encryption key
   */
  /**
   *
   * @param {File} file
   * @param {Function<String,String>} retrieveKeyFunction
   * @return {Promise<ServerResponse<{payload:File}>>}
   */
  decryptFile = function (file, retrieveKeyFunction) {
    try {
      const self = this;
      self.sdk.validateAccessToken();

      return new Promise(function (resolve, reject) {
        let parsedFile;
        return self
          .parseFileForDecrypt(file)
          .then(function (pf) {
            parsedFile = pf;
            return retrieveKeyFunction(pf.locator);
          })
          .then(function (key) {
            const result = self.doDecrypt(parsedFile, key);
            let file = result[0];
            let name = result[1];
            resolve(new ServerResponse(ServerResponse.OK, 200, file));
          });
      });
    } catch (exception) {
      return new Promise(function (resolve, reject) {
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

  doDecrypt = function (parsed, keyString) {
    const key = new TextEncoder().encode(keyString);
    const fileName = this.decryptUint(parsed.nameEncrypted, key);
    const content = this.decryptUint(parsed.contentEncrypted, key);
    return [
      new File([content], new TextDecoder().decode(fileName)),
      new TextDecoder().decode(fileName),
    ];
  };

  /**
   *
   * @param {Uint8Array} encrypted
   * @param {Uint8Array} key
   * @return {Uint8Array}
   */
  decryptUint = function (encrypted, key) {
    const result = new Uint8Array(encrypted.length);
    for (let i = 0; i < result.length; i++) {
      // eslint-disable-next-line no-bitwise
      result[i] = encrypted[i] ^ key[i % key.length];
    }
    return result;
  };

  /**
     *
     * @param {File} file
     @return {Promise<{locator,nameEncrypted, contentEncrypted}>}
     */
  parseFileForDecrypt = function (file) {
    return new Promise(function (resolve, reject) {
      // Fetch the length of the token and the actual token. Wrapping in the "Response"
      // class because Safari does not support Blob.arrayBuffer
      resolve(
        file.arrayBuffer().then(function (buffer) {
          let pos = 0;
          const locatorSize = new Uint32Array(buffer.slice(pos, pos + 4))[0];
          if (locatorSize > 256) {
            throw new Error(
              "Unable to decrypt file, check that the file is valid and not damaged"
            );
          }
          pos += 4;
          const locator = new TextDecoder().decode(
            new Uint8Array(buffer.slice(pos, locatorSize + pos))
          );
          pos += locatorSize;
          const fileNameSize = new Uint32Array(buffer.slice(pos, pos + 4))[0];
          if (fileNameSize < 2 || fileNameSize > 2000) {
            throw new Error(
              "Unable to decrypt file, check that the file is valid and not damaged"
            );
          }
          pos += 4;
          const nameEncrypted = new Uint8Array(
            buffer.slice(pos, fileNameSize + pos)
          );
          pos += fileNameSize;

          return {
            locator: locator,
            nameEncrypted: nameEncrypted,
            contentEncrypted: new Uint8Array(buffer.slice(pos)),
          };
        })
      );
    });
  };
}
