import EncryptionAlgorithm from "./EncryptionAlgorithm";
import ServerResponse from "../ServerResponse";
import XQSDK from "../XQSDK";

type ParsedFile = {
  locator: string;
  nameEncrypted: Uint8Array;
  contentEncrypted: Uint8Array;
};

export default class OTPv2Encryption extends EncryptionAlgorithm {
  /**
   * Takes an encrypted file and attempts to decrypt with the provided key.
   * @param  {File} sourceFile - the file to decrypt.
   * @param  {String} key The encryption key.
   * @return {Promise<ServerResponse<{payload:{decryptedText:string}}>>} A Promise of the Response containing the decrypted text.
   */
  decryptFile: (
    file: File,
    retrieveKeyFunction: (locatorKey: string) => string
  ) => Promise<unknown>;

  /**
   * Takes an OTPV2 encrypted text string and attempts to decrypt with the provided key.
   * @param  {String} text - the text to decrypt.
   * @param  {String} key - the encryption key.
   * @return {Promise<ServerResponse<{payload:{decryptedText:string}}>>} A Promise of the Response containing the decrypted text.
   */
  decryptText: (text: string, key: string) => Promise<ServerResponse>;

  /**
   * Takes an OTPV2 encrypted Uint8Array and attempts to decrypt with the provided key.
   * @param  {Uint8Array} encrypted - the Uint8Array to decrypt.
   * @param  {String} key - the encryption key.
   * @return {Uint8Array} the decrypted Uint8Array
   */
  decryptUint: (encrypted: Uint8Array, key: Uint8Array) => Uint8Array;

  /**
   * @param {ParsedFile} parsed - the parsed file to be decrypted
   * @return {String} keyString - the quantum key used to decrypt the file
   * @return {[File, String]} the decrypted file tuple
   */
  doDecrypt: (parsed: ParsedFile, keyString: string) => [File, string];

  /**
   * @param {Uint8Array} data - data to be encrypted
   * @return {Uint8Array}
   */
  doEncrypt: (arg0: Uint8Array) => Uint8Array;

  /**
   * @param {File} file - the file to be encrypted
   * @param {String} expandedKey - a key expanded to the length to that of the text that needs encryption.
   * @param {String} locatorKey - the key used to fetch the encryption key from the server
   * @return {Promise<ServerResponse<{payload:File}>>}} A Promise of the response containing encrypted File.
   */
  encryptFile: (
    sourceFile: File,
    expandedKey: string | void,
    locatorKey: string
  ) => Promise<ServerResponse>;

  /**
   * Takes a string and encrypts it using the provided quantum key.
   *
   * @param  {String} text The text to encrypt.
   * @param  {String} key The encryption key.
   * @return {Promise<ServerResponse>} The encrypted text.
   */
  encryptText: (text: string, key: string) => Promise<ServerResponse>;

  /**
   * Takes a string and XOR's it with a quantum key.
   * XOR a.k.a Exclusive Disjunction means: output true only when inputs differ.
   * @param  {String} text The text to encrypt.
   * @param  {String} key The encryption key.
   * @see #encodeURIComponent function encodeURIComponent (built-in since ES-5)
   * @return {String} The encrypted text.
   */
  exclusiveDisjunction: (text: string, expandedKey: string) => string;

  /** The current key position */
  keyPos: number;

  /** The provided quantum key */
  key: Uint8Array;

  /**
   *
   * @param {File} file
   * @return {Promise<{locator,nameEncrypted, contentEncrypted}>}
   */
  parseFileForDecrypt: (file: File) => Promise<ParsedFile>;

  /** The prefix prepended to an `expandedKey` string  */
  prefix: string;

