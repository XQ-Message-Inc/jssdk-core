/* eslint-disable */
// noinspection JSAnnotator,JSUnusedGlobalSymbols,JSUnresolvedVariable
// Web Crypto API

// Import for react version only. When updating WebCrypto, this line should be kept.
import {Cipher} from "./fallback";

function getPluginIdByPlatform() {
    // Mac
    // noinspection JSDeprecatedSymbols
    if (window.navigator.platform.indexOf('Mac') === 0)
        return 'gjnghejleahjohegmhmlgcbdepooepjp';
    // Windows
    else return 'ocgbmljkedabblppmkajjaclloemeahl';
}

export const XQWebCrypto = {

    derivationFn: 'PBKDF2',
    version: 1,
    maxBuffer: 32000000, // max 32mb slices.

    base64Encode: function (arrayBuffer) {
        var base64 = ''
        var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

        var bytes = new Uint8Array(arrayBuffer)
        var byteLength = bytes.byteLength
        var byteRemainder = byteLength % 3
        var mainLength = byteLength - byteRemainder

        var a, b, c, d
        var chunk

        // Main loop deals with bytes in chunks of 3
        for (var i = 0; i < mainLength; i = i + 3) {
            // Combine the three bytes into a single integer
            chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

            // Use bitmasks to extract 6-bit segments from the triplet
            a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
            b = (chunk & 258048) >> 12 // 258048   = (2^6 - 1) << 12
            c = (chunk & 4032) >> 6 // 4032     = (2^6 - 1) << 6
            d = chunk & 63               // 63       = 2^6 - 1

            // Convert the raw binary segments to the appropriate ASCII encoding
            base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
        }

        // Deal with the remaining bytes and padding
        if (byteRemainder === 1) {
            chunk = bytes[mainLength]

            a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

            // Set the 4 least significant bits to zero
            b = (chunk & 3) << 4 // 3   = 2^2 - 1

            base64 += encodings[a] + encodings[b] + '=='
        } else if (byteRemainder === 2) {
            chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

            a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
            b = (chunk & 1008) >> 4 // 1008  = (2^6 - 1) << 4

            // Set the 2 least significant bits to zero
            c = (chunk & 15) << 2 // 15    = 2^4 - 1

            base64 += encodings[a] + encodings[b] + encodings[c] + '='
        }

        return base64
    },


    base64Decode: function (str) {
        return new Uint8Array(atob(str).split('').map(c => c.charCodeAt(0)));
    },

    createFileHeader: async function (filename, token, algorithm) {

        var tokenSize = 43;
        var tokenBytes = new TextEncoder().encode(token);

        // Get the encrypted filename bytes ( string or Uint8array )
        var nameBytes = (typeof filename === 'string') ? new TextEncoder().encode(filename) : filename;

        // Get the encrypted filename length
        var nameSize = nameBytes.length;
        var tail = 0;

        //  Version Bytes (4), Token Length, Name Length (4), Name
        var buffer = new Uint8Array(4 + tokenSize + 4 + nameSize + 1);

        // Write the version number + token size (43)
        buffer.set(new Uint32Array([tokenSize + this.version]), tail);
        tail += 4;

        buffer.set(tokenBytes, tail);
        tail += tokenSize;

        buffer.set(new Uint32Array([nameSize]), tail);
        tail += 4;

        if (nameSize > 0) {
            buffer.set(nameBytes, tail);
        }
        tail += nameSize;

        // Write the algorithm mode (1 byte)
        buffer.set(algorithm.scheme, tail);

        return buffer;
    },

    getFileHeader: async function (data) {

        var view = data;
        var tail = 0;
        var tokenSize = 43;
        var result = {version: this.version, length: 0};

        // Read the version.
        var v = Uint32Array.from(view.slice(tail, tail + 4))[0] ?? 0;
        result.version = (v - tokenSize);
        if (result.version !== this.version && v !== tokenSize) {
            console.warn('Cannot decrypt due to incompatible version: ' + result.version);
            return result; // Incompatible version.
        }

        tail += 4;
        result.token = new TextDecoder().decode(view.slice(tail, tail + tokenSize));
        tail += tokenSize;

        var nameSize = Uint32Array.from(view.slice(tail, tail + 4))[0];
        tail += 4;

        if (nameSize > 0) {
            result.filename = view.slice(tail, tail + nameSize);
            tail += nameSize;
        } else {
            result.filename = "";
        }
        if (result.version > 0) {
            // Skip over the scheme (only used in native SDK for noww)
            //var scheme = view.slice(tail, tail + 1);
            //console.info("File Scheme: " + XQWebCrypto.auto.algorithmForScheme(scheme.toString()).algorithm);
            tail += 1;
        }
        result.length = tail;
        return result;
    },

    _getIV: function (ivLength, hash) {
        const randomData = XQWebCrypto.base64Encode(window.crypto.getRandomValues(new Uint8Array(ivLength)));
        return this._pbkdf2(randomData, new TextEncoder('utf-8').encode(new Date().getTime().toString()),
            1, ivLength, hash);
    },


    _pbkdf2: async function (message, salt, iterations, keyLen, algorithm) {
        const msgUint8Array = new TextEncoder('utf-8').encode(message);
        const key = await crypto.subtle.importKey('raw', msgUint8Array, {
            name: this.derivationFn
        }, false, ['deriveBits']);

        const buffer = await crypto.subtle.deriveBits({
            name: this.derivationFn,
            salt: salt,
            iterations: iterations,
            hash: algorithm
        }, key, keyLen * 8);
        return new Uint8Array(buffer);
    },

    _encryptBlock: async function (iterations, salt, keyLength, ivLength, hash, algorithm, data, password, raw, prefix) {

        if (password[0] === '.') password = password.slice(2);

        var hashKey;

        try {
            hashKey = await this._pbkdf2(password, salt, iterations, keyLength, hash);
        } catch (e) {
            console.error(e);
            throw  e;
        }

        const key = await window.crypto.subtle.importKey(
            'raw',
            hashKey, {
                name: algorithm
            },
            false,
            ['encrypt']
        );

        var src = {name: algorithm};

        if (algorithm === 'AES-CTR') {
            src.counter = window.crypto.getRandomValues(new Uint8Array(ivLength));
            src.counter.fill(0, 8); // Reset counter before encryption.
            src.iv = src.counter;
            src.length = 64;
        } else {
            src.iv = await this._getIV(ivLength, hash);
            src.tag = 128;
        }

        const encrypted = await window.crypto.subtle.encrypt(src,
            key,
            (raw === true) ? data : new TextEncoder('utf-8').encode(data)
        );

        if (algorithm === 'AES-CTR') {
            window.crypto.getRandomValues(src.iv.subarray(8, 16));
        }

        if (prefix) {
            var len = prefix.length + src.iv.length + encrypted.byteLength;
            var buf = new Uint8Array(len);
            buf.set(prefix, 0);
            buf.set(src.iv, prefix.length);
            buf.set(new Uint8Array(encrypted), prefix.length + src.iv.length);
            if (!raw) {
                return XQWebCrypto.base64Encode(buf)
            } else return buf;
        } else {
            const result = Array.from(src.iv).concat(Array.from(new Uint8Array(encrypted)));
            if (!raw) {
                return XQWebCrypto.base64Encode(new Uint8Array(result))
            } else return new Uint8Array(result);
        }
    },


    _decryptBlock: async function (iterations, keyLength, ivLength,
                                   saltLength, hash, algorithm, ciphertext, password, raw) {

        if (password[0] === '.') password = password.slice(2);

        var salt;
        const decoder = new TextDecoder('utf-8');
        var decodedData = (raw) ? ciphertext : this.base64Decode(ciphertext);
        var prefix = decoder.decode(decodedData.slice(0, 8));

        if (prefix === 'Salted__') {
            salt = decodedData.slice(8, 8 + saltLength);
        }

        const ciphertextBuffer = raw ? ciphertext.slice(8 + saltLength) : decodedData.slice(8 + saltLength);

        const hashKey = (iterations === 1 && algorithm === 'AES-CBC') ? new TextEncoder('utf-8').encode(password)
            : await this._pbkdf2(password, salt, iterations, keyLength, hash);
        console.log("DECRYPTION HASH KDF: ", hashKey);
        const key = await window.crypto.subtle.importKey(
            'raw',
            hashKey, {
                name: algorithm
            },
            false,
            ['decrypt']
        );

        var src = {
            name: algorithm
        };

        if (algorithm === 'AES-CTR') {
            src.counter = new Uint8Array(ciphertextBuffer.slice(0, ivLength));
            src.counter.fill(0, 8);
            src.length = 64;
        } else {
            src.iv = new Uint8Array(ciphertextBuffer.slice(0, ivLength));
        }

        const decrypted = await window.crypto.subtle.decrypt(src,
            key,
            new Uint8Array(ciphertextBuffer.slice(ivLength))
        );

        if (raw === true) {
            return new Uint8Array(decrypted);
        } else {
            return new TextDecoder().decode(new Uint8Array(decrypted));
        }
    },

    _encryptFile: async function (algo, filename, byteContent, token, password, onComplete) {
        filename = filename ? new TextEncoder().encode(filename) : null;
        if (filename) {
            try {
                filename = await algo.encrypt(filename, password, true, null);
            } catch (err) {
                onComplete(false, err.message ?? err);
                return;
            }
        }
        XQWebCrypto.createFileHeader(filename, token, algo).then(function (header) {
            algo.encrypt(byteContent, password, true, header).then(function (encrypted) {
                onComplete(true, encrypted);
            }).catch(function (err) {
                onComplete(false, err.message ?? err);
            });
        }).catch(function (err) {
            onComplete(false, err.message ?? err);
        });
    },

    _decryptFile: async function (algo, byteContent, onFetchPassword, onComplete) {
        var data = new Uint8Array(byteContent);
        return XQWebCrypto.getFileHeader(data).then(function (header) {
            var buf = data.slice(header.length);
            onFetchPassword(header.token, async function (password) {
                if (header.filename) {
                    try {
                        header.filename = await algo.decrypt(header.filename, password, true);
                        header.filename = new TextDecoder("utf-8").decode(header.filename);
                    } catch (err) {
                        onComplete(false, err.message ?? err);
                        return;
                    }
                }
                algo.decrypt(buf, password, true).then(
                    function (decrypted) {
                        onComplete(true, header.filename, decrypted);
                    });
            });
        }).catch(function (err) {
            onComplete(false, err.message ?? err);
        });
    },

    decryptFile: async function (byteContent, onFetchPassword, onComplete) {
        return XQWebCrypto._decryptFile(this, byteContent, onFetchPassword, onComplete);
    },

    addHeaderSalt: function (header, saltSize) {

        const salt = window.crypto.getRandomValues(new Uint8Array(saltSize));
        const saltCode = new TextEncoder().encode("Salted__");

        if (!header) {
            header = new Uint8Array(8 + saltSize);
            header.set(saltCode, 0);
            header.set(salt, 8);
        } else {
            var expanded = new Uint8Array(8 + saltSize + header.length);
            expanded.set(header, 0);
            expanded.set(saltCode, header.length);
            expanded.set(salt, header.length + 8);
            header = expanded;
        }

        console.info('Set salt of ' + saltSize + ' bytes');
        console.info(salt);
        return {header: header, salt: salt};
    },

    gcm: {
        algorithm: 'AES-GCM',
        hash: 'SHA-256',
        iterations: 1024,
        ivLength: 12,
        keyLength: 32,
        saltLength: 16,
        scheme: '1',
        encrypt: async function (data, password, raw = false, header = null) {
            const c = XQWebCrypto.addHeaderSalt(header, this.saltLength);
            return XQWebCrypto._encryptBlock(this.iterations, c.salt, this.keyLength, this.ivLength,
                this.hash, this.algorithm, data, password, raw, c.header);
        },
        decrypt: async function (ciphertext, password, raw = true) {
            return XQWebCrypto._decryptBlock(this.iterations, this.keyLength, this.ivLength,
                this.saltLength, this.hash, this.algorithm, ciphertext, password, raw)
        },
        encryptFile: async function (filename, token, password, byteContent, onComplete) {
            return XQWebCrypto._encryptFile(this, filename, byteContent, token,
                password, onComplete);
        },
        decryptFile: async function (byteContent, onFetchPassword, onComplete) {
            return XQWebCrypto._decryptFile(this, byteContent, onFetchPassword, onComplete)
                .catch(function (err) {
                    onComplete(false, err.message ?? err)
                });

        }
    },
    // Counter mode encrpytion.
    ctr: {
        algorithm: 'AES-CTR',
        hash: 'SHA-256',
        iterations: 2048,
        ivLength: 16,
        keyLength: 32,
        saltLength: 16,
        scheme: '2',
        encrypt: async function (data, password, raw = false, header = null) {
            const c = XQWebCrypto.addHeaderSalt(header, this.saltLength);
            return XQWebCrypto._encryptBlock(this.iterations, c.salt, this.keyLength, this.ivLength,
                this.hash, this.algorithm, data, password, raw, c.header);
        },
        decrypt: async function (ciphertext, password, raw = true) {
            return XQWebCrypto._decryptBlock(this.iterations, this.keyLength, this.ivLength,
                this.saltLength, this.hash, this.algorithm, ciphertext, password, raw);
        },
        encryptFile: async function (filename, token, password, byteContent, onComplete) {
            return XQWebCrypto._encryptFile(this, filename, byteContent, token,
                password, onComplete);
        },
        decryptFile: async function (byteContent, onFetchPassword, onComplete) {
            return XQWebCrypto._decryptFile(this, byteContent, onFetchPassword, onComplete);
        }
    },

    stream: {
        algorithm: 'AES-CTR',
        hash: 'SHA-256',
        iterations: 1024,
        ivLength: 0,
        keyLength: 32,
        saltLength: 0,
        scheme: 'C',
        encrypt: async function (data, password, raw = false, header = null) {
            const c = XQWebCrypto.addHeaderSalt(header, this.saltLength);
            return XQWebCrypto._encryptBlock(this.iterations, c.salt, this.keyLength, this.ivLength,
                this.hash, this.algorithm, data, password, raw, c.header);
        },
        decrypt: async function (ciphertext, password, raw = true) {
            return XQWebCrypto._decryptBlock(this.iterations, this.keyLength, this.ivLength,
                this.saltLength, this.hash, this.algorithm, ciphertext, password, raw);
        },
        encryptFile: async function (filename, token, password, byteContent, onComplete) {
            return XQWebCrypto._encryptFile(this, filename, byteContent, token,
                password, onComplete);
        },
        decryptFile: async function (byteContent, onFetchPassword, onComplete) {
            return XQWebCrypto._decryptFile(this, byteContent, onFetchPassword, onComplete);
        }
    },

    fallback: {
        algorithm: 'AES-CBC',
        hash: 'MD5',
        iterations: 1,
        ivLength: 8,
        keyLength: 32,
        saltLength: 8,
        scheme: 'A',
        encrypt: async function (data, password, raw = false, header = null) {
            if (password[0] === '.') password = password.slice(2);
            var decoded;
            var cipher = new Cipher(password);
            if (!raw) {

                decoded = cipher.encrypt(data).toString();
            } else {
                var encoded = XQWebCrypto.base64Encode(data);
                var encrypted = cipher.encrypt(encoded);
                decoded = new TextEncoder().encode(encrypted);
            }

            if (header) {
                var len = header.length + decoded.length;
                var buf = new Uint8Array(len);
                buf.set(header, 0);
                buf.set(decoded, header.length);
                if (!raw) {
                    return XQWebCrypto.base64Encode(buf);
                } else return buf;
            } else {
                return decoded;
            }
        },
        decrypt: async function (ciphertext, password, raw = false) {
            if (password[0] === '.') password = password.slice(2);
            var cipher = new Cipher(password);
            if (!raw) {
                // noinspection JSUnresolvedFunction
                return cipher.decrypt(ciphertext);
            } else {
                var str = new TextDecoder().decode(ciphertext);
                var decrypted = cipher.decrypt(str);
                return XQWebCrypto.base64Decode(decrypted);
            }
        },
        encryptFile: async function (filename, token, password, byteContent, onComplete) {
            return XQWebCrypto._encryptFile(this, filename, byteContent, token,
                password, onComplete);
        },
        decryptFile: async function (byteContent, onFetchPassword, onComplete) {
            return XQWebCrypto._decryptFile(this, byteContent, onFetchPassword, onComplete);
        }
    },
    cbc: {
        algorithm: 'AES-CBC',
        hash: 'SHA-256',
        iterations: 1024,
        ivLength: 16,
        keyLength: 32,
        saltLength: 16,
        scheme: '3',
        encrypt: async function (data, password, raw = false, header = null) {
            const c = XQWebCrypto.addHeaderSalt(header, this.saltLength);
            return XQWebCrypto._encryptBlock(this.iterations, c.salt, this.keyLength, this.ivLength,
                this.hash, this.algorithm, data, password, raw, c.header);
        },
        decrypt: async function (ciphertext, password, raw = false) {
            return XQWebCrypto._decryptBlock(this.iterations, this.keyLength, this.ivLength,
                this.saltLength, this.hash, this.algorithm, ciphertext, password, raw);
        },
        encryptFile: async function (filename, token, password, byteContent, onComplete) {
            return XQWebCrypto._encryptFile(this, filename, byteContent, token,
                password, onComplete);
        },
        decryptFile: async function (byteContent, onFetchPassword, onComplete) {
            return XQWebCrypto._decryptFile(this, byteContent, onFetchPassword, onComplete);
        }

    },
    native: {
        algorithm: 'AES-CTR',
        hash: 'SHA-256',
        iterations: 2048,
        ivLength: 16,
        keyLength: 32,
        saltLength: 16,
        scheme: '5',
        chromeMissing: "Native encryption is not supported on this platform",
        pluginMissing: "Installation of the FIPS helper is required for native encryption",
        pluginId: getPluginIdByPlatform(),
        actions: {
            StatusAction: 0,
            EncryptAction: 1,
            DecryptAction: 2
        },

        encrypt: async function (data, password, raw = false, prefix = null) {

            try {
                if (!window['chrome']) {
                    return Promise.reject(chromeMissing);
                }
                if (!chrome.runtime || !chrome.runtime.sendMessage) {
                    return Promise.reject(pluginMissing);
                }
            } catch (e) {
                return Promise.reject(chromeMissing + ": " + e.message);
            }


            // Ensure that the native plugin is available
            try {
                var status = await XQWebCrypto.native.status()

                if (status !== "OK") {
                    return Promise.reject("The native plugin returned an invalid status: " + status);
                }

            } catch (e) {
                console.error(e);
                return Promise.reject("There was an error loading the native plugin");
            }

            // If this is raw data, we will need to base64 encode before
            // passing to native plugin.
            if (raw) {
                data = XQWebCrypto.base64Encode(data);
            }

            return new Promise((resolve, reject) => {

                let port = chrome.runtime.connect(XQWebCrypto.native.pluginId);

                if (!port) {
                    reject("Failed to connect to native plugin");
                }

                port.onDisconnect.addListener(function () {
                    reject("Native port was disconnected abormally.");
                });

                port.onMessage.addListener(function (response, port) {
                    console.info('received data on port: ', response);
                    try {
                        if (response.length) {
                            console.info("New response length: ", response.length);
                            port.expectedLength = response.length;
                            port.dataBuffer = '';
                        } else if (response.part) {
                            console.info("New response part: ", response.part);
                            port.dataBuffer += response.part;
                            if (port.dataBuffer.length >= port.expectedLength) {
                                console.info("All incoming data successfully buffered.");
                                port.disconnect();
                                if (raw) {
                                    port.dataBuffer = XQWebCrypto.base64Decode(port.dataBuffer);
                                    if (prefix) {
                                        var len = prefix.length + port.dataBuffer.length;
                                        var buf = new Uint8Array(len);
                                        buf.set(prefix, 0);
                                        buf.set(port.dataBuffer, prefix.length);
                                        resolve(buf);
                                    } else resolve(port.dataBuffer);
                                } else {
                                    resolve(port.dataBuffer);
                                }
                            }
                        } else {
                            console.error("Native call returned with an error", response);
                            port.disconnect();
                            if (response.error) {
                                reject(response.error);
                            } else reject();

                        }
                    } catch (e) {
                        port.disconnect();
                        reject(e.message);
                    }

                    //port.disconnect();
                });

                // Post all the message parts.
                var current = 0;
                var remaining = data.length;

                port.postMessage({
                        action: XQWebCrypto.native.actions.EncryptAction,
                        pwd: password,
                        length: remaining,
                        raw: raw ? 1 : 0,
                        type: 'native'
                    }
                );

                while (remaining > 0 && port) {
                    var sliceLength = (remaining >= XQWebCrypto.maxBuffer) ? XQWebCrypto.maxBuffer : remaining;
                    port.postMessage({type: "part", data: data.slice(current, current + sliceLength)});
                    data.slice(current, current + sliceLength);
                    current += sliceLength;
                    remaining = data.length - current;
                }

            });
        },
        decrypt: async function (ciphertext, password, raw = false) {

            try {
                if (!window['chrome'] || !chrome.runtime || !chrome.runtime.sendMessage) {
                    console.warn('Native plugin not available. Attempt local CTR decryption.');
                    return XQWebCrypto.ctr.decrypt(ciphertext, password, raw);
                }
            } catch (e) {
                console.warn('Native plugin not available. Attempt local CTR decryption.');
                return XQWebCrypto.ctr.decrypt(ciphertext, password, raw);
            }

            // Ensure that the native plugin is available
            const nativeStatus = await XQWebCrypto.native.status();
            if (nativeStatus !== "OK") {
                console.warn('Native plugin not available. Attempt local CTR decryption.');
                return XQWebCrypto.ctr.decrypt(ciphertext, password, raw);
            }

            if (raw) {
                ciphertext = XQWebCrypto.base64Encode(ciphertext);
            }

            return new Promise((resolve, reject) => {

                let port = chrome.runtime.connect(XQWebCrypto.native.pluginId);

                if (!port) {
                    reject("Failed to connect to native plugin");
                }

                port.onDisconnect.addListener(function () {
                    reject("Native port was disconnected abormally.");
                });

                port.onMessage.addListener(function (response) {

                    try {
                        if (response.length) {
                            console.info("New response length: ", response.length);
                            port.expectedLength = response.length;
                            port.dataBuffer = '';
                        } else if (response.part) {
                            port.dataBuffer += response.part;
                            if (port.dataBuffer.length >= port.expectedLength) {
                                console.info("All incoming data successfully buffered: ", port.dataBuffer);
                                port.disconnect();
                                try {
                                    if (raw) {
                                        resolve(XQWebCrypto.base64Decode(port.dataBuffer));
                                    } else resolve(atob(port.dataBuffer));
                                } catch (e) {
                                    reject(e.message);
                                }

                            }
                        } else {
                            console.error("Native call returned with an error", response);
                            port.disconnect();
                            if (response.error) {
                                reject(atob(response.error));
                            } else reject();

                        }
                    } catch (e) {
                        port.disconnect();
                        reject(e.message);
                    }
                });

                // Post all the message parts.
                var current = 0;
                var remaining = ciphertext.length;

                port.postMessage({
                        action: XQWebCrypto.native.actions.DecryptAction,
                        pwd: password,
                        length: remaining,
                        type: 'native'
                    }
                );

                while (remaining > 0 && port) {
                    var sliceLength = (remaining >= XQWebCrypto.maxBuffer) ? XQWebCrypto.maxBuffer : remaining;
                    port.postMessage({type: "part", data: ciphertext.slice(current, current + sliceLength)});
                    ciphertext.slice(current, current + sliceLength);
                    current += sliceLength;
                    remaining = ciphertext.length - current;
                }

            });
        },
        encryptFile: async function (filename, token, password, byteContent, onComplete) {
            return XQWebCrypto._encryptFile(XQWebCrypto.native, filename, byteContent, token,
                password, onComplete);
        },
        decryptFile: async function (byteContent, onFetchPassword, onComplete) {
            return XQWebCrypto._decryptFile(XQWebCrypto.native, byteContent, onFetchPassword, onComplete);
        },
        status: function () {
            return new Promise((resolve) => {
                if (!window['chrome']) {
                    return resolve(XQWebCrypto.native.chromeMissing);
                }
                if (!chrome.runtime || !chrome.runtime.sendMessage) {
                    return resolve(XQWebCrypto.native.pluginMissing);
                }
                // Check whether this is a valid platform.
                chrome.runtime.sendMessage(XQWebCrypto.native.pluginId, {
                    action: 0,
                    type: 'status'
                }, async function (response) {
                    if (response && response.status) {
                        resolve(response.status);
                    } else {
                        resolve("Unavailable");
                    }
                });
            });
        }

    },
    otp: {
        algorithm: 'OTP',
        scheme: 'B',
        fileScheme: 'X',
        encrypt: async function (data, password, raw = false, header = null) {

            if (password[0] === '.') password = password.slice(2);

            var encoder = new TextEncoder("utf8");
            var keyBytes = encoder.encode(password);
            var payloadBytes = (raw) ? new Uint8Array(data) : encoder.encode(data);
            var j = [];

            for (var idx = 0; idx < payloadBytes.length; ++idx) {
                var mi = idx % keyBytes.length;
                j.push(payloadBytes[idx] ^ keyBytes[mi]);
            }

            if (header) {
                var mergedArray = new Uint8Array(header.length + j.length);
                mergedArray.set(header);
                mergedArray.set(j, header.length);
                j = mergedArray;
            }

            if (raw) return j;

            return XQWebCrypto.base64Encode(j);
        },

        decrypt: async function (ciphertext, password, raw = true) {

            if (password[0] === '.') password = password.slice(2);

            var encoder = new TextEncoder();
            var keyBytes = encoder.encode(password);
            var payloadBytes = (raw) ? new Uint8Array(ciphertext) : XQWebCrypto.base64Decode(ciphertext);
            var j = [];

            for (var idx = 0; idx < payloadBytes.length; ++idx) {
                var mi = idx % keyBytes.length;
                j.push(payloadBytes[idx] ^ keyBytes[mi]);
            }

            if (raw) {
                return j;
            }

            var encoded = new TextDecoder("utf8").decode(new Uint8Array(j));
            try {
                return (encoded);
            } catch (e) {
                return encoded;
            }
        },

        encryptFile: async function (filename, token, password, byteContent, onComplete) {
            return XQWebCrypto._encryptFile(this, filename, byteContent, token,
                password, onComplete);
        },
        decryptFile: async function (byteContent, onFetchPassword, onComplete) {
            return XQWebCrypto._decryptFile(this, byteContent, onFetchPassword, onComplete)
                .catch(function (err) {
                    onComplete(false, err.message ?? err)
                });
        }
    },
    auto: {
        algorithmForScheme: function (scheme) {
            switch (scheme) {
                case XQWebCrypto.ctr.scheme:
                    return XQWebCrypto.ctr;
                case XQWebCrypto.cbc.scheme:
                    return XQWebCrypto.cbc;
                case XQWebCrypto.gcm.scheme:
                    return XQWebCrypto.gcm;
                case XQWebCrypto.otp.scheme:
                    return XQWebCrypto.otp;
                case XQWebCrypto.native.scheme:
                    return XQWebCrypto.native;
                case XQWebCrypto.otp.fileScheme:
                    return XQWebCrypto.otp;
                default:
                    return XQWebCrypto.fallback;
            }
        },
        schemeForName: function (name) {
            switch (name) {
                case XQWebCrypto.ctr.algorithm:
                case "CTR":
                    return XQWebCrypto.ctr.scheme;

                case XQWebCrypto.cbc.algorithm:
                case "CBC":
                    return XQWebCrypto.cbc.scheme;

                case XQWebCrypto.gcm.algorithm:
                case "GCM":
                    return XQWebCrypto.gcm.scheme;

                case XQWebCrypto.otp.algorithm:
                    return XQWebCrypto.otp.scheme;

                case XQWebCrypto.native.scheme:
                case "FIPS":
                    return XQWebCrypto.native.scheme;
                default:
                    return null;
            }
        },
        encrypt: async function (data, password, raw = false) {
            var algo = XQWebCrypto.fallback;
            if (password[0] === '.') {
                var scheme = password[1];
                algo = XQWebCrypto.auto.algorithmForScheme(scheme);
                if (!algo) return Promise.reject(new Error("Invalid scheme: " + scheme));
            } else {
                password = '.' + algo.scheme + password;
            }
            return algo.encrypt(data, password, raw);
        },
        decrypt: async function (ciphertext, password, raw = false) {
            var algo = XQWebCrypto.fallback;
            if (password[0] === '.') {
                var scheme = password[1];
                algo = XQWebCrypto.auto.algorithmForScheme(scheme);
                if (!algo) return Promise.reject(new Error("Invalid scheme: " + scheme));
            } else {
                password = '.' + algo.scheme + password;
            }
            return algo.decrypt(ciphertext, password, raw);
        },
        encryptFile: async function (filename, token, password, byteContent, onComplete) {
            var algo = XQWebCrypto.fallback;
            if (password[0] === '.') {
                var scheme = password[1];
                algo = XQWebCrypto.auto.algorithmForScheme(scheme);
                if (!algo) return onComplete(false, "Invalid scheme: " + scheme);
            } else {
                password = '.' + algo.scheme + password;
            }
            return algo.encryptFile(filename, token, password, byteContent, onComplete);
        },
        decryptFile: async function (byteContent, onFetchPassword, onComplete) {
            var data = new Uint8Array(byteContent);
            return XQWebCrypto.getFileHeader(data).then(function (header) {
                var buf = data.slice(header.length);
                onFetchPassword(header.token, async function (password, error) {
                    if (error) {
                        return onComplete(false, error);
                    }
                    var algo = XQWebCrypto.fallback;
                    if (password[0] === '.') {
                        var scheme = password[1];
                        algo = XQWebCrypto.auto.algorithmForScheme(scheme);
                        if (!algo) return onComplete(false, "Invalid scheme: " + scheme);
                    } else {
                        password = '.' + algo.scheme + password;
                    }
                    if (header.filename) {
                        try {
                            header.filename = await algo.decrypt(header.filename, password, true)
                                .then(function (filename) {
                                    var encodedName = decodeURIComponent(
                                        new TextDecoder("utf8").decode(new Uint8Array(filename))
                                    );
                                    algo.decrypt(buf, password, true).then(
                                        function (decrypted) {
                                            onComplete(true, encodedName, decrypted);
                                        }).catch(function (reason) {
                                        console.error(reason);
                                        onComplete(false, "Failed to decrypt data for " + header.filename);
                                    });
                                }).catch(function (reason) {
                                    console.error(reason);
                                    onComplete(false, "Failed to decrypt file properties");
                                });

                        } catch (err) {
                            onComplete(false, err.message ?? err);
                        }
                    } else {
                        onComplete(false, "Failed to get filename data");
                    }
                });
            }).catch(function (err) {
                onComplete(false, err.message ?? err);
            });
        }
    }
};

