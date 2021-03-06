import EncryptionAlgorithm from "./EncryptionAlgorithm";
import ServerResponse from "../ServerResponse";
import { XQEncryptionAlgorithms } from "../XQServicesEnum";
import XQSDK from "../XQSDK";

import handleException from "../exceptions/handleException";

type ParsedFile = {
  locator: string;
  nameEncrypted: Uint8Array;
  contentEncrypted: Uint8Array;
};

/**
 * The btoa() method creates a Base64-encoded ASCII string from a binary string
 * (i.e., a String object in which each character in the string is treated as a byte of binary data).
 *
 * Since `btoa` is a Web API, we provide a fallback for all other environments utilizing `Buffer`
 * @param binaryString - `string`
 * @returns `string`;
 */

const universalBtoa = (binaryString: string) => {
  try {
    return btoa(binaryString);
  } catch (err) {
    return Buffer.from(binaryString).toString("base64");
  }
};

/**
 * The atob() function decodes a string of data which has been encoded using Base64 encoding
 * @param b64Encoded - a `string` encoded using Base64 encoding
 * @returns `string`;
 */
const universalAtob = (b64Encoded: string) => {
  try {
    return atob(b64Encoded);
  } catch (err) {
    return Buffer.from(b64Encoded, "base64").toString();
  }
};

export default class OTPv2Encryption extends EncryptionAlgorithm {
  /**
   * Takes an encrypted file and attempts to decrypt with the provided key.
   * @param  {File} sourceFile - the file to decrypt.
   * @param  {String} key The encryption key.
   * @return {Promise<ServerResponse<{payload:{decryptedText:string}}>>} A Promise of the Response containing the decrypted text.
   */
  decryptFile: (
    sourceFile: File,
    locateFn: (aLocatorToken: string) => Promise<string>
  ) => Promise<ServerResponse>;

  /**
   * Takes an OTPv2 encrypted text string and attempts to decrypt with the provided key.
   * @param  {String} text - the text to decrypt.
   * @param  {String} key - the encryption key.
   * @return {Promise<ServerResponse<{payload:{decryptedText:string}}>>} A Promise of the Response containing the decrypted text.
   */
  decryptText: (text: string, key: string) => Promise<ServerResponse>;

  /**
   * Takes an OTPv2 encrypted Uint8Array and attempts to decrypt with the provided key.
   * @param  {Uint8Array} encrypted - the Uint8Array to decrypt.
   * @param  {String} key - the encryption key.
   * @return {Uint8Array} the decrypted Uint8Array
   */
  decryptUint: (encrypted: Uint8Array, key: Uint8Array) => Uint8Array;

  /**
   * @param {ParsedFile} parsed - the parsed file to be decrypted
   * @return {String} locatorKey - the quantum key used to decrypt the file
   * @return {[File, String]} the decrypted file tuple
   */
  doDecrypt: (parsed: ParsedFile, locatorKey: string) => [File, string];

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

    this.encryptText = (text, key, skipKeyExpansion = false) => {
      try {
        const self = this;
        self.sdk.validateAccessToken();

        return new Promise((resolve) => {
          if (key === "" || key == undefined) {
            console.error("OTPv2 Source Key cannot be empty.");
            resolve(
              new ServerResponse(
                ServerResponse.ERROR,
                500,
                "OTPv2 Source Key cannot be empty."
              )
            );
          }
          const expandedKey = skipKeyExpansion
            ? key
            : self.expandKey(key, 2048);
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
            handleException(exception, XQEncryptionAlgorithms.OTPv2Encryption)
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
            handleException(exception, XQEncryptionAlgorithms.OTPv2Encryption)
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
            const payload = universalAtob(text);

            const encoder = new TextEncoder();

            const keyBytes = encoder.encode(key);
            const payloadBytes = encoder.encode(payload);

            const j = [];

            for (let idx = 0; idx < payloadBytes.length; ++idx) {
              const mi = idx % keyBytes.length;
              j.push(payloadBytes[idx] ^ keyBytes[mi]);
            }

            const encoded = new TextDecoder().decode(new Uint8Array(j));

            try {
              const decoded = decodeURIComponent(encoded);
              resolve(
                new ServerResponse(ServerResponse.OK, 200, {
                  [EncryptionAlgorithm.DECRYPTED_TEXT]: decoded,
                })
              );
            } catch (exception) {
              return new Promise((resolve) => {
                resolve(
                  handleException(
                    exception,
                    XQEncryptionAlgorithms.OTPv2Encryption
                  )
                );
              });
            }
          } catch (exception) {
            return new Promise((resolve) => {
              resolve(
                handleException(
                  exception,
                  XQEncryptionAlgorithms.OTPv2Encryption
                )
              );
            });
          }
        });
      } catch (exception) {
        return new Promise((resolve) => {
          resolve(
            handleException(exception, XQEncryptionAlgorithms.OTPv2Encryption)
          );
        });
      }
    };

    this.exclusiveDisjunction = (text: string, expandedKey: string): string => {
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

      return universalBtoa(dt);
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
            .then((decryptedPayload) => {
              const result = self.doDecrypt(parsedFile, decryptedPayload);
              const file = result[0];
              // const name = result[1];
              resolve(new ServerResponse(ServerResponse.OK, 200, file));
            });
        });
      } catch (exception) {
        return new Promise((resolve) => {
          resolve(
            handleException(exception, XQEncryptionAlgorithms.OTPv2Encryption)
          );
        });
      }
    };

    this.doDecrypt = (parsed, locatorKey) => {
      const key = new TextEncoder().encode(locatorKey);
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

    this.parseFileForDecrypt = async (file) => {
      const buffer = await new Response(file).arrayBuffer();
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
        locator,
        nameEncrypted,
        contentEncrypted: new Uint8Array(buffer.slice(pos)),
      };
    };
  }
}