  constructor(sdk: XQSDK) {
    super(sdk);
    this.prefix = ".X";
    this.keyPos = 0;
    this.key;

    this.encryptText = (text, key) => {
      try {
        const self = this;
        self.sdk.validateAccessToken();

        return new Promise((resolve) => {
          if (key === "" || key == undefined) {
            console.error("OTPV2 Source Key cannot be empty.");
            resolve(
              new ServerResponse(
                ServerResponse.ERROR,
                500,
                "OTPV2 Source Key cannot be empty."
              )
            );
          }
          const expandedKey = self.expandKey(key, 2048);
          if (expandedKey == null) {
            console.error("Key could not be UTF8 encoded.");
            return resolve(
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

    this.encryptFile = (file, expandedKey, locatorKey) => {
      try {
        const self = this;
        self.sdk.validateAccessToken();

        this.key = new TextEncoder().encode(expandedKey as string);
        const token = new TextEncoder().encode(locatorKey);
        const stream = new ReadableStream({
          async start(controller) {
            controller.enqueue(
              new Uint8Array(new Uint32Array([token.length]).buffer)
            );
            controller.enqueue(token);

            const name = self.doEncrypt(
              new TextEncoder().encode(file.name)
            ) as unknown as Uint32Array;
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
              return new Promise((resolve) => {
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
              throw e;
            }
          );
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

    this.doEncrypt = (data) => {
      const result = new Uint8Array(data.length);
      for (let i = 0; i < result.length; i++) {
        result[i] = data[i] ^ this.key[this.keyPos % this.key.length];
        this.keyPos += 1;
      }
      return result;
    };

    this.decryptText = (text, key) => {
      try {
        const self = this;
        self.sdk.validateAccessToken();

        return new Promise((resolve) => {
          try {
            const payload = atob(text);

            const encoder = new TextEncoder();

            const keyBytes = encoder.encode(key);
            const payloadBytes = encoder.encode(payload);

            const j = [];

            for (let idx = 0; idx < payloadBytes.length; ++idx) {
              const mi = idx % keyBytes.length;
              j.push(payloadBytes[idx] ^ keyBytes[mi]);
            }

            const encoded = new TextDecoder("utf8").decode(new Uint8Array(j));

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

    this.exclusiveDisjunction = (text: string, expandedKey: string): string => {
      try {
        const encoder = new TextEncoder();

        const keyBytes = encoder.encode(expandedKey);
        const payloadBytes = encoder.encode(encodeURIComponent(text));

        const j = [];

        for (let idx = 0; idx < payloadBytes.length; ++idx) {
          const mi = idx % keyBytes.length;
          j.push(payloadBytes[idx] ^ keyBytes[mi]);
        }

        const decoder = new TextDecoder();
        const dt = decoder.decode(new Uint8Array(j));

        return btoa(dt);
      } catch (err) {
        console.info("ERROR: " + err.message);
        return err.message;
      }
    };

    this.decryptFile = (file, retrieveKeyFunction) => {
      try {
        const self = this;
        self.sdk.validateAccessToken();

        return new Promise((resolve) => {
          let parsedFile: ParsedFile;
          return self
            .parseFileForDecrypt(file)
            .then((pf) => {
              parsedFile = pf;
              return retrieveKeyFunction(pf.locator);
            })
            .then((key) => {
              const result = self.doDecrypt(parsedFile, key);
              const file = result[0];
              // const name = result[1];
              resolve(new ServerResponse(ServerResponse.OK, 200, file));
            });
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

    this.doDecrypt = (parsed, keyString) => {
      const key = new TextEncoder().encode(keyString);
      const fileName = this.decryptUint(parsed.nameEncrypted, key);
      const content = this.decryptUint(parsed.contentEncrypted, key);

      return [
        new File([content], new TextDecoder().decode(fileName)),
        new TextDecoder().decode(fileName),
      ];
    };

    this.decryptUint = (encrypted, key) => {
      const result = new Uint8Array(encrypted.length);
      for (let i = 0; i < result.length; i++) {
        // eslint-disable-next-line no-bitwise
        result[i] = encrypted[i] ^ key[i % key.length];
      }
      return result;
    };

    this.parseFileForDecrypt = (file) => {
      return new Promise((resolve) => {
        // Fetch the length of the token and the actual token. Wrapping in the "Response"
        // class because Safari does not support Blob.arrayBuffer
        resolve(
          file.arrayBuffer().then((buffer: ArrayBuffer) => {
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
}
