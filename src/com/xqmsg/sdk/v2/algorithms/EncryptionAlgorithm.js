
/**
 * @class
 * Super class for Encryption Algorithms supported by XQ Message: <br>
 * AESEncryption <br> OTPv2Encryption
 */
export default class EncryptionAlgorithm{

    constructor(sdk) {
        this.sdk = sdk;
    }
    expandKey = function (k, extendTo) {
        let key = k.replace(/\n$/,'');
        if (key.length > extendTo) {
            return shuffle(key.substring(0, extendTo));
        }
        let g = key;
        while (g.length < extendTo) {
            g += this.shuffle(key);
        }
        return g;
    }

    shuffle = function(s) {
        const a = s.split('');
        const n = a.length;
        for (let i = n - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = a[i];
            a[i] = a[j];
            a[j] = tmp;
        }
        return a.join('');
    }

}

EncryptionAlgorithm.prototype.ENCRYPTED_TEXT = 'encrpytedText';
EncryptionAlgorithm.prototype.DECRYPTED_TEXT = 'decryptedText';
EncryptionAlgorithm.prototype.KEY = 'key';