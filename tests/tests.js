import ServerResponse from "./../src/com/xqmsg/sdk/v2/ServerResponse.js";
import NotificationEnum from "./../src/com/xqmsg/sdk/v2/NotificationEnum.js";
import CheckKeyExpiration from "./../src/com/xqmsg/sdk/v2/services/CheckKeyExpiration.js"
import AuthorizeDelegate from "../src/com/xqmsg/sdk/v2/services/AuthorizeDelegate.js"
import Decrypt from "./../src/com/xqmsg/sdk/v2/services/Decrypt.js"
import DeleteAuthorization from "../src/com/xqmsg/sdk/v2/services/DeleteAuthorization.js"
import DeleteSubscriber from "../src/com/xqmsg/sdk/v2/services/DeleteSubscriber.js"
import Encrypt from "./../src/com/xqmsg/sdk/v2/services/Encrypt.js"
import FileEncrypt from "./../src/com/xqmsg/sdk/v2/services/FileEncrypt.js"
import FileDecrypt from "./../src/com/xqmsg/sdk/v2/services/FileDecrypt.js"
import GetUserInfo from "./../src/com/xqmsg/sdk/v2/services/GetUserInfo.js"
import GetSettings from "../src/com/xqmsg/sdk/v2/services/GetSettings.js"
import AuthorizeAlias from "../src/com/xqmsg/sdk/v2/services/AuthorizeAlias.js"
import CheckApiKey from "../src/com/xqmsg/sdk/v2/services/CheckApiKey.js"
import GrantUserAccess from "../src/com/xqmsg/sdk/v2/services/GrantUserAccess.js"
import CombineAuthorizations from "../src/com/xqmsg/sdk/v2/services/CombineAuthorizations.js"
import Authorize from "../src/com/xqmsg/sdk/v2/services/Authorize.js"
import FetchKey from "../src/com/xqmsg/sdk/v2/services/FetchKey.js"
import RevokeKeyAccess from "./../src/com/xqmsg/sdk/v2/services/RevokeKeyAccess.js"
import RevokeUserAccess from "./../src/com/xqmsg/sdk/v2/services/RevokeUserAccess.js"
import UpdateSettings from "../src/com/xqmsg/sdk/v2/services/UpdateSettings.js"
import CodeValidator from "../src/com/xqmsg/sdk/v2/services/CodeValidator.js"
import EncryptionAlgorithm from "./../src/com/xqmsg/sdk/v2/algorithms/EncryptionAlgorithm.js"
import XQSDK from "./../src/com/xqmsg/sdk/v2/XQSDK.js"
import GeneratePacket from "../src/com/xqmsg/sdk/v2/services/GeneratePacket.js";
import ValidatePacket from "../src/com/xqmsg/sdk/v2/services/ValidatePacket.js";


const utf8SamplerFilePath = "./../resources/utf-8-sampler.txt";

