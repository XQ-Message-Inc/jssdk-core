import ServerResponse from "../src/com/xqmsg/sdk/v2/ServerResponse.js";
import DashboardLogin from "../src/com/xqmsg/sdk/v2/services/dashboard/DashboardLogin.js";
import GetApplications from "../src/com/xqmsg/sdk/v2/services/dashboard/GetApplications.js";
import AddUserGroup from "../src/com/xqmsg/sdk/v2/services/dashboard/AddUserGroup.js";
import FindUserGroups from "../src/com/xqmsg/sdk/v2/services/dashboard/FindUserGroups.js";
import UpdateUserGroup from "../src/com/xqmsg/sdk/v2/services/dashboard/UpdateUserGroup.js";
import RemoveUserGroup from "../src/com/xqmsg/sdk/v2/services/dashboard/RemoveUserGroup.js";
import AddContact from "../src/com/xqmsg/sdk/v2/services/dashboard/AddContact.js";
import NotificationEnum from "../src/com/xqmsg/sdk/v2/NotificationEnum.js";
import RolesEnum from "../src/com/xqmsg/sdk/v2/RolesEnum.js";
import FindContacts from "../src/com/xqmsg/sdk/v2/services/dashboard/FindContacts.js";
import DisableContact from "../src/com/xqmsg/sdk/v2/services/dashboard/DisableContact.js";
import RemoveContact from "../src/com/xqmsg/sdk/v2/services/dashboard/RemoveContact.js";
import GetUserInfo from "../src/com/xqmsg/sdk/v2/services/GetUserInfo.js";
import GetSettings from "../src/com/xqmsg/sdk/v2/services/GetSettings.js";
import UpdateSettings from "../src/com/xqmsg/sdk/v2/services/UpdateSettings.js";
import AuthorizeDelegate from "../src/com/xqmsg/sdk/v2/services/AuthorizeDelegate.js";
import EncryptionAlgorithm from "../src/com/xqmsg/sdk/v2/algorithms/EncryptionAlgorithm.js";
import Encrypt from "../src/com/xqmsg/sdk/v2/services/Encrypt.js";
import Decrypt from "../src/com/xqmsg/sdk/v2/services/Decrypt.js";
import FileEncrypt from "../src/com/xqmsg/sdk/v2/services/FileEncrypt.js";
import FileDecrypt from "../src/com/xqmsg/sdk/v2/services/FileDecrypt.js";
import AuthorizeAlias from "../src/com/xqmsg/sdk/v2/services/AuthorizeAlias.js";
import CombineAuthorizations from "../src/com/xqmsg/sdk/v2/services/CombineAuthorizations.js";
import DeleteAuthorization from "../src/com/xqmsg/sdk/v2/services/DeleteAuthorization.js";
import DeleteSubscriber from "../src/com/xqmsg/sdk/v2/services/DeleteSubscriber.js";
import CheckApiKey from "../src/com/xqmsg/sdk/v2/services/CheckApiKey.js";
import GeneratePacket from "../src/com/xqmsg/sdk/v2/services/GeneratePacket.js";
import ValidatePacket from "../src/com/xqmsg/sdk/v2/services/ValidatePacket.js";
import FetchKey from "../src/com/xqmsg/sdk/v2/services/FetchKey.js";
import CheckKeyExpiration from "../src/com/xqmsg/sdk/v2/services/CheckKeyExpiration.js";
import RevokeKeyAccess from "../src/com/xqmsg/sdk/v2/services/RevokeKeyAccess.js";
import RevokeUserAccess from "../src/com/xqmsg/sdk/v2/services/RevokeUserAccess.js";
import GrantUserAccess from "../src/com/xqmsg/sdk/v2/services/GrantUserAccess.js";

/**
 * This class contains the tests.
 * @class [TestContainer]
 */
export default class TestContainer {

    constructor(aSdk, aSamplerFileContent) {
        this.xqsdk = aSdk;
        this.samplerFileContent = aSamplerFileContent;
    }

