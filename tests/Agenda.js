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
import Authorize from "../src/com/xqmsg/sdk/v2/services/Authorize.js";
import CodeValidator from "../src/com/xqmsg/sdk/v2/services/CodeValidator.js";

/**
 * This class contains the tests.
 * @class [Agenda]
 */
export default class Agenda {

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
                         return new Promise((resolved, rejectied) => {
                             resolved(new ServerResponse(
                                 ServerResponse.prototype.OK,
                                 200,
                                 {}));
                         });

                     } catch (err) {

                     }

                 } else {
                     return new Promise((resolved, rejectied) => {
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
                     return new Promise((resolved, rejectied) => {
                         resolved(new ServerResponse(
                             ServerResponse.prototype.OK,
                             200,
                             {}));
                     });

                 } catch (err) {

                     let payload = {[DashboardLogin.prototype.REQUEST]: "sub"};

                     return new DashboardLogin(self.xqsdk)
                         .supplyAsync(payload)
                         .then(function (serverResponse) {
                             switch (serverResponse.status) {
                                 case ServerResponse.prototype.OK: {
                                     let dashboardAccessToken = serverResponse.payload;
                                     console.info("Dashboard Access Token: " + dashboardAccessToken);
                                     return serverResponse;
                                 }
                                 default: {
                                     let error = serverResponse.payload;
                                     try {
                                         error = JSON.parse(error).status
                                     } catch (e) {};
                                     console.error("failed , reason: ", error);
                                     return serverResponse;
                                 }
                             }
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
         ,{
         name: 'Test Get Dashboard Applications', enabled: true, statement: function (label) {

             if (this.enabled) {
                 console.warn(label);

                 return new GetApplications(self.xqsdk)
                     .supplyAsync(null)
                     .then(function (serverResponse) {
                         switch (serverResponse.status) {
                             case ServerResponse.prototype.OK: {
                                 let data = serverResponse.payload;

                                 let apps = data[GetApplications.prototype.APPS];

                                 apps.forEach(function (app) {
                                     console.info(`Name: ${app["name"]}, Id: ${app["id"]}`);
                                 });

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
         ,{
         name: 'Test Add Dashboard Group', enabled: true, statement: function (label) {

             if (this.enabled) {
                 console.warn(label);

                 let payload = {
                     [AddUserGroup.prototype.NAME]: "New Test Generated User Group",
                     [AddUserGroup.prototype.MEMBERS]: ["jan@xqmsg.com", "jan+1@xqmsg.com" ],
                 };

                 return new AddUserGroup(self.xqsdk)
                     .supplyAsync(payload)
                     .then(function (serverResponse) {
                         switch (serverResponse.status) {
                             case ServerResponse.prototype.OK: {
                                 let data = serverResponse.payload;

                                 let groupId = data[AddUserGroup.prototype.ID];

                                 console.info(`Group Id: ${groupId}`);

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
         ,{
         name: 'Test Update Dashboard Group', enabled: true, statement: function (label) {

             if (this.enabled) {
                 console.warn(label);

                 return new FindUserGroups(self.xqsdk)
                     .supplyAsync( {[FindUserGroups.prototype.ID]: "[0-9]+"})
                     .then(function (serverResponse) {
                         switch (serverResponse.status) {
                             case ServerResponse.prototype.OK: {

                                 let data = serverResponse.payload;

                                 let groups = data[FindUserGroups.prototype.GROUPS];

                                 let found = groups.find(function (group) {
                                     return group["name"] == 'New Test Generated User Group';
                                 });

                                 let payload = {
                                     [UpdateUserGroup.prototype.ID]: found[FindUserGroups.prototype.ID],
                                     [UpdateUserGroup.prototype.NAME]: "Updated Test Generated User Group",
                                     [UpdateUserGroup.prototype.MEMBERS]: ["jan@xqmsg.com", "jan+1@xqmsg.com", "jan+2@xqmsg.com"],
                                 };

                                 return new UpdateUserGroup(self.xqsdk)
                                     .supplyAsync(payload)
                                     .then(function (serverResponse) {
                                         switch (serverResponse.status) {
                                             case ServerResponse.prototype.OK: {

                                                 console.info(`Response Status Code: ${serverResponse.statusCode}`);

                                                 return serverResponse;
                                             }
                                             default: {
                                                 let error = serverResponse.payload;
                                                 try {
                                                     error = JSON.parse(error).status
                                                 } catch (e) {};
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
                                 } catch (e) {} ;
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
         ,{
         name: 'Test Remove Dashboard Group', enabled: true, statement: function (label) {

             if (this.enabled) {
                 console.warn(label);

                 return  new FindUserGroups(self.xqsdk)
                     .supplyAsync( {[FindUserGroups.prototype.ID]: "[0-9]+"})
                     .then(function (serverResponse) {
                         switch (serverResponse.status) {
                             case ServerResponse.prototype.OK: {

                                 let data = serverResponse.payload;

                                 let groups = data[FindUserGroups.prototype.GROUPS];

                                 let found = groups.find(function (group) {
                                     return group["name"] == 'Updated Test Generated User Group';
                                 });

                                 let payload = {
                                     [RemoveUserGroup.prototype.ID]: found[FindUserGroups.prototype.ID],
                                 };

                                 return new RemoveUserGroup(self.xqsdk)
                                     .supplyAsync(payload)
                                     .then(function (serverResponse) {
                                         switch (serverResponse.status) {
                                             case ServerResponse.prototype.OK: {

                                                 console.info(`Response Status Code: ${serverResponse.statusCode}`);

                                                 return serverResponse;
                                             }
                                             default: {
                                                 let error = serverResponse.payload;
                                                 try {
                                                     error = JSON.parse(error).status
                                                 } catch (e) {};
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
                                 } catch (e) {};
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
         ,{
         name: 'Test Add Dashboard Contact', enabled: true, statement: function (label) {

             if (this.enabled) {
                 console.warn(label);

                 let payload = {
                     [AddContact.prototype.EMAIL]: "jan@xqmsg.com",
                     [AddContact.prototype.NOTIFICATIONS]: NotificationEnum.prototype.NONE,
                     [AddContact.prototype.ROLE]: RolesEnum.prototype.ALIAS,
                     [AddContact.prototype.TITLE]: "Mr.",
                     [AddContact.prototype.FIRST_NAME]: "John",
                     [AddContact.prototype.LAST_NAME]: "Doe",
                 };

                 return new AddContact(self.xqsdk)
                     .supplyAsync(payload)
                     .then(function (serverResponse) {
                         switch (serverResponse.status) {
                             case ServerResponse.prototype.OK: {
                                 let data = serverResponse.payload;

                                 let contactId = data[AddContact.prototype.ID];

                                 console.info(`New Contact Id: ${contactId}`);

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
         ,{
         name: 'Test Disable Dashboard Contact', enabled: true, statement: function (label) {

             if (this.enabled) {
                 console.warn(label);

                 return new FindContacts(self.xqsdk)
                     .supplyAsync( {[FindContacts.prototype.FILTER]: "%"})
                     .then(function (serverResponse) {
                         switch (serverResponse.status) {
                             case ServerResponse.prototype.OK: {

                                 let data = serverResponse.payload;

                                 let contacts = data[FindContacts.prototype.CONTACTS];

                                 let found = contacts.find(function (contact) {
                                     return contact["fn"] == 'John' && contact["ln"] == 'Doe';
                                 });

                                 let payload = {
                                     [DisableContact.prototype.ID]: found[FindContacts.prototype.ID],
                                 };

                                 return new DisableContact(self.xqsdk)
                                     .supplyAsync(payload)
                                     .then(function (serverResponse) {
                                         switch (serverResponse.status) {
                                             case ServerResponse.prototype.OK: {

                                                 console.info(`Disable User, Status Code: ${serverResponse.statusCode}`);

                                                 return serverResponse;
                                             }
                                             default: {
                                                 let error = serverResponse.payload;
                                                 try {
                                                     error = JSON.parse(error).status
                                                 } catch (e) {};
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
                                 } catch (e) {} ;
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
     },{
         name: 'Test Remove Dashboard Contact', enabled: true, statement: function (label) {

             if (this.enabled) {
                 console.warn(label);

                 return new FindContacts(self.xqsdk)
                     .supplyAsync( {[FindContacts.prototype.FILTER]: "%"})
                     .then(function (serverResponse) {
                         switch (serverResponse.status) {
                             case ServerResponse.prototype.OK: {

                                 let data = serverResponse.payload;

                                 let contacts = data[FindContacts.prototype.CONTACTS];

                                 let found = contacts.find(function (contact) {
                                     return contact["fn"] == 'John' && contact["ln"] == 'Doe';
                                 });

                                 let payload = {
                                     [DisableContact.prototype.ID]: found[FindContacts.prototype.ID],
                                 };

                                 return new RemoveContact(self.xqsdk)
                                     .supplyAsync(payload)
                                     .then(function (serverResponse) {
                                         switch (serverResponse.status) {
                                             case ServerResponse.prototype.OK: {

                                                 console.info(`Remove User,  Status Code: ${serverResponse.statusCode}`);

                                                 return serverResponse;
                                             }
                                             default: {
                                                 let error = serverResponse.payload;
                                                 try {
                                                     error = JSON.parse(error).status
                                                 } catch (e) {};
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
                                 } catch (e) {} ;
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
         ,{
         name: 'Test Get User Info', enabled: true, statement: function (label) {

             if (this.enabled) {
                 console.warn(label);

                 return new GetUserInfo(self.xqsdk)
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
         ,{
         name: 'Test Get User Settings', enabled: true, statement: function (label) {

             if (this.enabled) {
                 console.warn(label);

                 return new GetSettings(self.xqsdk)
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
         ,{
         name: 'Test Update User Settings', enabled: true, statement: function (label) {
             if (this.enabled) {
                 console.warn(label);

                 let payload = {
                     [UpdateSettings.prototype.NEWSLETTER]: false,
                     [UpdateSettings.prototype.NOTIFICATIONS]: 2
                 };

                 return new UpdateSettings(self.xqsdk)
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
         ,{
         name: 'Test Create Delegate Access Token', enabled: true, statement: function (label) {
             if (this.enabled) {
                 console.warn(label);

                 return new AuthorizeDelegate(self.xqsdk)
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

                         var algorithm = self.xqsdk.getAlgorithm(self.xqsdk.OTPv2_ALGORITHM);

                         return new Decrypt(self.xqsdk, algorithm)
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


                         var algorithm = self.xqsdk.getAlgorithm(self.xqsdk.OTPv2_ALGORITHM);

                         return new Decrypt(self.xqsdk, algorithm)
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

                                 return new FileDecrypt(self.xqsdk, algorithm)
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
         ,{
         name: 'Test Combine Authorizations', enabled: true, statement: function (label) {

             console.warn(label);

             const testUser = `test-user-${parseInt(Math.random() * (1000 - 1) + 1)}@xqmsg.com`

             let payload = {
                 [AuthorizeAlias.prototype.USER]: testUser,
                 [AuthorizeAlias.prototype.FIRST_NAME]: "User",
                 [AuthorizeAlias.prototype.LAST_NAME]: "XQMessage"
             };

             return new AuthorizeAlias(self.xqsdk)
                 .supplyAsync(payload)
                 .then(function (serverResponse) {

                     let testUserToken = serverResponse.payload;

                     self.xqsdk.getCache().putXQAccess(testUser, testUserToken);

                     return new CombineAuthorizations(self.xqsdk)
                         .supplyAsync({[CombineAuthorizations.prototype.TOKENS]: [testUserToken]})
                         .then(function (serverResponse) {
                             switch (serverResponse.status) {
                                 case ServerResponse.prototype.OK: {
                                     let data = serverResponse.payload;
                                     let mergedToken = data[CombineAuthorizations.prototype.MERGED_TOKEN];
                                     console.info("Merged Token: " + mergedToken);
                                     let mergeCount = data[CombineAuthorizations.prototype.MERGE_COUNT];
                                     console.info("Number of tokens combined: " + mergeCount);
                                     self.xqsdk.getCache().removeProfile(testUser);
                                     return serverResponse;
                                 }
                                 default: {
                                     let error = serverResponse.payload;
                                     try{ error =  JSON.parse(error).status}catch (e){};
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
         name: 'Test Delete Authorization', enabled: true, statement: function (label, disabled) {
             if (this.enabled) {
                 console.warn(`${label} (Using Alias)`);

                 const originaluser = self.xqsdk.getCache().getActiveProfile(true);
                 const testUser = `test-user-${parseInt(Math.random() * (1000 - 1) + 1)}@xqmsg.com`

                 let payload = {
                     [AuthorizeAlias.prototype.USER]: testUser,
                     [AuthorizeAlias.prototype.FIRST_NAME]: "User",
                     [AuthorizeAlias.prototype.LAST_NAME]: "XQMessage"
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
                                     case ServerResponse.prototype.OK: {
                                         let noContent = serverResponse.payload;
                                         console.info("Status: " + ServerResponse.prototype.OK);
                                         console.info("Data: " + noContent);

                                         self.xqsdk.getCache().removeProfile(testUser);
                                         self.xqsdk.getCache().putActiveProfile(originaluser);

                                         return serverResponse;
                                     }
                                     default: {
                                         let error = serverResponse.payload;
                                         try{ error =  JSON.parse(error).status}catch (e){};
                                         console.error("failed , reason: ", error);
                                         self.xqsdk.getCache().removeProfile(testUser);
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
         ,{
         name: 'Test Delete User', enabled: true, statement: function (label, disabled) {

             if (this.enabled) {

                 console.warn(`${label} (Using Alias)`);

                 const originaluser = self.xqsdk.getCache().getActiveProfile(true);
                 const testUser = `test-user-${parseInt(Math.random() * (1000 - 1) + 1)}@xqmsg.com`

                 let payload = {
                     [AuthorizeAlias.prototype.USER]: testUser,
                     [AuthorizeAlias.prototype.FIRST_NAME]: "User",
                     [AuthorizeAlias.prototype.LAST_NAME]: "XQMessage"
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
                                     case ServerResponse.prototype.OK: {
                                         let noContent = serverResponse.payload;
                                         console.info("Status: " + ServerResponse.prototype.OK);
                                         console.info("Data: " + noContent);

                                         self.xqsdk.getCache().removeProfile(testUser);
                                         self.xqsdk.getCache().putActiveProfile(originaluser);

                                         return serverResponse;
                                     }
                                     default: {
                                         let errorMessage = serverResponse.payload;
                                         try{ errorMessage =  JSON.parse(errorMessage)}catch (e){};
                                         console.error("failed , reason: ", errorMessage);
                                         self.xqsdk.getCache().removeProfile(testUser);
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
         ,{
         name: 'Test Authorize Alias', enabled: true, statement: function (label) {

             if (this.enabled) {
                 console.warn(label);
                 let user = self.xqsdk.getCache().getActiveProfile(true);

                 let payload = {
                     [AuthorizeAlias.prototype.USER]: user,
                     [AuthorizeAlias.prototype.FIRST_NAME]: "User",
                     [AuthorizeAlias.prototype.LAST_NAME]: "XQMessage"
                 };
                 return new AuthorizeAlias(self.xqsdk)
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
         ,{
         name: 'Test Check API Key', enabled: true, statement: function (label) {

             if (this.enabled) {
                 console.warn(label);

                 return new CheckApiKey(self.xqsdk)
                     .supplyAsync({[CheckApiKey.prototype.API_KEY]: self.xqsdk.XQ_API_KEY})
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
         ,{
         name: 'Test Key Manipulations', enabled: true, statement: function (label) {

             if (this.enabled) {
                 console.warn(label);

                 let user = self.xqsdk.getCache().getActiveProfile(true);

                 return new GeneratePacket(self.xqsdk)
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
                                 return new ValidatePacket(self.xqsdk)
                                     .supplyAsync({[ValidatePacket.prototype.PACKET]: packet})
                                     .then(function (packetValidationResponse) {
                                         switch (packetValidationResponse.status) {
                                             case ServerResponse.prototype.OK: {
                                                 const locatorKey = packetValidationResponse.payload;
                                                 return new FetchKey(self.xqsdk)
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
                                                         if(na.status == ServerResponse.prototype.ERROR){
                                                             return na;
                                                         }
                                                         console.warn('Test Key Expiration');
                                                         return new CheckKeyExpiration(self.xqsdk)
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
                                                         if(na.status == ServerResponse.prototype.ERROR){
                                                             return na;
                                                         }
                                                         console.warn('Test Revoke Key Access');

                                                         return new RevokeKeyAccess(self.xqsdk)
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
                                                         if(na.status == ServerResponse.prototype.ERROR){
                                                             return na;
                                                         }
                                                         console.warn('Test Revoke User Access');

                                                         let user = self.xqsdk.getCache().getActiveProfile(true);

                                                         return new RevokeUserAccess(self.xqsdk)
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
                                                         if(na.status == ServerResponse.prototype.ERROR){
                                                             return na;
                                                         }
                                                         console.warn('Test Grant User Access');

                                                         let user = self.xqsdk.getCache().getActiveProfile(true);

                                                         return new GrantUserAccess(self.xqsdk)
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
 }



}