const oReq = new XMLHttpRequest();
oReq.open("GET", utf8SamplerFilePath);
oReq.addEventListener("load", function () {

    const xqsdk = new XQSDK();

    let tests = [
        {
            name: 'Test Authorization', enabled: false, statement: function (label) {

                if (this.enabled) {
                    console.warn(label);

                    try {
                        let user = xqsdk.getCache().getActiveProfile(true);
                        let accessToken = xqsdk.getCache().getXQAccess(user, true);
                        console.warn(`The user had already been authorized previously.\nThe authorization token is: ${accessToken}`);
                        return new Promise((resolved, rejectied) => {
                            resolved(true);
                        });

                    } catch (err) {
                        const userEmail = $("#register-input").val();
                        return doAuthorize(userEmail)
                            .then(function (accessToken) {
                                console.warn(`Authorization completed successfully.\nThe access token is: ${accessToken}`);
                            });
                    }

                } else {
                    return new Promise((resolved, rejectied) => {
                        console.warn(label + ' DISABLED');
                        resolved(true);
                    });
                }

            }
        }
        , {
            name: 'Test Get User Info',enabled: true, statement: function (label) {

                if (this.enabled) {
                    console.warn(label);

                    return new GetUserInfo(xqsdk)
                        .supplyAsync(null)
                        .then(function (serverResponse) {
                            switch (serverResponse.status) {
                                case ServerResponse.prototype.OK: {
                                    let data = serverResponse.payload;

                                    let id = data[GetUserInfo.prototype.ID];
                                    let usr = data[GetUserInfo.prototype.USER];
                                    let firstName = data[GetUserInfo.prototype.FIRST_NAME];
                                    let lastName = data[GetUserInfo.prototype.LAST_NAME];
                                    let subscriptionStatus = data[GetUserInfo.prototype.SUBSCRIPTION_STATUS];

                                    console.info("Id: " + id);
                                    console.info("User: " + usr);
                                    console.info("First Name: " + firstName);
                                    console.info("Last Name: " + lastName);
                                    console.info("Subscription Status: " + subscriptionStatus);
                                    return serverResponse;
                                }
                                default: {
                                    let error = serverResponse.payload;
                                    try{ error =  JSON.parse(error).status}catch (e){};
                                    console.error("failed , reason: ", error);
                                    return serverResponse;
                                }

                            }
                        });


                } else {
                    return new Promise((resolved, rejectied) => {
                        console.warn(label + ' DISABLED');
                        resolved(true);
                    });
                }
            }
        }
        , {
            name: 'Test Get User Settings',enabled: true, statement: function (label) {

                if (this.enabled) {
                    console.warn(label);

                    return new GetSettings(xqsdk)
                        .supplyAsync(null)
                        .then(function (serverResponse) {
                            switch (serverResponse.status) {
                                case ServerResponse.prototype.OK: {
                                    let data = serverResponse.payload;

                                    let newsletter = data[GetSettings.prototype.NEWSLETTER];
                                    let notifications = data[GetSettings.prototype.NOTIFICATIONS];

                                    console.info("Receives Newsletters: " + newsletter);
                                    console.info("Notifications: " + NotificationEnum.prototype.parseValue(notifications));
                                    return serverResponse;
                                }
                                default: {
                                    let error = serverResponse.payload;
                                    try{ error =  JSON.parse(error).status}catch (e){};
                                    console.error("failed , reason: ", error);
                                    return serverResponse;
                                }
                            }
                        });

                } else {
                    return new Promise((resolved, rejectied) => {
                        console.warn(label + ' DISABLED');
                        resolved(true);
                    });
                }

            }
        }
        , {
            name: 'Test Update User Settings',enabled: true, statement: function (label) {
                if (this.enabled) {
                    console.warn(label);

                    let payload = {
                        [UpdateSettings.prototype.NEWSLETTER]: false,
                        [UpdateSettings.prototype.NOTIFICATIONS]: 2
                    };

                    return new UpdateSettings(xqsdk)
                        .supplyAsync(payload)
                        .then(function (serverResponse) {
                            switch (serverResponse.status) {
                                case ServerResponse.prototype.OK: {
                                    let status = serverResponse.statusCode;
                                    let noContent = serverResponse.payload;
                                    console.info("Status: " + status);
                                    console.info("Data: " + noContent);
                                    return serverResponse;
                                    ;
                                }
                                default: {
                                    let error = serverResponse.payload;
                                    try{ error =  JSON.parse(error).status}catch (e){};
                                    console.error("failed , reason: ", error);
                                    return serverResponse;
                                }
                            }

                        });
                } else {
                    return new Promise((resolved, rejectied) => {
                        console.warn(label + ' DISABLED');
                        resolved(true);
                    });
                }
            }
        }
        , {
            name: 'Test Create Delegate Access Token',enabled: true, statement: function (label) {
                if (this.enabled) {
                    console.warn(label);

                    return new AuthorizeDelegate(xqsdk)
                        .supplyAsync(null)
                        .then(function (serverResponse) {
                            switch (serverResponse.status) {
                                case ServerResponse.prototype.OK: {
                                    let delegateAccessToken = serverResponse.payload;
                                    console.info("Delegate Access Token: " + delegateAccessToken);
                                    return serverResponse;
                                }
                                default: {
                                    let error = serverResponse.payload;
                                    try{ error =  JSON.parse(error).status}catch (e){};
                                    console.error("failed , reason: ", error);
                                    return serverResponse;
                                }
                            }

                        });

                } else {
                    return new Promise((resolved, rejectied) => {
                        console.warn(label + ' DISABLED');
                        resolved(true);
                    });
                }
            }
        }
        , {
            name: 'Test OTP V2 Algorithm',enabled: true, statement: function (label) {

                if (this.enabled) {
                    console.warn(label);

                    var algorithm = xqsdk.getAlgorithm(xqsdk.OTPv2_ALGORITHM);

                    let text = "|¬ællø (Hello) OTPv2Encryption test! Here is a piece of sample text. :) ";
                    let key = "MjI3MzMzNjhmYTlmNTM2MGRhODY0MWNmMDU0NGMzYzEzN2Y3NWRmNzk2M2QwMDEwNjYzZjVhOTc1ZDdjYjlhOQ==";

                    console.info("Input Text: " + text);

                    return algorithm
                        .encryptText(text, key)
                        .then(function (serverResponse) {
                            switch (serverResponse.status) {
                                case ServerResponse.prototype.OK: {
                                    let data = serverResponse.payload;
                                    console.info("Encrypted Text: " + data[EncryptionAlgorithm.prototype.ENCRYPTED_TEXT]);
                                    console.info("Expanded Key: " + data[EncryptionAlgorithm.prototype.KEY]);
                                    return serverResponse;
                                }
                                default: {
                                    let error = serverResponse.payload;
                                    try{ error =  JSON.parse(error).status}catch (e){};
                                    console.error("failed , reason: ", error);
                                    return serverResponse;
                                }
                            }
                        })
                        .then(function (passedThrough) {
                            let encryptResult = passedThrough.payload;
                            return algorithm
                                .decryptText(encryptResult[EncryptionAlgorithm.prototype.ENCRYPTED_TEXT], encryptResult[EncryptionAlgorithm.prototype.KEY])
                                .then(function (serverResponse) {
                                    switch (serverResponse.status) {
                                        case ServerResponse.prototype.OK: {
                                            let data = serverResponse.payload;
                                            console.info("Decrypted Text: " + data[EncryptionAlgorithm.prototype.DECRYPTED_TEXT]);
                                            return serverResponse;
                                        }
                                        default: {
                                            let error = serverResponse.payload;
                                            try{ error =  JSON.parse(error).status}catch (e){};
                                            console.error("failed , reason: ", error);
                                            return serverResponse;
                                        }
                                    }

                                });
                        });

                } else {
                    return new Promise((resolved, rejectied) => {
                        console.warn(label + ' DISABLED');
                        resolved(true);
                    });
                }
            }
        }
        , {
            name: 'Test AES Algorithm',enabled: true, statement: function (label) {

                if (this.enabled) {
                    console.warn(label);

                    var algorithm = xqsdk.getAlgorithm(xqsdk.AES_ALGORITHM);

                    let text = "|¬ællø (Hello)  AESEncryption! Here is a piece of sample text. Can you encrüpt it, hö, hö ? :) ";
                    let key = "MjI3MzMzNjhmYTlmNTM2MGRhODY0MWNmMDU0NGMzYzEzN2Y3NWRmNzk2M2QwMDEwNjYzZjVhOTc1ZDdjYjlhOQ==";

                    console.info("Input Text: " + text);

                    return algorithm
                        .encryptText(text, key)
                        .then(function (serverResponse) {
                            switch (serverResponse.status) {
                                case ServerResponse.prototype.OK: {
                                    let data = serverResponse.payload;
                                    console.info("AES Encrypted Text: " + data[EncryptionAlgorithm.prototype.ENCRYPTED_TEXT]);
                                    console.info("Key: " + data[EncryptionAlgorithm.prototype.KEY]);
                                    return serverResponse;
                                }
                                default: {
                                    let error = serverResponse.payload;
                                    try{ error =  JSON.parse(error).status}catch (e){};
                                    console.error("failed , reason: ", error);
                                    return serverResponse;
                                }
                            }
                        })
                        .then(function (passedThrough) {
                            let encryptResult = passedThrough.payload;
                            return algorithm
                                .decryptText(encryptResult[EncryptionAlgorithm.prototype.ENCRYPTED_TEXT], encryptResult[EncryptionAlgorithm.prototype.KEY])
                                .then(function (serverResponse) {
                                    switch (serverResponse.status) {
                                        case ServerResponse.prototype.OK: {
                                            let decryptResult = serverResponse.payload;
                                            console.info("AES Decrypted Text: " + decryptResult[EncryptionAlgorithm.prototype.DECRYPTED_TEXT]);
                                            return serverResponse;
                                        }
                                        default: {
                                            let error = serverResponse.payload;
                                            try{ error =  JSON.parse(error).status}catch (e){};
                                            console.error("failed , reason: ", error);
                                            return serverResponse;
                                        }
                                    }
                                });
                        });
                } else {
                    return new Promise((resolved, rejectied) => {
                        console.warn(label + ' DISABLED');
                        resolved(true);
                    });
                }
            }
        }
        , {
            name: 'Test Encrypt And Decrypt Text Using OTP V2',enabled: true, statement: function (label) {

                if (this.enabled) {
                    console.warn(label + 'Encrypt Using OTPv2');

                    let user = xqsdk.getCache().getActiveProfile(true);

                    let text = "Hello OTPV2 Encrypt test! Here is a bit of sample text :) Übermäßig";

                    var algorithm = xqsdk.getAlgorithm(xqsdk.OTPv2_ALGORITHM);

                    var locatorKey = null;
                    var encryptedText = null;

                    return new Encrypt(xqsdk, algorithm)
                        .supplyAsync({
                            [Encrypt.prototype.USER]: user,
                            [Encrypt.prototype.TEXT]: text,
                            [Encrypt.prototype.RECIPIENTS]: [user],
                            [Encrypt.prototype.EXPIRES_HOURS]: 1,
                            [Encrypt.prototype.DELETE_ON_RECEIPT]: true
                        })
                        .then(function (serverResponse) {
                            switch (serverResponse.status) {
                                case ServerResponse.prototype.OK: {
                                    let data = serverResponse.payload;

                                    locatorKey = data[Encrypt.prototype.LOCATOR_KEY];
                                    encryptedText = data[Encrypt.prototype.ENCRYPTED_TEXT];
                                    return serverResponse;
                                }
                                default: {
                                    let error = serverResponse.payload;
                                    try{ error =  JSON.parse(error).status}catch (e){};
                                    console.error("failed , reason: ", error);
                                    return serverResponse;
                                }
                            }

                        })
                        .then(function (intermediaryResult) {
                            if(intermediaryResult.status == ServerResponse.prototype.ERROR){
                                return intermediaryResult;
                            }


                            console.warn(label + 'Decrypt Using OTPv2');

                            var algorithm = xqsdk.getAlgorithm(xqsdk.OTPv2_ALGORITHM);

                            return new Decrypt(xqsdk, algorithm)
                                .supplyAsync({
                                    [Decrypt.prototype.LOCATOR_KEY]: locatorKey,
                                    [Decrypt.prototype.ENCRYPTED_TEXT]: encryptedText
                                })
                                .then(function (serverResponse) {
                                    switch (serverResponse.status) {
                                        case ServerResponse.prototype.OK: {
                                            let data = serverResponse.payload;

                                            let decryptText = data[EncryptionAlgorithm.prototype.DECRYPTED_TEXT];
                                            console.info("Decrypted Text: " + decryptText);
                                            return serverResponse;
                                        }
                                        default: {
                                            let error = serverResponse.payload;
                                            try{ error =  JSON.parse(error).status}catch (e){};
                                            console.error("failed , reason: ", error);
                                            return serverResponse;
                                        }
                                    }
                                });
                        });
                } else {
                    return new Promise((resolved, rejectied) => {
                        console.warn(label + ' DISABLED');
                        resolved(true);
                    });
                }
            }
        }
        , {
            name: 'Test Encrypt And Decrypt Text Using AES',enabled: true, statement: function (label) {
                if (this.enabled) {

                    console.warn(label + 'Encrypt Using AES');

                    let user = xqsdk.getCache().getActiveProfile(true);
                    let recipients = [user];

                    var locatorKey = null;
                    var encryptedText = null;

                    let text = "Hello AES Encrypt test! Here is a bit of sample text :) Übermäßig";

                    var algorithm = xqsdk.getAlgorithm(xqsdk.OTPv2_ALGORITHM);

                    return new Encrypt(xqsdk, algorithm)
                        .supplyAsync({
                            [Encrypt.prototype.USER]: user,
                            [Encrypt.prototype.TEXT]: text,
                            [Encrypt.prototype.RECIPIENTS]: recipients,
                            [Encrypt.prototype.EXPIRES_HOURS]: 1,
                            [Encrypt.prototype.DELETE_ON_RECEIPT]: true
                        })
                        .then(function (serverResponse) {
                            switch (serverResponse.status) {
                                case ServerResponse.prototype.OK: {
                                    let data = serverResponse.payload;

                                    locatorKey = data[Encrypt.prototype.LOCATOR_KEY];
                                    encryptedText = data[Encrypt.prototype.ENCRYPTED_TEXT];

                                    return serverResponse;
                                }
                                default: {
                                    let error = serverResponse.payload;
                                    try{ error =  JSON.parse(error).status}catch (e){};
                                    console.error("failed , reason: ", error);
                                    return serverResponse;
                                }
                            }

                        })
                        .then(function (intermediaryResult) {

                            if(intermediaryResult.status == ServerResponse.prototype.ERROR){
                            return intermediaryResult;
                        }

                            console.warn(label + 'Decrypt Using AES');


                            var algorithm = xqsdk.getAlgorithm(xqsdk.OTPv2_ALGORITHM);

                            return new Decrypt(xqsdk, algorithm)
                                .supplyAsync({
                                    [Decrypt.prototype.LOCATOR_KEY]: locatorKey,
                                    [Decrypt.prototype.ENCRYPTED_TEXT]: encryptedText
                                })
                                .then(function (serverResponse) {
                                    switch (serverResponse.status) {
                                        case ServerResponse.prototype.OK: {
                                            let data = serverResponse.payload;

                                            let decryptText = data[EncryptionAlgorithm.prototype.DECRYPTED_TEXT];
                                            console.info("Decrypted Text: " + decryptText);
                                            return serverResponse;
                                        }
                                        default: {
                                            let error = serverResponse.payload;
                                            try{ error =  JSON.parse(error).status}catch (e){};
                                            console.error("failed , reason: ", error);
                                            return serverResponse;
                                        }
                                    }

                                });

                        })
                        ;
                } else {
                    return new Promise((resolved, rejectied) => {
                        console.warn(label + ' DISABLED');
                        resolved(true);
                    });
                }

            }
        }
        , {
            name: 'Test File Encrypt And File Decrypt Text Using OTP V2',enabled: true, statement: function (label) {

                if (this.enabled) {

                    console.warn(label + 'File Encrypt Using OTPV2');

                    console.info(`Original File Content: ${samplerFileContent.substr(0, 250)}...\n`);
                    let sourceFile = new File([samplerFileContent], "utf-8-sampler.txt");

                    var algorithm = xqsdk.getAlgorithm(xqsdk.OTPv2_ALGORITHM);

                    let user = xqsdk.getCache().getActiveProfile(true);
                    let recipients = [user];
                    let expiration = 5;

                    return new FileEncrypt(xqsdk, algorithm)
                        .supplyAsync(
                            {
                                [FileEncrypt.prototype.USER]: user,
                                [FileEncrypt.prototype.RECIPIENTS]: recipients,
                                [FileEncrypt.prototype.EXPIRES_HOURS]: expiration,
                                [FileEncrypt.prototype.SOURCE_FILE]: sourceFile
                            })
                        .then(async function (serverResponse) {

                            switch (serverResponse.status) {
                                case ServerResponse.prototype.OK: {
                                    var encryptedFile = serverResponse.payload;
                                    console.warn(`Encrypted File: ${encryptedFile.name}, ${encryptedFile.size} bytes`);
                                    const encryptedFileContent = await encryptedFile.arrayBuffer();
                                    console.warn(`Encrypted File Content: ${new TextDecoder().decode(encryptedFileContent).substr(0, 250)}...\n`);

                                    return new FileDecrypt(xqsdk, algorithm)
                                        .supplyAsync({[FileDecrypt.prototype.SOURCE_FILE]: encryptedFile})
                                        .then(async function (serverResponse) {
                                            switch (serverResponse.status) {
                                                case ServerResponse.prototype.OK: {
                                                    var decryptedFile = serverResponse.payload;
                                                    console.warn(`Decrypted File: ${decryptedFile.name}, ${decryptedFile.size} bytes`);
                                                    const decryptedContent = await decryptedFile.arrayBuffer();
                                                    console.info(`Decrypted File Content: ${new TextDecoder().decode(decryptedContent)}\n`);
                                                    return serverResponse;
                                                }
                                                case ServerResponse.prototype.ERROR: {
                                                    console.error(serverResponse);
                                                    return serverResponse;
                                                }
                                            }
                                        });
                                }
                                default: {
                                    let error = serverResponse.payload;
                                    try{ error =  JSON.parse(error).status}catch (e){};
                                    console.error("failed , reason: ", error);
                                    return serverResponse;
                                }
                            }
                        });
                } else {
                    return new Promise((resolved, rejectied) => {
                        console.warn(label + ' DISABLED');
                        resolved(true);
                    });
                }
            }
        }
        , {
            name: 'Test Combine Authorizations',enabled: true, statement: function (label) {

                console.warn(label);

                const testUser = `test-user-${parseInt(Math.random() * (1000 - 1) + 1)}@xqmsg.com`

                let payload = {
                    [AuthorizeAlias.prototype.USER]: testUser,
                    [AuthorizeAlias.prototype.FIRST_NAME]: "User",
                    [AuthorizeAlias.prototype.LAST_NAME]: "XQMessage"
                };

                return new AuthorizeAlias(xqsdk)
                    .supplyAsync(payload)
                    .then(function (serverResponse) {

                        let testUserToken = serverResponse.payload;

                        xqsdk.getCache().putXQAccess(testUser, testUserToken);

                        return new CombineAuthorizations(xqsdk)
                            .supplyAsync({[CombineAuthorizations.prototype.TOKENS]: [testUserToken]})
                            .then(function (serverResponse) {
                                switch (serverResponse.status) {
                                    case ServerResponse.prototype.OK: {
                                        let data = serverResponse.payload;
                                        let mergedToken = data[CombineAuthorizations.prototype.MERGED_TOKEN];
                                        console.info("Merged Token: " + mergedToken);
                                        let mergeCount = data[CombineAuthorizations.prototype.MERGE_COUNT];
                                        console.info("Number of tokens combined: " + mergeCount);
                                        xqsdk.getCache().removeProfile(testUser);
                                        return serverResponse;
                                    }
                                    default: {
                                        let error = serverResponse.payload;
                                        try{ error =  JSON.parse(error).status}catch (e){};
                                        console.error("failed , reason: ", error);
                                        xqsdk.getCache().removeProfile(testUser);
                                        return serverResponse;
                                    }
                                }
                            });
                    });

            }
        }
        , {
            name: 'Test Delete Authorization',enabled: true, statement: function (label, disabled) {
                if (this.enabled) {
                    console.warn(`${label} (Using Alias)`);

                    const originaluser = xqsdk.getCache().getActiveProfile(true);
                    const testUser = `test-user-${parseInt(Math.random() * (1000 - 1) + 1)}@xqmsg.com`

                    let payload = {
                        [AuthorizeAlias.prototype.USER]: testUser,
                        [AuthorizeAlias.prototype.FIRST_NAME]: "User",
                        [AuthorizeAlias.prototype.LAST_NAME]: "XQMessage"
                    };
                    return new AuthorizeAlias(xqsdk)
                        .supplyAsync(payload)
                        .then(function (serverResponse) {

                            let token = serverResponse.payload;

                            //temporarily set the test user the  active profile.
                            xqsdk.getCache().putActiveProfile(testUser);
                            xqsdk.getCache().putXQAccess(testUser, token);

                            return new DeleteAuthorization(xqsdk)
                                .supplyAsync(null)
                                .then(function (serverResponse) {
                                    switch (serverResponse.status) {
                                        case ServerResponse.prototype.OK: {
                                            let noContent = serverResponse.payload;
                                            console.info("Status: " + ServerResponse.prototype.OK);
                                            console.info("Data: " + noContent);

                                            xqsdk.getCache().removeProfile(testUser);
                                            xqsdk.getCache().putActiveProfile(originaluser);

                                            return serverResponse;
                                        }
                                        default: {
                                            let error = serverResponse.payload;
                                            try{ error =  JSON.parse(error).status}catch (e){};
                                            console.error("failed , reason: ", error);
                                            xqsdk.getCache().removeProfile(testUser);
                                            return serverResponse;
                                        }
                                    }
                                })
                        })


                        ;
                } else {
                    return new Promise((resolved, rejectied) => {
                        console.warn(label + ' DISABLED');
                        resolved(true);
                    });
                }

            }
        }
        , {
            name: 'Test Delete User',enabled: true, statement: function (label, disabled) {

                if (this.enabled) {

                    console.warn(`${label} (Using Alias)`);

                    const originaluser = xqsdk.getCache().getActiveProfile(true);
                    const testUser = `test-user-${parseInt(Math.random() * (1000 - 1) + 1)}@xqmsg.com`

                    let payload = {
                        [AuthorizeAlias.prototype.USER]: testUser,
                        [AuthorizeAlias.prototype.FIRST_NAME]: "User",
                        [AuthorizeAlias.prototype.LAST_NAME]: "XQMessage"
                    };
                    return new AuthorizeAlias(xqsdk)
                        .supplyAsync(payload)
                        .then(function (serverResponse) {

                            let token = serverResponse.payload;

                            //temporarily set the test user the  active profile.
                            xqsdk.getCache().putActiveProfile(testUser);
                            xqsdk.getCache().putXQAccess(testUser, token);

                            return new DeleteSubscriber(xqsdk)
                                .supplyAsync(null)
                                .then(function (serverResponse) {
                                    switch (serverResponse.status) {
                                        case ServerResponse.prototype.OK: {
                                            let noContent = serverResponse.payload;
                                            console.info("Status: " + ServerResponse.prototype.OK);
                                            console.info("Data: " + noContent);

                                            xqsdk.getCache().removeProfile(testUser);
                                            xqsdk.getCache().putActiveProfile(originaluser);

                                            return serverResponse;
                                        }
                                        default: {
                                            let errorMessage = serverResponse.payload;
                                            try{ errorMessage =  JSON.parse(errorMessage)}catch (e){};
                                            console.error("failed , reason: ", errorMessage);
                                            xqsdk.getCache().removeProfile(testUser);
                                            return serverResponse;
                                        }
                                    }

                                });
                        });
                } else {
                    return new Promise((resolved, rejectied) => {
                        console.warn(label + ' DISABLED');
                        resolved(true);
                    });
                }

            }
        }
        , {
            name: 'Test Authorize Alias',enabled: true, statement: function (label) {

                if (this.enabled) {
                    console.warn(label);
                    let user = xqsdk.getCache().getActiveProfile(true);

                    let payload = {
                        [AuthorizeAlias.prototype.USER]: user,
                        [AuthorizeAlias.prototype.FIRST_NAME]: "User",
                        [AuthorizeAlias.prototype.LAST_NAME]: "XQMessage"
                    };
                    return new AuthorizeAlias(xqsdk)
                        .supplyAsync(payload)
                        .then(function (serverResponse) {
                            switch (serverResponse.status) {
                                case ServerResponse.prototype.OK: {
                                    let token = serverResponse.payload;
                                    console.info("Status: " + ServerResponse.prototype.OK);
                                    console.info("Token via Alias Authorization: " + token);
                                    return serverResponse
                                }
                                default: {
                                    let error = serverResponse.payload;
                                    try{ error =  JSON.parse(error).status}catch (e){};
                                    console.error("failed , reason: ", error);
                                    return serverResponse;
                                }
                            }
                        });
                } else {
                    return new Promise((resolved, rejectied) => {
                        console.warn(label + ' DISABLED');
                        resolved(true);
                    });
                }
            }
        }
        , {
            name: 'Test Check API Key',enabled: true, statement: function (label) {

                if (this.enabled) {
                    console.warn(label);

                    return new CheckApiKey(xqsdk)
                        .supplyAsync({[CheckApiKey.prototype.API_KEY]: xqsdk.APPLICATION_KEY})
                        .then(function (serverResponse) {
                            switch (serverResponse.status) {
                                case ServerResponse.prototype.OK: {
                                    var scopes = serverResponse.payload[CheckApiKey.prototype.SCOPES];
                                    console.info("Status: " + ServerResponse.prototype.OK);
                                    console.info(`API Key Scopes: "${scopes}"`);

                                    return serverResponse;
                                }
                                default: {
                                    let error = serverResponse.payload;
                                    try{ error =  JSON.parse(error).status}catch (e){};
                                    console.error("failed , reason: ", error);
                                    return serverResponse;
                                }
                            }
                        })
                        ;

                } else {
                    return new Promise((resolved, rejectied) => {
                        console.warn(label + ' DISABLED');
                        resolved(true);
                    });
                }
            }
        }
        , {
            name: 'Test Key Manipulations',enabled: true, statement: function (label) {

                if (this.enabled) {
                    console.warn(label);

                    let user = xqsdk.getCache().getActiveProfile(true);

                    return new GeneratePacket(xqsdk)
                        .supplyAsync({
                            [GeneratePacket.prototype.KEY]: '1A2B3C4D5E6F7G8H9I10J',
                            [GeneratePacket.prototype.RECIPIENTS]: [user],
                            [GeneratePacket.prototype.EXPIRES_HOURS]: 5,
                            [GeneratePacket.prototype.DELETE_ON_RECEIPT]: false
                        })
                        .then(function (uploadResponse) {
                            switch (uploadResponse.status) {
                                case ServerResponse.prototype.OK: {
                                    let packet = uploadResponse.payload;
                                    return new ValidatePacket(xqsdk)
                                        .supplyAsync({[ValidatePacket.prototype.PACKET]: packet})
                                        .then(function (packetValidationResponse) {
                                            switch (packetValidationResponse.status) {
                                                case ServerResponse.prototype.OK: {
                                                    const locatorKey = packetValidationResponse.payload;
                                                    return new FetchKey(xqsdk)
                                                        .supplyAsync({[Decrypt.prototype.LOCATOR_KEY]: locatorKey})
                                                        .then((serverResponse) => {
                                                            switch (serverResponse.status) {
                                                                case ServerResponse.prototype.OK: {
                                                                    let key = serverResponse.payload;
                                                                    console.info("Retrieved Key: " + key);
                                                                    return serverResponse;
                                                                }
                                                                default: {
                                                                    let error = serverResponse.payload;
                                                                    try{ error =  JSON.parse(error).status}catch (e){};
                                                                    console.error("failed , reason: ", error);
                                                                    return serverResponse;
                                                                }
                                                            }
                                                        })
                                                        .then((na) => {
                                                            console.warn('Test Key Expiration');
                                                            return new CheckKeyExpiration(xqsdk)
                                                                .supplyAsync({[Decrypt.prototype.LOCATOR_KEY]: locatorKey})
                                                                .then(function (serverResponse) {
                                                                        switch (serverResponse.status) {
                                                                            case ServerResponse.prototype.OK: {
                                                                                let data = serverResponse.payload;
                                                                                let expiresInSeconds = data[CheckKeyExpiration.prototype.EXPIRES_IN];
                                                                                let expiresOn = new Date(new Date().getTime() + expiresInSeconds * 1000);
                                                                                console.info("Key Expires On " + expiresOn);
                                                                                return serverResponse;
                                                                            }
                                                                            default: {
                                                                                let error = serverResponse.payload;
                                                                                try{ error =  JSON.parse(error).status}catch (e){};
                                                                                console.error("failed , reason: ", error);
                                                                                return serverResponse;
                                                                            }
                                                                        }
                                                                    }
                                                                );
                                                        })
                                                        .then((na) => {

                                                            console.warn('Test Revoke Key Access');

                                                            return new RevokeKeyAccess(xqsdk)
                                                                .supplyAsync({[RevokeKeyAccess.prototype.LOCATOR_KEY]: locatorKey})
                                                                .then(function (serverResponse) {
                                                                        switch (serverResponse.status) {
                                                                            case ServerResponse.prototype.OK: {
                                                                                let noContent = serverResponse.payload;
                                                                                console.info("Data: " + noContent);
                                                                                return serverResponse;
                                                                            }
                                                                            default: {
                                                                                let error = serverResponse.payload;
                                                                                try{ error =  JSON.parse(error).status}catch (e){};
                                                                                console.error("failed , reason: ", error);
                                                                                return serverResponse;
                                                                            }
                                                                        }
                                                                    }
                                                                )
                                                        })
                                                        .then((na) => {

                                                            console.warn('Test Revoke User Access');

                                                            let user = xqsdk.getCache().getActiveProfile(true);

                                                            return new RevokeUserAccess(xqsdk)
                                                                .supplyAsync(
                                                                    {
                                                                        [RevokeUserAccess.prototype.USER]: user,
                                                                        [RevokeUserAccess.prototype.RECIPIENTS]: [user],
                                                                        [RevokeUserAccess.prototype.LOCATOR_KEY]: locatorKey
                                                                    })
                                                                .then(function (serverResponse) {
                                                                    switch (serverResponse.status) {
                                                                        case ServerResponse.prototype.OK: {
                                                                            let noContent = serverResponse.payload;
                                                                            console.info("Status: " + ServerResponse.prototype.OK);
                                                                            console.info("Data: " + noContent);
                                                                            return serverResponse;
                                                                        }
                                                                        default: {
                                                                            let error = serverResponse.payload;
                                                                            try{ error =  JSON.parse(error).status}catch (e){};
                                                                            console.error("failed , reason: ", error);
                                                                            return serverResponse;
                                                                        }
                                                                    }
                                                                });
                                                        })
                                                        .then((na) => {

                                                            console.warn('Test Grant User Access');

                                                            let user = xqsdk.getCache().getActiveProfile(true);

                                                            return new GrantUserAccess(xqsdk)
                                                                .supplyAsync(
                                                                    {
                                                                        [GrantUserAccess.prototype.RECIPIENTS]: [user],
                                                                        [GrantUserAccess.prototype.LOCATOR_TOKEN]: locatorKey
                                                                    })
                                                                .then(function (serverResponse) {
                                                                        switch (serverResponse.status) {
                                                                            case ServerResponse.prototype.OK: {
                                                                                let noContent = serverResponse.payload;
                                                                                console.info("Status: " + ServerResponse.prototype.OK);
                                                                                console.info("Data: " + noContent);
                                                                                return serverResponse;
                                                                            }
                                                                            default: {
                                                                                let error = serverResponse.payload;
                                                                                try{ error =  JSON.parse(error).status}catch (e){};
                                                                                console.error("failed , reason: ", error);
                                                                                return serverResponse;
                                                                            }
                                                                        }
                                                                    }
                                                                );
                                                        });
                                                }
                                                default: {
                                                    let error = packetValidationResponse.payload;
                                                    try{ error =  JSON.parse(error).status}catch (e){};
                                                    console.error("failed , reason: ", error);
                                                    return packetValidationResponse;
                                                }
                                            }
                                        });
                                }
                                default: {
                                    let error = uploadResponse.payload;
                                    try{ error =  JSON.parse(error).status}catch (e){};
                                    console.error("failed , reason: ", error);
                                    return uploadResponse;
                                }
                            }
                        });
                } else {
                    return new Promise((resolved, rejectied) => {
                        console.warn(label + ' DISABLED');
                        resolved(true);
                    });
                }
            }
        }
    ];

    const samplerFileContent = this.responseText;

    try {
        xqsdk.getCache().getActiveProfile(true);
        showReadyScreen(false);
    } catch (err) {
        showInitialScreen();
    }
    showInitialTestAgenda();

    $("#register-button, #confirm-button, #run-button, #clear-credentials-button")
        .on("click", function (clickEvent) {
            switch (clickEvent.currentTarget.id) {
                case 'register-button': {
                    const userEmail = $("#register-input").val();

                   doAuthorize(userEmail)
                       .then(function (serverResponse) {
                       switch (serverResponse.status) {
                           case ServerResponse.prototype.OK: {
                               break;
                           }
                           default :{
                               let errorMessage = serverResponse.payload;
                               let jsonObj=JSON.parse(serverResponse.payload);
                               if(jsonObj.reason) {
                                   errorMessage = jsonObj.reason;
                               }else{
                                   errorMessage = jsonObj.status;
                               }
                               $("label[for='label-content']")
                                   .css({"font-style": "italic", "color": "#d22060", "visibility": "visible"})
                                   .html(errorMessage)
                                   ;
                               break;
                           }
                       }
                   });
                    break;
                }
                case 'confirm-button': {
                    const pin = $("#pin-input").val();
                    doConfirm(pin)
                        .then(function (serverResponse) {
                        switch (serverResponse.status) {
                            case ServerResponse.prototype.OK: {
                                break;
                            }
                            default :{
                                let errorMessage = serverResponse.payload;
                                try{
                                    let jsonObj=JSON.parse(serverResponse.payload);
                                    if(jsonObj.reason) {
                                        errorMessage = jsonObj.reason;
                                    }else{
                                        errorMessage = jsonObj.status;
                                    }
                                }catch (e) {}
                                $("label[for='label-content']")
                                    .css({"font-style": "italic", "color": "#d22060", "visibility": "visible"})
                                    .html(errorMessage)
                                ;
                                break;
                            }
                        }
                    });
                    break;
                }
                case 'run-button': {
                    showInitialTestAgenda();
                    runAll();
                    break;
                }
                case 'clear-credentials-button': {
                    xqsdk.getCache().clearAllProfiles();
                    showInitialScreen();
                    showInitialTestAgenda();
                    break;
                }
            }
        });


    function runAll() {
        runTest(0);
    }

    function runTest(i) {
        if (i < tests.length) {
            let test = tests[i];
            if (test.enabled) {
                test.statement(test.name)
                    .then(
                        function (serverResponse) {

                            switch (serverResponse.status) {
                                case ServerResponse.prototype.OK: {
                                    $(`#cb-${mkId(test.name)}`).prop({"checked": true, "disabled": true});
                                    $(`#${mkId(test.name)}`).css({"font-style": "italic", "color": "#72ec77"});
                                    break;
                                }
                                default :{
                                    let errorMessage = serverResponse.payload;
                                    try{errorMessage=JSON.parse(serverResponse.payload).status;}catch (e) {}                                    $(`#cb-${mkId(test.name)}`).prop({"checked": true, "disabled": true});
                                    $(`#${mkId(test.name)}`).css({"font-style": "italic", "color": "#d22060"});

                                    $(`#${mkId(test.name)}`).append(`<span style="margin: 0;"> [${errorMessage}]</span>`);

                                    break;
                                }
                            }
                            runTest(i + 1);
                        });
            } else {
                runTest(i + 1);
            }
        }
    }

    function doAuthorize(user) {
        let authorize = new Authorize(xqsdk);

        return authorize
            .supplyAsync({[authorize.USER]: user})
            .then(function (serverResponse) {
                switch (serverResponse.status) {
                    case ServerResponse.prototype.OK: {
                        $("label[for='label-content']")
                            .empty()
                            .html("Please check your email for the confirmation PIN we sent you. <br> Enter it below then press <span style='color: #0082FF'>Confirm</span> to continue.<br />")
                           .css({"font-style": "normal", "color": "#000", "visibility": "visible"});

                        $("button[id='register-button']")
                            .hide();
                        $("button[id='run-button']")
                            .hide();
                        $("button[id='confirm-button']")
                            .show();

                        $("#register-input")
                            .val("")
                            .hide();
                        $("#clear-credentials-container")
                            .hide();
                        $("#pin-input")
                            .val("")
                            .show();
                        return serverResponse;
                    }
                    default: {
                        let error = serverResponse.payload;
                        try{ error =  JSON.parse(error).status}catch (e){};
                        console.error("failed , reason: ", error);
                        return serverResponse;
                    }
                }
            });
    }

    function doConfirm(pin) {
        let codeValidator = new CodeValidator(xqsdk);
        return codeValidator
            .supplyAsync({[codeValidator.PIN]: pin})
            .then(function (serverResponse) {
                switch (serverResponse.status) {
                    case ServerResponse.prototype.OK: {

                        showReadyScreen();

                        $("label[for='label-content']")
                            .remove();

                        $("div[id='label-content']")
                            .append(`<label for="label-content" class="TertiaryText" style="font-style:normal; color:#000; visibility:visible;">
                                       You can now run the tests.<br />If you want to fresh you credentials, please press 
                                       <span style='color: #0082FF'>Refresh Credentials</span>
                                    </label>`
                            );

                        return serverResponse;
                    }
                    default: {
                        let error = serverResponse.payload;
                        try{ error =  JSON.parse(error).status}catch (e){};
                        console.error("failed , reason: ", error);
                        return  serverResponse;
                    }
                }
            });
    }

    function showInitialScreen(withClearCredentialsDisabled = true) {
        $("label[for='label-content']")
            .empty();
        $("button[id='register-button']")
            .show();
        $("button[id='confirm-button']")
            .hide();
        $("button[id='run-button']")
            .hide();
        $("#register-input")
            .val("")
            .show();
        $("#pin-input")
            .val("")
            .hide();
        $("#clear-credentials-button")
            .prop("disabled", withClearCredentialsDisabled)
            .show();


    }

    function showReadyScreen(withClearCredentialsDisabled = false) {
        $("label[for='label-content']")
            .empty();
        $("button[id='register-button']")
            .hide();
        $("button[id='confirm-button']")
            .hide();
        $("button[id='run-button']")
            .show();
        $("#register-input")
            .val("")
            .hide();
        $("#pin-input")
            .val("")
            .hide();
        $("#clear-credentials-button")
            .prop("disabled", withClearCredentialsDisabled)
            .show();
    }

    function showInitialTestAgenda() {
        $("label[for='agenda-items']").empty();
        tests.forEach(function (test) {
            if (test.enabled) {
                $("label[for='agenda-items']")
                    .append(`<div style="margin: 0;">
                                 <input type="checkbox" id="cb-${mkId(test.name)}" name="use-cached-credentials" disabled/>
                                 <span style="color: #0082FF" id="${mkId(test.name)}"> ${test.name}</span>
                              </div>`)
            } else {
                $("label[for='agenda-items']")
                    .append(`<div style="margin: 0;">
                                 <input type="checkbox" id="cb-${mkId(test.name)}" name="use-cached-credentials" disabled/>
                                 <span style="color: rgb(193 206 194)" id="${mkId(test.name)}"> ${test.name}</span>
                              </div>`);
            }
        });
    }

    function mkId(label) {
        return label.replace(/\s+/g, '-').toLowerCase();
    }
});
oReq.send();