    loadTests = function(){

        let self = this;
        return [
            {
                name: 'Test Get XQ Authorization Token From Active Profile', enabled: true, statement: function (label) {

                    if (this.enabled) {
                        console.warn(label);

                        try {
                            let user = self.xqsdk.getCache().getActiveProfile(true);
                            let accessToken = self.xqsdk.getCache().getXQAccess(user, true);
                            console.warn(`The user is authorized.\nThe authorization token is: ${accessToken}`);
                            return new Promise((resolved) => {
                                resolved(new ServerResponse(
                                    ServerResponse.OK,
                                    200,
                                    {}));
                            });

                        } catch (err) {

                        }

                    } else {
                        return new Promise((resolved) => {
                            console.warn(label + ' DISABLED');
                            resolved(true);
                        });
                    }

                }
            }
            ,{
                name: 'Test Dashboard Login', enabled: true, statement: function (label) {

                    if (this.enabled) {

                        console.warn(label);
                        try {
                            let user = self.xqsdk.getCache().getActiveProfile(true);
                            let dashboardAccessToken = self.xqsdk.getCache().getDashboardAccess(user, true);
                            console.warn(`The user had already been authorized for dashboard usage.\nThe dashboard authorization token is: ${dashboardAccessToken}`);
                            return new Promise((resolved) => {
                                resolved(new ServerResponse(
                                    ServerResponse.OK,
                                    200,
                                    {}));
                            });

                        } catch (err) {

                            return new DashboardLogin(self.xqsdk)
                                .supplyAsync(null)
                                .then(function (serverResponse) {
                                    switch (serverResponse.status) {
                                        case ServerResponse.OK: {
                                            let dashboardAccessToken = serverResponse.payload;
                                            console.info("Dashboard Access Token: " + dashboardAccessToken);
                                            return serverResponse;
                                        }
                                        default: {
                                            let error = serverResponse.payload;
                                            try {
                                                error = JSON.parse(error).status
                                            } catch (e) {}
                                            console.error("failed , reason: ", error);
                                            return serverResponse;
                                        }
                                    }
                                });
                        }

                    } else {
                        return new Promise((resolved) => {
                            console.warn(label + ' DISABLED');
                            resolved(true);
                        });
                    }
                }
            }
            ,{
                name: 'Test Get Dashboard Applications', enabled: true, statement: function (label) {

                    if (this.enabled) {
                        console.warn(label);

                        return new GetApplications(self.xqsdk)
                            .supplyAsync(null)
                            .then(function (serverResponse) {
                                switch (serverResponse.status) {
                                    case ServerResponse.OK: {
                                        let data = serverResponse.payload;

                                        let apps = data[GetApplications.APPS];

                                        apps.forEach(function (app) {
                                            console.info(`Name: ${app["name"]}, Id: ${app["id"]}`);
                                        });

                                        return serverResponse;
                                    }
                                    default: {
                                        let error = serverResponse.payload;
                                        try{ error =  JSON.parse(error).status}catch (e){}
                                        console.error("failed , reason: ", error);
                                        return serverResponse;
                                    }

                                }
                            });


                    } else {
                        return new Promise((resolved) => {
                            console.warn(label + ' DISABLED');
                            resolved(true);
                        });
                    }
                }
            }
            ,{
                name: 'Test Add Dashboard Group', enabled: true, statement: function (label) {

                    if (this.enabled) {
                        console.warn(label);


                        let payload = {
                            [AddUserGroup.NAME]: "New Test Generated User Group",
                            [AddUserGroup.MEMBERS]: self.makeUsers(2).ALL,
                        };

                        return new AddUserGroup(self.xqsdk)
                            .supplyAsync(payload)
                            .then(function (serverResponse) {
                                switch (serverResponse.status) {
                                    case ServerResponse.OK: {
                                        let data = serverResponse.payload;

                                        let groupId = data[AddUserGroup.ID];

                                        console.info(`Group Id: ${groupId}`);

                                        return serverResponse;
                                    }
                                    default: {
                                        let error = serverResponse.payload;
                                        try{ error =  JSON.parse(error).status}catch (e){}
                                        console.error("failed , reason: ", error);
                                        return serverResponse;
                                    }

                                }
                            });


                    } else {
                        return new Promise((resolved) => {
                            console.warn(label + ' DISABLED');
                            resolved(true);
                        });
                    }
                }
            }
            ,{
                name: 'Test Update Dashboard Group', enabled: true, statement: function (label) {

                    if (this.enabled) {
                        console.warn(label);

                        return new FindUserGroups(self.xqsdk)
                            .supplyAsync( {[FindUserGroups.ID]: "[0-9]+"})
                            .then(function (serverResponse) {
                                switch (serverResponse.status) {
                                    case ServerResponse.OK: {

                                        let data = serverResponse.payload;

                                        let groups = data[FindUserGroups.GROUPS];

                                        let found = groups.find(function (group) {
                                            return group["name"] == 'New Test Generated User Group';
                                        });

                                        let payload = {
                                            [UpdateUserGroup.ID]: found[FindUserGroups.ID],
                                            [UpdateUserGroup.NAME]: "Updated Test Generated User Group",
                                            [UpdateUserGroup.MEMBERS]: self.makeUsers(3).ALL,
                                        };

                                        return new UpdateUserGroup(self.xqsdk)
                                            .supplyAsync(payload)
                                            .then(function (serverResponse) {
                                                switch (serverResponse.status) {
                                                    case ServerResponse.OK: {

                                                        console.info(`Response Status Code: ${serverResponse.statusCode}`);

                                                        return serverResponse;
                                                    }
                                                    default: {
                                                        let error = serverResponse.payload;
                                                        try {
                                                            error = JSON.parse(error).status
                                                        } catch (e) {}
                                                        console.error("failed , reason: ", error);
                                                        return serverResponse;
                                                    }

                                                }
                                            });

                                    }
                                    default: {
                                        let error = serverResponse.payload;
                                        try {
                                            error = JSON.parse(error).status
                                        } catch (e) {}
                                        console.error("failed , reason: ", error);
                                        return serverResponse;
                                    }
                                }
                            });


                    } else {
                        return new Promise((resolved) => {
                            console.warn(label + ' DISABLED');
                            resolved(true);
                        });
                    }
                }
            }
            ,{
                name: 'Test Remove Dashboard Group', enabled: true, statement: function (label) {

                    if (this.enabled) {
                        console.warn(label);

                        return  new FindUserGroups(self.xqsdk)
                            .supplyAsync( {[FindUserGroups.ID]: "[0-9]+"})
                            .then(function (serverResponse) {
                                switch (serverResponse.status) {
                                    case ServerResponse.OK: {

                                        let data = serverResponse.payload;

                                        let groups = data[FindUserGroups.GROUPS];

                                        let found = groups.find(function (group) {
                                            return group["name"] === 'Updated Test Generated User Group';
                                        });

                                        let payload = {
                                            [RemoveUserGroup.ID]: found[FindUserGroups.ID],
                                        };

                                        return new RemoveUserGroup(self.xqsdk)
                                            .supplyAsync(payload)
                                            .then(function (serverResponse) {
                                                switch (serverResponse.status) {
                                                    case ServerResponse.OK: {

                                                        console.info(`Response Status Code: ${serverResponse.statusCode}`);

                                                        return serverResponse;
                                                    }
                                                    default: {
                                                        let error = serverResponse.payload;
                                                        try {
                                                            error = JSON.parse(error).status
                                                        } catch (e) {}
                                                        console.error("failed , reason: ", error);
                                                        return serverResponse;
                                                    }

                                                }
                                            });
                                    }
                                    default: {
                                        let error = serverResponse.payload;
                                        try {
                                            error = JSON.parse(error).status
                                        } catch (e) {}
                                        console.error("failed , reason: ", error);
                                        return serverResponse;
                                    }
                                }
                            });


                    } else {
                        return new Promise((resolved) => {
                            console.warn(label + ' DISABLED');
                            resolved(true);
                        });
                    }
                }
            }
            ,{
                name: 'Test Add Dashboard Contact', enabled: true, statement: function (label) {

                    if (this.enabled) {
                        console.warn(label);

                        let payload = {
                            [AddContact.EMAIL]: self.makeUsers().FIRST,
                            [AddContact.NOTIFICATIONS]: NotificationEnum.NONE,
                            [AddContact.ROLE]: RolesEnum.ALIAS,
                            [AddContact.TITLE]: "Mr.",
                            [AddContact.FIRST_NAME]: "John",
                            [AddContact.LAST_NAME]: "Doe",
                        };

                        return new AddContact(self.xqsdk)
                            .supplyAsync(payload)
                            .then(function (serverResponse) {
                                switch (serverResponse.status) {
                                    case ServerResponse.OK: {
                                        let data = serverResponse.payload;

                                        let contactId = data[AddContact.ID];

                                        console.info(`New Contact Id: ${contactId}`);

                                        return serverResponse;
                                    }
                                    default: {
                                        let error = serverResponse.payload;
                                        try{ error =  JSON.parse(error).status}catch (e){}
                                        console.error("failed , reason: ", error);
                                        return serverResponse;
                                    }

                                }
                            });


                    } else {
                        return new Promise((resolved) => {
                            console.warn(label + ' DISABLED');
                            resolved(true);
                        });
                    }
                }
            }
            ,{
                name: 'Test Disable Dashboard Contact', enabled: true, statement: function (label) {

                    if (this.enabled) {
                        console.warn(label);

                        return new FindContacts(self.xqsdk)
                            .supplyAsync( {[FindContacts.FILTER]: "%"})
                            .then(function (serverResponse) {
                                switch (serverResponse.status) {
                                    case ServerResponse.OK: {

                                        let data = serverResponse.payload;

                                        let contacts = data[FindContacts.CONTACTS];

                                        let found = contacts.find(function (contact) {
                                            return contact["fn"] === 'John' && contact["ln"] === 'Doe';
                                        });

                                        let payload = {
                                            [DisableContact.ID]: found[FindContacts.ID],
                                        };

                                        return new DisableContact(self.xqsdk)
                                            .supplyAsync(payload)
                                            .then(function (serverResponse) {
                                                switch (serverResponse.status) {
                                                    case ServerResponse.OK: {

                                                        console.info(`Disable User, Status Code: ${serverResponse.statusCode}`);

                                                        return serverResponse;
                                                    }
                                                    default: {
                                                        let error = serverResponse.payload;
                                                        try {
                                                            error = JSON.parse(error).status
                                                        } catch (e) {}
                                                        console.error("failed , reason: ", error);
                                                        return serverResponse;
                                                    }

                                                }
                                            });

                                    }
                                    default: {
                                        let error = serverResponse.payload;
                                        try {
                                            error = JSON.parse(error).status
                                        } catch (e) {}
                                        console.error("failed , reason: ", error);
                                        return serverResponse;
                                    }
                                }
                            });


                    } else {
                        return new Promise((resolved) => {
                            console.warn(label + ' DISABLED');
                            resolved(true);
                        });
                    }
                }
            }
            ,{
                name: 'Test Remove Dashboard Contact', enabled: true, statement: function (label) {

                    if (this.enabled) {
                        console.warn(label);

                        return new FindContacts(self.xqsdk)
                            .supplyAsync( {[FindContacts.FILTER]: "%"})
                            .then(function (serverResponse) {
                                switch (serverResponse.status) {
                                    case ServerResponse.OK: {

                                        let data = serverResponse.payload;

                                        let contacts = data[FindContacts.CONTACTS];

                                        let found = contacts.find(function (contact) {
                                            return contact["fn"] === 'John' && contact["ln"] === 'Doe';
                                        });

                                        let payload = {
                                            [DisableContact.ID]: found[FindContacts.ID],
                                        };

                                        return new RemoveContact(self.xqsdk)
                                            .supplyAsync(payload)
                                            .then(function (serverResponse) {
                                                switch (serverResponse.status) {
                                                    case ServerResponse.OK: {

                                                        console.info(`Remove User,  Status Code: ${serverResponse.statusCode}`);

                                                        return serverResponse;
                                                    }
                                                    default: {
                                                        let error = serverResponse.payload;
                                                        try {
                                                            error = JSON.parse(error).status
                                                        } catch (e) {}
                                                        console.error("failed , reason: ", error);
                                                        return serverResponse;
                                                    }

                                                }
                                            });

                                    }
                                    default: {
                                        let error = serverResponse.payload;
                                        try {
                                            error = JSON.parse(error).status
                                        } catch (e) {}
                                        console.error("failed , reason: ", error);
                                        return serverResponse;
                                    }
                                }
                            });


                    } else {
                        return new Promise((resolved) => {
                            console.warn(label + ' DISABLED');
                            resolved(true);
                        });
                    }
                }
            }
            ,{
                name: 'Test Get User Info', enabled: true, statement: function (label) {

                    if (this.enabled) {
                        console.warn(label);

                        return new GetUserInfo(self.xqsdk)
                            .supplyAsync(null)
                            .then(function (serverResponse) {
                                switch (serverResponse.status) {
                                    case ServerResponse.OK: {
                                        let data = serverResponse.payload;

                                        let id = data[GetUserInfo.ID];
                                        let usr = data[GetUserInfo.USER];
                                        let firstName = data[GetUserInfo.FIRST_NAME];
                                        let lastName = data[GetUserInfo.LAST_NAME];
                                        let subscriptionStatus = data[GetUserInfo.SUBSCRIPTION_STATUS];

                                        console.info("Id: " + id);
                                        console.info("User: " + usr);
                                        console.info("First Name: " + firstName);
                                        console.info("Last Name: " + lastName);
                                        console.info("Subscription Status: " + subscriptionStatus);
                                        return serverResponse;
                                    }
                                    default: {
                                        let error = serverResponse.payload;
                                        try{ error =  JSON.parse(error).status}catch (e){}
                                        console.error("failed , reason: ", error);
                                        return serverResponse;
                                    }

                                }
                            });


                    } else {
                        return new Promise((resolved) => {
                            console.warn(label + ' DISABLED');
                            resolved(true);
                        });
                    }
                }
            }
            ,{
                name: 'Test Get User Settings', enabled: true, statement: function (label) {

                    if (this.enabled) {
                        console.warn(label);

                        return new GetSettings(self.xqsdk)
                            .supplyAsync(null)
                            .then(function (serverResponse) {
                                switch (serverResponse.status) {
                                    case ServerResponse.OK: {
                                        let data = serverResponse.payload;

                                        let newsletter = data[GetSettings.NEWSLETTER];
                                        let notifications = data[GetSettings.NOTIFICATIONS];

                                        console.info("Receives Newsletters: " + newsletter);
                                        console.info("Notifications: " + NotificationEnum.parseValue(notifications));
                                        return serverResponse;
                                    }
                                    default: {
                                        let error = serverResponse.payload;
                                        try{ error =  JSON.parse(error).status}catch (e){}
                                        console.error("failed , reason: ", error);
                                        return serverResponse;
                                    }
                                }
                            });

                    } else {
                        return new Promise((resolved) => {
                            console.warn(label + ' DISABLED');
                            resolved(true);
                        });
                    }

                }
            }
            ,{
                name: 'Test Update User Settings', enabled: true, statement: function (label) {
                    if (this.enabled) {
                        console.warn(label);

                        let payload = {
                            [UpdateSettings.NEWSLETTER]: false,
                            [UpdateSettings.NOTIFICATIONS]: 2
                        };

                        return new UpdateSettings(self.xqsdk)
                            .supplyAsync(payload)
                            .then(function (serverResponse) {
                                switch (serverResponse.status) {
                                    case ServerResponse.OK: {
                                        let status = serverResponse.statusCode;
                                        let noContent = serverResponse.payload;
                                        console.info("Status: " + status);
                                        console.info("Data: " + noContent);
                                        return serverResponse;

                                    }
                                    default: {
                                        let error = serverResponse.payload;
                                        try{ error =  JSON.parse(error).status}catch (e){}
                                        console.error("failed , reason: ", error);
                                        return serverResponse;
                                    }
                                }

                            });
                    } else {
                        return new Promise((resolved) => {
                            console.warn(label + ' DISABLED');
                            resolved(true);
                        });
                    }
                }
            }
            ,{
                name: 'Test Create Delegate Access Token', enabled: true, statement: function (label) {
                    if (this.enabled) {
                        console.warn(label);

                        return new AuthorizeDelegate(self.xqsdk)
                            .supplyAsync(null)
                            .then(function (serverResponse) {
                                switch (serverResponse.status) {
                                    case ServerResponse.OK: {
                                        let delegateAccessToken = serverResponse.payload;
                                        console.info("Delegate Access Token: " + delegateAccessToken);
                                        return serverResponse;
                                    }
                                    default: {
                                        let error = serverResponse.payload;
                                        try{ error =  JSON.parse(error).status}catch (e){}
                                        console.error("failed , reason: ", error);
                                        return serverResponse;
                                    }
                                }

                            });

                    } else {
                        return new Promise((resolved) => {
                            console.warn(label + ' DISABLED');
                            resolved(true);
                        });
                    }
                }
            }
            ,{
                name: 'Test OTP V2 Algorithm', enabled: true, statement: function (label) {

                    if (this.enabled) {
                        console.warn(label);

                        var algorithm = self.xqsdk.getAlgorithm(self.xqsdk.OTPv2_ALGORITHM);

                        let text = "|¬ællø (Hello) OTPv2Encryption test! Here is a piece of sample text. :) ";
                        let key = "MjI3MzMzNjhmYTlmNTM2MGRhODY0MWNmMDU0NGMzYzEzN2Y3NWRmNzk2M2QwMDEwNjYzZjVhOTc1ZDdjYjlhOQ==";

                        console.info("Input Text: " + text);

                        return algorithm
                            .encryptText(text, key)
                            .then(function (serverResponse) {
                                switch (serverResponse.status) {
                                    case ServerResponse.OK: {
                                        let data = serverResponse.payload;
                                        console.info("Encrypted Text: " + data[EncryptionAlgorithm.ENCRYPTED_TEXT]);
                                        console.info("Expanded Key: " + data[EncryptionAlgorithm.KEY]);
                                        return serverResponse;
                                    }
                                    default: {
                                        let error = serverResponse.payload;
                                        try{ error =  JSON.parse(error).status}catch (e){}
                                        console.error("failed , reason: ", error);
                                        return serverResponse;
                                    }
                                }
                            })
                            .then(function (passedThrough) {
                                let encryptResult = passedThrough.payload;
                                return algorithm
                                    .decryptText(encryptResult[EncryptionAlgorithm.ENCRYPTED_TEXT], encryptResult[EncryptionAlgorithm.KEY])
                                    .then(function (serverResponse) {
                                        switch (serverResponse.status) {
                                            case ServerResponse.OK: {
                                                let data = serverResponse.payload;
                                                console.info("Decrypted Text: " + data[EncryptionAlgorithm.DECRYPTED_TEXT]);
                                                return serverResponse;
                                            }
                                            default: {
                                                let error = serverResponse.payload;
                                                try{ error =  JSON.parse(error).status}catch (e){}
                                                console.error("failed , reason: ", error);
                                                return serverResponse;
                                            }
                                        }

                                    });
                            });

                    } else {
                        return new Promise((resolved) => {
                            console.warn(label + ' DISABLED');
                            resolved(true);
                        });
                    }
                }
            }
            ,{
                name: 'Test AES Algorithm', enabled: true, statement: function (label) {

                    if (this.enabled) {
                        console.warn(label);

                        var algorithm = self.xqsdk.getAlgorithm(self.xqsdk.AES_ALGORITHM);

                        let text = "|¬ællø (Hello)  AESEncryption! Here is a piece of sample text. Can you encrüpt it, hö, hö ? :) ";
                        let key = "MjI3MzMzNjhmYTlmNTM2MGRhODY0MWNmMDU0NGMzYzEzN2Y3NWRmNzk2M2QwMDEwNjYzZjVhOTc1ZDdjYjlhOQ==";

                        console.info("Input Text: " + text);

                        return algorithm
                            .encryptText(text, key)
                            .then(function (serverResponse) {
                                switch (serverResponse.status) {
                                    case ServerResponse.OK: {
                                        let data = serverResponse.payload;
                                        console.info("AES Encrypted Text: " + data[EncryptionAlgorithm.ENCRYPTED_TEXT]);
                                        console.info("Key: " + data[EncryptionAlgorithm.KEY]);
                                        return serverResponse;
                                    }
                                    default: {
                                        let error = serverResponse.payload;
                                        try{ error =  JSON.parse(error).status}catch (e){}
                                        console.error("failed , reason: ", error);
                                        return serverResponse;
                                    }
                                }
                            })
                            .then(function (passedThrough) {
                                let encryptResult = passedThrough.payload;
                                return algorithm
                                    .decryptText(encryptResult[EncryptionAlgorithm.ENCRYPTED_TEXT], encryptResult[EncryptionAlgorithm.KEY])
                                    .then(function (serverResponse) {
                                        switch (serverResponse.status) {
                                            case ServerResponse.OK: {
                                                let decryptResult = serverResponse.payload;
                                                console.info("AES Decrypted Text: " + decryptResult[EncryptionAlgorithm.DECRYPTED_TEXT]);
                                                return serverResponse;
                                            }
                                            default: {
                                                let error = serverResponse.payload;
                                                try{ error =  JSON.parse(error).status}catch (e){}
                                                console.error("failed , reason: ", error);
                                                return serverResponse;
                                            }
                                        }
                                    });
                            });
                    } else {
                        return new Promise((resolved) => {
                            console.warn(label + ' DISABLED');
                            resolved(true);
                        });
                    }
                }
            }
            ,{
                name: 'Test Encrypt And Decrypt Text Using OTP V2', enabled: true, statement: function (label) {

                    if (this.enabled) {
                        console.warn(label + 'Encrypt Using OTPv2');

                        let user = self.xqsdk.getCache().getActiveProfile(true);

                        let text = "Hello OTPV2 Encrypt test! Here is a bit of sample text :) Übermäßig";

                        var algorithm = self.xqsdk.getAlgorithm(self.xqsdk.OTPv2_ALGORITHM);

                        var locatorKey = null;
                        var encryptedText = null;

                        return new Encrypt(self.xqsdk, algorithm)
                            .supplyAsync({
                                [Encrypt.TEXT]: text,
                                [Encrypt.RECIPIENTS]: [user],
                                [Encrypt.EXPIRES_HOURS]: 1,
                                [Encrypt.DELETE_ON_RECEIPT]: true
                            })
                            .then(function (serverResponse) {
                                switch (serverResponse.status) {
                                    case ServerResponse.OK: {
                                        let data = serverResponse.payload;

                                        locatorKey = data[Encrypt.LOCATOR_KEY];
                                        encryptedText = data[Encrypt.ENCRYPTED_TEXT];
                                        return serverResponse;
                                    }
                                    default: {
                                        let error = serverResponse.payload;
                                        try{ error =  JSON.parse(error).status}catch (e){}
                                        console.error("failed , reason: ", error);
                                        return serverResponse;
                                    }
                                }

                            })
                            .then(function (intermediaryResult) {
                                if(intermediaryResult.status === ServerResponse.ERROR){
                                    return intermediaryResult;
                                }

                                console.warn(label + 'Decrypt Using OTPv2');

                                var algorithm = self.xqsdk.getAlgorithm(self.xqsdk.OTPv2_ALGORITHM);

                                return new Decrypt(self.xqsdk, algorithm)
                                    .supplyAsync({
                                        [Decrypt.LOCATOR_KEY]: locatorKey,
                                        [Decrypt.ENCRYPTED_TEXT]: encryptedText
                                    })
                                    .then(function (serverResponse) {
                                        switch (serverResponse.status) {
                                            case ServerResponse.OK: {
                                                let data = serverResponse.payload;

                                                let decryptText = data[EncryptionAlgorithm.DECRYPTED_TEXT];
                                                console.info("Decrypted Text: " + decryptText);
                                                return serverResponse;
                                            }
                                            default: {
                                                let error = serverResponse.payload;
                                                try{ error =  JSON.parse(error).status}catch (e){}
                                                console.error("failed , reason: ", error);
                                                return serverResponse;
                                            }
                                        }
                                    });
                            });
                    } else {
                        return new Promise((resolved) => {
                            console.warn(label + ' DISABLED');
                            resolved(true);
                        });
                    }
                }
            }
            ,{
                name: 'Test Encrypt And Decrypt Text Using AES', enabled: true, statement: function (label) {
                    if (this.enabled) {

                        console.warn(label + 'Encrypt Using AES');

                        let user = self.xqsdk.getCache().getActiveProfile(true);
                        let recipients = [user];

                        var locatorKey = null;
                        var encryptedText = null;

                        let text = "Hello AES Encrypt test! Here is a bit of sample text :) Übermäßig";

                        var algorithm = self.xqsdk.getAlgorithm(self.xqsdk.OTPv2_ALGORITHM);

                        return new Encrypt(self.xqsdk, algorithm)
                            .supplyAsync({
                                [Encrypt.TEXT]: text,
                                [Encrypt.RECIPIENTS]: recipients,
                                [Encrypt.EXPIRES_HOURS]: 1,
                                [Encrypt.DELETE_ON_RECEIPT]: true
                            })
                            .then(function (serverResponse) {
                                switch (serverResponse.status) {
                                    case ServerResponse.OK: {
                                        let data = serverResponse.payload;

                                        locatorKey = data[Encrypt.LOCATOR_KEY];
                                        encryptedText = data[Encrypt.ENCRYPTED_TEXT];

                                        return serverResponse;
                                    }
                                    default: {
                                        let error = serverResponse.payload;
                                        try{ error =  JSON.parse(error).status}catch (e){}
                                        console.error("failed , reason: ", error);
                                        return serverResponse;
                                    }
                                }

                            })
                            .then(function (intermediaryResult) {

                                if(intermediaryResult.status === ServerResponse.ERROR){
                                    return intermediaryResult;
                                }

                                console.warn(label + 'Decrypt Using AES');


                                var algorithm = self.xqsdk.getAlgorithm(self.xqsdk.OTPv2_ALGORITHM);

                                return new Decrypt(self.xqsdk, algorithm)
                                    .supplyAsync({
                                        [Decrypt.LOCATOR_KEY]: locatorKey,
                                        [Decrypt.ENCRYPTED_TEXT]: encryptedText
                                    })
                                    .then(function (serverResponse) {
                                        switch (serverResponse.status) {
                                            case ServerResponse.OK: {
                                                let data = serverResponse.payload;

                                                let decryptText = data[EncryptionAlgorithm.DECRYPTED_TEXT];
                                                console.info("Decrypted Text: " + decryptText);
                                                return serverResponse;
                                            }
                                            default: {
                                                let error = serverResponse.payload;
                                                try{ error =  JSON.parse(error).status}catch (e){}
                                                console.error("failed , reason: ", error);
                                                return serverResponse;
                                            }
                                        }

                                    });

                            })
                            ;
                    } else {
                        return new Promise((resolved) => {
                            console.warn(label + ' DISABLED');
                            resolved(true);
                        });
                    }

                }
            }
            ,{
                name: 'Test File Encrypt And File Decrypt Text Using OTP V2', enabled: true, statement: function (label) {

                    if (this.enabled) {

                        console.warn(label + 'File Encrypt Using OTPV2');

                        console.info(`Original File Content: ${self.samplerFileContent.substr(0, 250)}...\n`);
                        let sourceFile = new File([self.samplerFileContent], "utf-8-sampler.txt");

                        var algorithm = self.xqsdk.getAlgorithm(self.xqsdk.OTPv2_ALGORITHM);

                        let user = self.xqsdk.getCache().getActiveProfile(true);
                        let recipients = [user];
                        let expiration = 5;

                        return new FileEncrypt(self.xqsdk, algorithm)
                            .supplyAsync(
                                {
                                    [FileEncrypt.RECIPIENTS]: recipients,
                                    [FileEncrypt.EXPIRES_HOURS]: expiration,
                                    [FileEncrypt.SOURCE_FILE]: sourceFile
                                })
                            .then(async function (serverResponse) {

                                switch (serverResponse.status) {
                                    case ServerResponse.OK: {
                                        var encryptedFile = serverResponse.payload;
                                        console.warn(`Encrypted File: ${encryptedFile.name}, ${encryptedFile.size} bytes`);
                                        const encryptedFileContent = await encryptedFile.arrayBuffer();
                                        console.warn(`Encrypted File Content: ${new TextDecoder().decode(encryptedFileContent).substr(0, 250)}...\n`);

                                        return new FileDecrypt(self.xqsdk, algorithm)
                                            .supplyAsync({[FileDecrypt.SOURCE_FILE]: encryptedFile})
                                            .then(async function (serverResponse) {
                                                switch (serverResponse.status) {
                                                    case ServerResponse.OK: {
                                                        var decryptedFile = serverResponse.payload;
                                                        console.warn(`Decrypted File: ${decryptedFile.name}, ${decryptedFile.size} bytes`);
                                                        const decryptedContent = await decryptedFile.arrayBuffer();
                                                        console.info(`Decrypted File Content: ${new TextDecoder().decode(decryptedContent)}\n`);
                                                        return serverResponse;
                                                    }
                                                    case ServerResponse.ERROR: {
                                                        console.error(serverResponse);
                                                        return serverResponse;
                                                    }
                                                }
                                            });
                                    }
                                    default: {
                                        let error = serverResponse.payload;
                                        try{ error =  JSON.parse(error).status}catch (e){}
                                        console.error("failed , reason: ", error);
                                        return serverResponse;
                                    }
                                }
                            });
                    } else {
                        return new Promise((resolved) => {
                            console.warn(label + ' DISABLED');
                            resolved(true);
                        });
                    }
                }
            }
            ,{
                name: 'Test Combine Authorizations', enabled: true, statement: function (label) {

                    console.warn(label);

                    const testUser = self.makeUsers().FIRST;

                    let payload = {
                        [AuthorizeAlias.USER]: testUser,
                        [AuthorizeAlias.FIRST_NAME]: "User",
                        [AuthorizeAlias.LAST_NAME]: "XQMessage"
                    };

                    return new AuthorizeAlias(self.xqsdk)
                        .supplyAsync(payload)
                        .then(function (serverResponse) {

                            let testUserToken = serverResponse.payload;

                            return new CombineAuthorizations(self.xqsdk)
                                .supplyAsync({[CombineAuthorizations.TOKENS]: [testUserToken]})
                                .then(function (serverResponse) {
                                    switch (serverResponse.status) {
                                        case ServerResponse.OK: {
                                            let data = serverResponse.payload;
                                            let mergedToken = data[CombineAuthorizations.MERGED_TOKEN];
                                            console.info("Merged Token: " + mergedToken);
                                            let mergeCount = data[CombineAuthorizations.MERGE_COUNT];
                                            console.info("Number of tokens combined: " + mergeCount);
                                            self.xqsdk.getCache().removeProfile(testUser);
                                            return serverResponse;
                                        }
                                        default: {
                                            let error = serverResponse.payload;
                                            try{ error =  JSON.parse(error).status}catch (e){}
                                            console.error("failed , reason: ", error);
                                            self.xqsdk.getCache().removeProfile(testUser);
                                            return serverResponse;
                                        }
                                    }
                                });
                        });

                }
            }
            ,{
                name: 'Test Delete Authorization', enabled: true, statement: function (label) {
                    if (this.enabled) {
                        console.warn(`${label} (Using Alias)`);

                        const originaluser = self.xqsdk.getCache().getActiveProfile(true);
                        const testUser = self.makeUsers().FIRST;

                        let payload = {
                            [AuthorizeAlias.USER]: testUser,
                            [AuthorizeAlias.FIRST_NAME]: "User",
                            [AuthorizeAlias.LAST_NAME]: "XQMessage"
                        };
                        return new AuthorizeAlias(self.xqsdk)
                            .supplyAsync(payload)
                            .then(function (serverResponse) {

                                let token = serverResponse.payload;

                                //temporarily set the test user the  active profile.
                                self.xqsdk.getCache().putActiveProfile(testUser);
                                self.xqsdk.getCache().putXQAccess(testUser, token);

                                return new DeleteAuthorization(self.xqsdk)
                                    .supplyAsync(null)
                                    .then(function (serverResponse) {
                                        switch (serverResponse.status) {
                                            case ServerResponse.OK: {
                                                let noContent = serverResponse.payload;
                                                console.info("Status: " + ServerResponse.OK);
                                                console.info("Data: " + noContent);

                                                self.xqsdk.getCache().removeProfile(testUser);
                                                self.xqsdk.getCache().putActiveProfile(originaluser);

                                                return serverResponse;
                                            }
                                            default: {
                                                let error = serverResponse.payload;
                                                try{ error =  JSON.parse(error).status}catch (e){}
                                                console.error("failed , reason: ", error);
                                                self.xqsdk.getCache().removeProfile(testUser);
                                                return serverResponse;
                                            }
                                        }
                                    })
                            })


                            ;
                    } else {
                        return new Promise((resolved) => {
                            console.warn(label + ' DISABLED');
                            resolved(true);
                        });
                    }

                }
            }
            ,{
                name: 'Test Delete User', enabled: true, statement: function (label) {

                    if (this.enabled) {

                        console.warn(`${label} (Using Alias)`);

                        const originaluser = self.xqsdk.getCache().getActiveProfile(true);
                        const testUser = self.makeUsers().FIRST;

                        let payload = {
                            [AuthorizeAlias.USER]: testUser,
                            [AuthorizeAlias.FIRST_NAME]: "User",
                            [AuthorizeAlias.LAST_NAME]: "XQMessage"
                        };
                        return new AuthorizeAlias(self.xqsdk)
                            .supplyAsync(payload)
                            .then(function (serverResponse) {

                                let token = serverResponse.payload;

                                //temporarily set the test user the  active profile.
                                self.xqsdk.getCache().putActiveProfile(testUser);
                                self.xqsdk.getCache().putXQAccess(testUser, token);

                                return new DeleteSubscriber(self.xqsdk)
                                    .supplyAsync(null)
                                    .then(function (serverResponse) {
                                        switch (serverResponse.status) {
                                            case ServerResponse.OK: {
                                                let noContent = serverResponse.payload;
                                                console.info("Status: " + ServerResponse.OK);
                                                console.info("Data: " + noContent);

                                                self.xqsdk.getCache().removeProfile(testUser);
                                                self.xqsdk.getCache().putActiveProfile(originaluser);

                                                return serverResponse;
                                            }
                                            default: {
                                                let errorMessage = serverResponse.payload;
                                                try{ errorMessage =  JSON.parse(errorMessage)}catch (e){}
                                                console.error("failed , reason: ", errorMessage);
                                                self.xqsdk.getCache().removeProfile(testUser);
                                                return serverResponse;
                                            }
                                        }

                                    });
                            });
                    } else {
                        return new Promise((resolved) => {
                            console.warn(label + ' DISABLED');
                            resolved(true);
                        });
                    }

                }
            }
            ,{
                name: 'Test Authorize Alias', enabled: true, statement: function (label) {

                    if (this.enabled) {
                        console.warn(label);
                        let user = self.xqsdk.getCache().getActiveProfile(true);

                        let payload = {
                            [AuthorizeAlias.USER]: user,
                            [AuthorizeAlias.FIRST_NAME]: "User",
                            [AuthorizeAlias.LAST_NAME]: "XQMessage"
                        };
                        return new AuthorizeAlias(self.xqsdk)
                            .supplyAsync(payload)
                            .then(function (serverResponse) {
                                switch (serverResponse.status) {
                                    case ServerResponse.OK: {
                                        let token = serverResponse.payload;
                                        console.info("Status: " + ServerResponse.OK);
                                        console.info("Token via Alias Authorization: " + token);
                                        return serverResponse
                                    }
                                    default: {
                                        let error = serverResponse.payload;
                                        try{ error =  JSON.parse(error).status}catch (e){}
                                        console.error("failed , reason: ", error);
                                        return serverResponse;
                                    }
                                }
                            });
                    } else {
                        return new Promise((resolved) => {
                            console.warn(label + ' DISABLED');
                            resolved(true);
                        });
                    }
                }
            }
            ,{
                name: 'Test Check API Key', enabled: true, statement: function (label) {

                    if (this.enabled) {
                        console.warn(label);

                        return new CheckApiKey(self.xqsdk)
                            .supplyAsync({[CheckApiKey.API_KEY]: self.xqsdk.XQ_API_KEY})
                            .then(function (serverResponse) {
                                switch (serverResponse.status) {
                                    case ServerResponse.OK: {
                                        var scopes = serverResponse.payload[CheckApiKey.SCOPES];
                                        console.info("Status: " + ServerResponse.OK);
                                        console.info(`API Key Scopes: "${scopes}"`);

                                        return serverResponse;
                                    }
                                    default: {
                                        let error = serverResponse.payload;
                                        try{ error =  JSON.parse(error).status}catch (e){}
                                        console.error("failed , reason: ", error);
                                        return serverResponse;
                                    }
                                }
                            })
                            ;

                    } else {
                        return new Promise((resolved) => {
                            console.warn(label + ' DISABLED');
                            resolved(true);
                        });
                    }
                }
            }
            ,{
                name: 'Test Key Manipulations', enabled: true, statement: function (label) {

                    if (this.enabled) {
                        console.warn(label);

                        let user = self.xqsdk.getCache().getActiveProfile(true);

                        return new GeneratePacket(self.xqsdk)
                            .supplyAsync({
                                [GeneratePacket.KEY]: '1A2B3C4D5E6F7G8H9I10J',
                                [GeneratePacket.RECIPIENTS]: [user],
                                [GeneratePacket.EXPIRES_HOURS]: 5,
                                [GeneratePacket.DELETE_ON_RECEIPT]: false
                            })
                            .then(function (uploadResponse) {
                                switch (uploadResponse.status) {
                                    case ServerResponse.OK: {
                                        let packet = uploadResponse.payload;
                                        return new ValidatePacket(self.xqsdk)
                                            .supplyAsync({[ValidatePacket.PACKET]: packet})
                                            .then(function (packetValidationResponse) {
                                                switch (packetValidationResponse.status) {
                                                    case ServerResponse.OK: {
                                                        const locatorKey = packetValidationResponse.payload;
                                                        return new FetchKey(self.xqsdk)
                                                            .supplyAsync({[Decrypt.LOCATOR_KEY]: locatorKey})
                                                            .then((serverResponse) => {
                                                                switch (serverResponse.status) {
                                                                    case ServerResponse.OK: {
                                                                        let key = serverResponse.payload;
                                                                        console.info("Retrieved Key: " + key);
                                                                        return serverResponse;
                                                                    }
                                                                    default: {
                                                                        let error = serverResponse.payload;
                                                                        try{ error =  JSON.parse(error).status}catch (e){}
                                                                        console.error("failed , reason: ", error);
                                                                        return serverResponse;
                                                                    }
                                                                }
                                                            })
                                                            .then((na) => {
                                                                if(na.status === ServerResponse.ERROR){
                                                                    return na;
                                                                }
                                                                console.warn('Test Key Expiration');
                                                                return new CheckKeyExpiration(self.xqsdk)
                                                                    .supplyAsync({[Decrypt.LOCATOR_KEY]: locatorKey})
                                                                    .then(function (serverResponse) {
                                                                            switch (serverResponse.status) {
                                                                                case ServerResponse.OK: {
                                                                                    let data = serverResponse.payload;
                                                                                    let expiresInSeconds = data[CheckKeyExpiration.EXPIRES_IN];
                                                                                    let expiresOn = new Date(new Date().getTime() + expiresInSeconds * 1000);
                                                                                    console.info("Key Expires On " + expiresOn);
                                                                                    return serverResponse;
                                                                                }
                                                                                default: {
                                                                                    let error = serverResponse.payload;
                                                                                    try{ error =  JSON.parse(error).status}catch (e){}
                                                                                    console.error("failed , reason: ", error);
                                                                                    return serverResponse;
                                                                                }
                                                                            }
                                                                        }
                                                                    );
                                                            })
                                                            .then((na) => {
                                                                if(na.status === ServerResponse.ERROR){
                                                                    return na;
                                                                }
                                                                console.warn('Test Revoke Key Access');

                                                                return new RevokeKeyAccess(self.xqsdk)
                                                                    .supplyAsync({[RevokeKeyAccess.LOCATOR_KEY]: locatorKey})
                                                                    .then(function (serverResponse) {
                                                                            switch (serverResponse.status) {
                                                                                case ServerResponse.OK: {
                                                                                    let noContent = serverResponse.payload;
                                                                                    console.info("Data: " + noContent);
                                                                                    return serverResponse;
                                                                                }
                                                                                default: {
                                                                                    let error = serverResponse.payload;
                                                                                    try{ error =  JSON.parse(error).status}catch (e){}
                                                                                    console.error("failed , reason: ", error);
                                                                                    return serverResponse;
                                                                                }
                                                                            }
                                                                        }
                                                                    )
                                                            })
                                                            .then((na) => {
                                                                if(na.status === ServerResponse.ERROR){
                                                                    return na;
                                                                }
                                                                console.warn('Test Revoke User Access');

                                                                let user = self.xqsdk.getCache().getActiveProfile(true);

                                                                return new RevokeUserAccess(self.xqsdk)
                                                                    .supplyAsync(
                                                                        {
                                                                            [RevokeUserAccess.USER]: user,
                                                                            [RevokeUserAccess.RECIPIENTS]: [user],
                                                                            [RevokeUserAccess.LOCATOR_KEY]: locatorKey
                                                                        })
                                                                    .then(function (serverResponse) {
                                                                        switch (serverResponse.status) {
                                                                            case ServerResponse.OK: {
                                                                                let noContent = serverResponse.payload;
                                                                                console.info("Status: " + ServerResponse.OK);
                                                                                console.info("Data: " + noContent);
                                                                                return serverResponse;
                                                                            }
                                                                            default: {
                                                                                let error = serverResponse.payload;
                                                                                try{ error =  JSON.parse(error).status}catch (e){}
                                                                                console.error("failed , reason: ", error);
                                                                                return serverResponse;
                                                                            }
                                                                        }
                                                                    });
                                                            })
                                                            .then((na) => {
                                                                if(na.status === ServerResponse.ERROR){
                                                                    return na;
                                                                }
                                                                console.warn('Test Grant User Access');

                                                                let user = self.xqsdk.getCache().getActiveProfile(true);

                                                                return new GrantUserAccess(self.xqsdk)
                                                                    .supplyAsync(
                                                                        {
                                                                            [GrantUserAccess.RECIPIENTS]: [user],
                                                                            [GrantUserAccess.LOCATOR_TOKEN]: locatorKey
                                                                        })
                                                                    .then(function (serverResponse) {
                                                                            switch (serverResponse.status) {
                                                                                case ServerResponse.OK: {
                                                                                    let noContent = serverResponse.payload;
                                                                                    console.info("Status: " + ServerResponse.OK);
                                                                                    console.info("Data: " + noContent);
                                                                                    return serverResponse;
                                                                                }
                                                                                default: {
                                                                                    let error = serverResponse.payload;
                                                                                    try{ error =  JSON.parse(error).status}catch (e){}
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
                                                        try{ error =  JSON.parse(error).status}catch (e){}
                                                        console.error("failed , reason: ", error);
                                                        return packetValidationResponse;
                                                    }
                                                }
                                            });
                                    }
                                    default: {
                                        let error = uploadResponse.payload;
                                        try{ error =  JSON.parse(error).status}catch (e){}
                                        console.error("failed , reason: ", error);
                                        return uploadResponse;
                                    }
                                }
                            });
                    } else {
                        return new Promise((resolved) => {
                            console.warn(label + ' DISABLED');
                            resolved(true);
                        });
                    }
                }
            }
        ];
    }

    makeUsers = function(limit=1){
        let users = [];
        for (var i=0;i<limit;i++) {
            users[users.length]=`test-user-${parseInt(Math.random() * (1000 - 1) + 1)}@xqmsg.com`;
        }
        return {FIRST:users[0],ALL:users };
    }

}