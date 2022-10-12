# @xqmsg/jssdk-core

[![version](https://img.shields.io/badge/version-1.9.0-green.svg)](https://semver.org)

A Javascript Implementation of XQ Message SDK (V.2) which provides convenient access to the XQ Message API.

## What is XQ Message?

XQ Message is an encryption-as-a-service (EaaS) platform which gives you the tools to encrypt and route data to and from devices like mobile phones, IoT, and connected devices that are at the "edge" of the internet. The XQ platform is a lightweight and highly secure cybersecurity solution that enables self protecting data for perimeterless [zero trust](https://en.wikipedia.org/wiki/Zero_trust_security_model) data protection, even to devices and apps that have no ability to do so natively.

## XQ Message JS SDK sample application

If you would like to see the JS SDK in action, please navigate to the [JSSDK examples repository](https://github.com/xqmsg/jssdk-examples). The project is intended to give the user a high-level overview of the encryption and decryption flow, as well as some sample implementations of core components

## Table of contents

- [@xqmsg/jssdk-core](#xqmsgjssdk-core)
  - [What is XQ Message?](#what-is-xq-message)
  - [XQ Message JS SDK sample application](#xq-message-js-sdk-sample-application)
  - [Table of contents](#table-of-contents)
  - [Installation](#installation)
    - [API Keys](#api-keys)
  - [Basic Usage](#basic-usage)
    - [Initializing the SDK](#initializing-the-sdk)
    - [Authenticating the SDK](#authenticating-the-sdk)
    - [Encrypting a Message](#encrypting-a-message)
    - [Decrypting a Message](#decrypting-a-message)
    - [Encrypting a File](#encrypting-a-file)
    - [Decrypting a File](#decrypting-a-file)
    - [Authorization](#authorization)
    - [Code Validator](#code-validator)
    - [Revoking Key Access](#revoking-key-access)
    - [Granting and Revoking User Access](#granting-and-revoking-user-access)
    - [Connect to an alias account](#connect-to-an-alias-account)
  - [Manual key management](#manual-key-management)
    - [1. Get quantum entropy ( Optional )](#1-get-quantum-entropy--optional-)
    - [2. Generate a key packet](#2-generate-a-key-packet)
    - [3. Retrieve a key from server](#3-retrieve-a-key-from-server)
  - [Dashboard Management](#dashboard-management)
    - [Connecting to the Dashboard](#connecting-to-the-dashboard)
    - [Managing a user group](#managing-a-user-group)
    - [Using an external ID-based contact for tracking](#using-an-external-id-based-contact-for-tracking)

---

## Installation

Install the package with:

```sh
yarn add @xqmsg/jssdk-core
# or
npm install @xqmsg/jssdk-core
```

### API Keys

In order to utilize the XQ SDK and interact with XQ servers you will need both the **`General`** and **`Dashboard`** API keys. To generate these keys, follow these steps:

1. Go to your [XQ management portal](https://manage.xqmsg.com/applications).
2. Select or create an application.
3. Create a **`General`** key for the XQ framework API.
4. Create a **`Dashboard`** key for the XQ dashboard API.

---

## Basic Usage

### Initializing the SDK

To initialize an XQ SDK instance in your JavaScript application, provide the generated `XQ_API_KEY` (General) and/or `DASHBOARD_API_KEY` (Dashboard) API keys to the `XQSDK` class as shown below:

```javascript
const sdk = new XQSDK({
  XQ_API_KEY: "YOUR_XQ_API_KEY",
  DASHBOARD_API_KEY: "YOUR_DASHBOARD_API_KEY",
});
```

**_Note: You only need to generate one SDK instance for use across your application._**

### Authenticating the SDK

Before making most XQ API calls, the user will need a required bearer token. To get one, a user must first request access, upon which they get a pre-auth token. After they confirm their account, they will send the pre-auth token to the server in return for an access token.

The user may utilize [Authorize](#authorization) to request an access token for a particular email address or telephone number, then use [CodeValidator](#code-validator) to validate and replace the temporary token they received previously for a valid access token.

Optionally the user may utilize [AuthorizeAlias](#connect-to-an-alias-account) which allows them to immediately authorize an access token for a particular email address or telephone number. It should only be considered in situations wher 2FA is problematic/unecessary, such as IoT devices or trusted applications that have a different method for authenticating user information.

**_Note: This method only works for new email addresses/phone numbers that are not registered with XQ. If a previously registered account is used, an error will be returned._**

### Encrypting a Message

The text to be encrypted should be submitted along with the email addresses of the intended recipients, as well as the amount of time that the message should be available.

```javascript
import { Encrypt, ServerResponse, XQSDK } from "@xqmsg/jssdk-core";

const sdk = new XQSDK({
  XQ_API_KEY: "YOUR_XQ_API_KEY"
});

const payload = {
  [Encrypt.TEXT]: "My message to encrypt",
  [Encrypt.RECIPIENTS]: ["jane@email.com", "jack@email.com"],
  [Encrypt.EXPIRES_HOURS]: 24,
};

const algorithm = sdk.getAlgorithm("OTPv2"); // Either "AES" or "OTPv2"

new Encrypt(sdk, algorithm).supplyAsync(payload).then((response) => {
  switch (response.status) {
    case ServerResponse.OK: {
      const data = response.payload;
      const locatorKey = data[Encrypt.LOCATOR_KEY];
      const encryptedText = data[Encrypt.ENCRYPTED_TEXT];
      // Do something with the data
      break;
    }
    case ServerResponse.ERROR: {
      // Something went wrong...
      break;
    }
  }

  return response;
});
```

### Decrypting a Message

To decrypt a message, the encrypted payload must be provided, along with the locator token received from XQ during encryption. The authenticated user must be one of the recipients that the message was originally sent to ( or the sender themselves).

```javascript
import { Decrypt, ServerResponse, XQSDK } from "@xqmsg/jssdk-core";

const sdk = new XQSDK({
  XQ_API_KEY: "YOUR_XQ_API_KEY"
});

const payload = {
  [Decrypt.LOCATOR_KEY]: "my_locator_key",
  [Decrypt.ENCRYPTED_TEXT]: "original_encrypted_content",
};

const algorithm = sdk.getAlgorithm("OTPv2"); // Either "AES" or "OTPv2"

new Decrypt(sdk, algorithm).supplyAsync(payload).then((response) => {
  switch (response.status) {
    case ServerResponse.OK: {
      const data = response.payload;
      const decryptedText = data[EncryptionAlgorithm.DECRYPTED_TEXT];
      // Do something with the data
      break;
    }
    case ServerResponse.ERROR: {
      // Something went wrong...
      break;
    }
  }

  return response;
});
```

### Encrypting a File

Here, a `File` object containing the data for encryption must be provided. Like message encryption, a list of recipients who will be able to decrypt the file, as well as the amount of time before expiration must also be provided.

```javascript
import { FileEncrypt, ServerResponse, XQSDK } from "@xqmsg/jssdk-core";

const sdk = new XQSDK({
  XQ_API_KEY: "YOUR_XQ_API_KEY"
});

const algorithm = sdk.getAlgorithm("OTPv2"); // Either "AES" or "OTPv2"

// A sample file object.
const sourceFile = new File(["Hello"], "hello.txt", {
  type: "text/plain",
});

new FileEncrypt(sdk, algorithm)
  .supplyAsync({
    [FileEncrypt.RECIPIENTS]: ["jane@email.com", "jack@email.com"],
    [FileEncrypt.EXPIRES_HOURS]: 24,
    [FileEncrypt.SOURCE_FILE]: sourceFile,
  })
  .then((response) => {
    switch (response.status) {
      case ServerResponse.OK: {
        var encryptedFile = response.payload;
        // Do something with the data
        break;
      }
      case ServerResponse.ERROR: {
        // Something went wrong...
        break;
      }
    }

    return response;
  });
```

### Decrypting a File

To decrypt a file, the URI to the XQ encrypted file must be provided. The user decrypting the file must be one of the recipients original specified ( or the sender ).

```javascript
import { FileDecrypt, ServerResponse, XQSDK } from "@xqmsg/jssdk-core";

const sdk = new XQSDK({
  XQ_API_KEY: "YOUR_XQ_API_KEY"
});

const algorithm = sdk.getAlgorithm("OTPv2"); // Either "AES" or "OTPv2"

// A file object containing the encrypted text.
const sourceFile = new File(["ENCRYPTED CONTENT"], "encrypted.txt", {
  type: "text/plain",
});

new FileDecrypt(sdk, algorithm)
  .supplyAsync({ [FileDecrypt.SOURCE_FILE]: sourceFile })
  .then((response) => {
    switch (response.status) {
      case ServerResponse.OK: {
        var decryptedFile = response.payload;
        // Do something with the data
        break;
      }
      case ServerResponse.ERROR: {
        // Something went wrong...
        break;
      }
    }

    return response;
  });
```

### Authorization

Request an access token for a particular email address. If successful, the user will receive an email containing a PIN and a validation link.

The service itself will return a pre-authorization token that can be exchanged for a full access token once validation is complete.

```javascript
import { Authorize, ServerResponse, XQSDK } from "@xqmsg/jssdk-core";

const sdk = new XQSDK({
  XQ_API_KEY: "YOUR_XQ_API_KEY"
});

new Authorize(sdk)
  .supplyAsync({ [Authorize.USER]: "me@email.com" })
  .then((response) => {
    switch (response.status) {
      case ServerResponse.OK: {
        // Success. A pre-authorization token should automatically be cached.
        break;
      }
      case ServerResponse.ERROR: {
        // Something went wrong...
        break;
      }
    }

    return response;
  });
```

### Code Validator

After requesting authorization via the `Authorize` class, the user can submit the PIN they received using the `CodeValidator` class. Once submitted and validated, the temporary token they received previously will be replaced for a valid access token that can be used for other requests:

```javascript
import { CodeValidator, ServerResponse, XQSDK } from "@xqmsg/jssdk-core";

const sdk = new XQSDK({
  XQ_API_KEY: "YOUR_XQ_API_KEY"
});

new CodeValidator(sdk)
  .supplyAsync({ [CodeValidator.PIN]: "123456" })
  .then((response) => {
    switch (response.status) {
      case ServerResponse.OK: {
        // The user is now fully authorized. The new access token
        // is added to the active user profile.
        break;
      }
      case ServerResponse.ERROR: {
        // Something went wrong...
        break;
      }
    }

    return response;
  });
```

Alternatively, if the user clicks on the link in the email, they can simply exchange their pre-authorization token for a valid access token by using the `ExchangeForAccessToken` class directly. Note that the active user in the `sdk` should be the same as the one used to make the authorization call:

```javascript
import {
  ExchangeForAccessToken,
  ServerResponse,
  XQSDK,
} from "@xqmsg/jssdk-core";

const sdk = new XQSDK({
  XQ_API_KEY: "YOUR_XQ_API_KEY"
});

new ExchangeForAccessToken(sdk).supplyAsync(null).then((response) => {
  switch (response.status) {
    case ServerResponse.OK: {
      // Success. A new access token has been added to the active user profile.
      break;
    }
    case ServerResponse.ERROR: {
      // Something went wrong...
      break;
    }
  }

  return response;
});
```

### Revoking Key Access

Revokes a key using its token. Only the user who sent the message will be able to revoke it.

**Warning: This action is not reversible.**

```javascript
import { RevokeKeyAccess, ServerResponse, XQSDK } from "@xqmsg/jssdk-core";

const sdk = new XQSDK({
  XQ_API_KEY: "YOUR_XQ_API_KEY"
});

new RevokeKeyAccess(sdk)
  .supplyAsync({ [RevokeKeyAccess.LOCATOR_KEY]: "message_locator_token" })
  .then((response) => {
    switch (response.status) {
      case ServerResponse.OK: {
        // Success. Key was revoked successfully.
        break;
      }
      case ServerResponse.ERROR: {
        // Something went wrong...
        break;
      }
    }

    return response;
  });
```

### Granting and Revoking User Access

There may be cases where additional users need to be granted access to a previously sent message, or access needs to be revoked. This can be achieved via **GrantUserAccess** and **RevokeUserAccess** respectively:

```javascript
import { GrantUserAccess, ServerResponse, XQSDK } from "@xqmsg/jssdk-core";

const sdk = new XQSDK({
  XQ_API_KEY: "YOUR_XQ_API_KEY"
});

// Grant access to additional users.
new GrantUserAccess(sdk)
  .supplyAsync({
    [GrantUserAccess.RECIPIENTS]: ["john@email.com"],
    [GrantUserAccess.LOCATOR_TOKEN]: "message_locator_token",
  })
  .then((response) => {
    switch (response.status) {
      case ServerResponse.OK: {
        // Success. John will now be able to read that message.
        break;
      }
      case ServerResponse.ERROR: {
        // Something went wrong...
        break;
      }
    }

    return response;
  });
```

```javascript
import { RevokeUserAccess, ServerResponse, XQSDK } from "@xqmsg/jssdk-core";

const sdk = new XQSDK({
  XQ_API_KEY: "YOUR_XQ_API_KEY"
});

// Revoke access from particular users.
new RevokeUserAccess(sdk)
  .supplyAsync({
    [RevokeUserAccess.RECIPIENTS]: ["jack@email.com"],
    [RevokeUserAccess.LOCATOR_TOKEN]: "message_locator_token",
  })
  .then((response) => {
    switch (response.status) {
      case ServerResponse.OK: {
        // Success - Jack will no longer be able to read that message.
        break;
      }
      case ServerResponse.ERROR: {
        // Something went wrong...
        break;
      }
    }

    return response;
  });
```

### Connect to an alias account

After creation, a user can connect to an Alias account by using the **`AuthorizeAlias`** endpoint:

```javascript
import { AuthorizeAlias, ServerResponse, XQSDK } from "@xqmsg/jssdk-core";

const sdk = new XQSDK({
  XQ_API_KEY: "YOUR_XQ_API_KEY",
});

const aliasId = "1234567"; // The external user ID.

new AuthorizeAlias(sdk)
  .supplyAsync({
    [AuthorizeAlias.USER]: aliasId, // The external ID
  })
  .then((response) => {
    switch (response.status) {
      case ServerResponse.OK: {
        // Success - The alias user was authorized.
        break;
      }
      case ServerResponse.ERROR: {
        // Something went wrong...
        break;
      }
    }

    return response;
  });
```

---

## Manual key management

A user has the option of only using XQ for its key management services alone. The necessary steps to do this are detailed below:

### 1. Get quantum entropy ( Optional )

XQ provides a quantum source that can be used to generate entropy for seeding their encryption key:

```javascript
import { FetchQuantumEntropy, ServerResponse, XQSDK } from "@xqmsg/jssdk-core";

const sdk = new XQSDK({
  XQ_API_KEY: "YOUR_XQ_API_KEY"
});


const payload = {
    [FetchQuantumEntropy.KS]: FetchQuantumEntropy._256
};

new FetchQuantumEntropy(sdk)
    .supplyAsync(payload)
    .then((response: ServerResponse) => {
        switch (response.status) {
            case ServerResponse.OK: {
                let key = response.payload;
                // Do something with the key
                break;
            }
            case ServerResponse.ERROR: {
                // Something went wrong...
                break;
            }
        }
        return response;
    });
```

### 2. Generate a key packet

In this step, the credentials of the user is validated. The encryption key, authorized recipients, as well as any additional metadata is sent to the XQ subscription server. Once the user is validated, a signed and encrypted key packet is generated returned to the user

```javascript
import { GeneratePacket, ServerResponse, XQSDK } from "@xqmsg/jssdk-core";

const sdk = new XQSDK({
  XQ_API_KEY: "YOUR_XQ_API_KEY"
});


const payload = {
    [GeneratePacket.KEY]: "THE_ENCRYPTION_KEY",
    [GeneratePacket.RECIPIENTS]: ["jane@email.com", "jack@email.com"],
    [GeneratePacket.EXPIRES_HOURS]: 24,
    [GeneratePacket.DELETE_ON_RECEIPT]: false
};

new GeneratePacket(sdk)
    .supplyAsync(payload)
    .then((response: ServerResponse) => {
        switch (response.status) {
            case ServerResponse.OK: {
                 let locatorToken = response.payload;
                 // This is the locator token that can later on be used
                 // to retrieve the key by valid recipients.
                break;
            }
            case ServerResponse.ERROR: {
                // Something went wrong...
                break;
            }
        }
        return response;
    });
```

### 3. Retrieve a key from server

When a user receives an encrypted data, they will be able to use the corresponding key locator token to retrieve the encryption key. In order to do so, they may need to be signed into XQ as one of the message recipients.

```javascript
import { FetchKey, ServerResponse, XQSDK } from "@xqmsg/jssdk-core";

const sdk = new XQSDK({
  XQ_API_KEY: "YOUR_XQ_API_KEY"
});


const payload = {
    [FetchKey.LOCATOR_KEY]: "KEY_LOCATOR_TOKEN" 
};

new FetchKey(this.sdk)
        .supplyAsync(payload)
        .then((response: ServerResponse) => {
            switch (response.status) {
                case ServerResponse.OK: {
                    let encryptionKey = response.payload;
                          // The received key can now be used to decrypt the original message.
                        }
                        case ServerResponse.ERROR: {
                        // Something went wrong...
                        break;
                    }
                }
                return response;
            });
```

---

## Dashboard Management

The SDK provides limited functionality for dashboard administration. In order to use any of the services listed in this section
a user must be signed into XQ with an authorized email account associated with the management portal.

- [Authorization](#connecting-to-the-dashboard)
- [Businesses](#managing-a-business)
- [Applications](#managing-an-application)
- [User Groups](#managing-a-user-group)
- [Contacts](#using-an-external-id-based-contact-for-tracking)
- [Event Logs](#using-event-logs)
- [Workspaces](#managing-a-workspace)

### Connecting to the Dashboard

Once a you are connected to the dashboard via `DashboardLogin`, you can now query for the current authorized user. There is also a service - `VerifyAccount` - that allows access to dashboard services by exchanging an access token.

```javascript
// Dashboard login
import { 
  DashboardLogin, 
  GetCurrentUser,
  ServerResponse,
  VerifyAccount, 
  XQSDK 
} from "@xqmsg/jssdk-core";

const sdk = new XQSDK({
  DASHBOARD_API_KEY: "YOUR_DASHBOARD_API_KEY"
});

new DashboardLogin(sdk)
  .supplyAsync(null)
  .then((response) => {
    switch (response.status) {
      case ServerResponse.OK: {
        // Success. New dashboard access token will be stored
        // for the current profile.
        const dashboardAccessToken = response.payload;
        break;
      }
      case ServerResponse.ERROR: {
        // Something went wrong...
        break;
      }
    }

    return response;
  });

// Get current user
new GetCurrentUser(sdk)
  .supplyAsync(null)
  .then((response) => {
    switch (response.status) {
      case ServerResponse.OK: {
        // Success. Now you have access to the current authorized user.
        const data = response.payload;
        const currentUser = data[GetCurrentUser.CONTACT];
        break;
      }
      case ServerResponse.ERROR: {
        // Something went wrong...
        break;
      }
    }

    return response;
  });

// Verify account
new VerifyAccount(sdk)
  .supplyAsync({
    [VerifyAccount.ACCESS_TOKEN]: "my_access_token"
  })
  .then((response) => {
    switch (response.status) {
      case ServerResponse.OK: {
        // Success. You are now authorized to access the dashboard services.
        const data = response.payload;
        const {user, dashboardAccessToken} = data;
        break;
      }
      case ServerResponse.ERROR: {
        // Something went wrong...
        break;
      }
    }

    return response;
  });
```

### Managing a business
Users may create a business - inviting others via email. Creators of a business are added with the role of `SuperUser`, and are allowed to give and restrict permissions of members of the business. Depending on the role of certain members, they may be able to perform such actions like user and application management.

The SDK provides a variety of CRUD services for businesses, such as `AddBusiness`, `GetBusinesses`, `GetCurrentBusiness`, and `UpdateBusiness`. You also have the ability to lookup all available communications of a business or a workspace. This also applies to personal communications/applications.

```javascript
import { 
  AddBusiness, 
  GetBusinesses,
  GetCommunications,
  GetCurrentBusiness,
  ServerResponse, 
  UpdateBusiness,
  XQSDK 
} from "@xqmsg/jssdk-core";

const sdk = new XQSDK({
  DASHBOARD_API_KEY: "YOUR_DASHBOARD_API_KEY"
});

// Get list of businesses current user belongs to
new GetBusinesses(sdk)
  .supplyAsync(null)
  .then((response) => {
    switch (response.status) {
      case ServerResponse.OK: {
        // Success. The list of businesses were returned.
        const data = response.payload;
        const businesses = data[GetBusinesses.BUSINESSES];
        // The format of businesses is {canAccessBusiness: boolean, domain: string, id: int, isPersonal: boolean, name: string}[]
        break;
      }
      case ServerResponse.ERROR: {
        // Something went wrong...
        break;
      }
    }

    return response;
  });

// Add a new business
new AddBusiness(sdk)
  .supplyAsync({
    [AddBusiness.EMAIL]: "jack@email.com",
    [AddBusiness.WORKSPACE]: "my_workspace",
    [AddBusiness.NAME]: "My Workspace",
    [AddBusiness.ADMIN_EMAIL]: "jack@email.com",
    [AddBusiness.ADMIN_FIRST]: "Jack",
    [AddBusiness.ADMIN_LAST]: "Smith",
    [AddBusiness.STREET]: "123 Business Avenue",
    [AddBusiness.CITY]: "New York",
    [AddBusiness.STATE]: "New York",
    [AddBusiness.COUNTRY]: "USA",
    [AddBusiness.TELEPHONE]: "123-456-7890",
    [AddBusiness.POSTAL]: "12345",
    [AddBusiness.TAG]: "Our new business!",
    [AddBusiness.CONVERT_FROM_EXISTING]: false,
  })
  .then((response) => {
    switch (response.status) {
      case ServerResponse.OK: {
        // Success. The access token for the newly created business is returned.
        const accessToken = response.payload;
        break;
      }
      case ServerResponse.ERROR: {
        // Something went wrong...
        break;
      }
    }

    return response;
  });

// Update an existing business
new UpdateBusiness(sdk)
  .supplyAsync({
    [UpdateBusiness.EMAIL]: "jane@email.com",
    [UpdateBusiness.WORKSPACE]: "my_workspace",
    [UpdateBusiness.NAME]: "My Workspace",
    [UpdateBusiness.STREET]: "123 Business Avenue",
    [UpdateBusiness.CITY]: "New York",
    [UpdateBusiness.STATE]: "New York",
    [UpdateBusiness.COUNTRY]: "USA",
    [UpdateBusiness.TELEPHONE]: "123-456-7890",
    [UpdateBusiness.POSTAL]: "12345",
    [UpdateBusiness.TAG]: "Our updated business!",
    [UpdateBusiness.LOCKED]: false,
  })
  .then((response) => {
    switch (response.status) {
      case ServerResponse.OK: {
        // Success. The business was updated.
        break;
      }
      case ServerResponse.ERROR: {
        // Something went wrong...
        break;
      }
    }

    return response;
  });

// Get current business of authenticated user
new GetCurrentBusiness(sdk)
  .supplyAsync(null)
  .then((response) => {
    switch (response.status) {
      case ServerResponse.OK: {
        // Success. The current business is returned.
        // The type of currentBusiness is CurrentBusinessSummary.
        const currentBusiness = response.payload
        break;
      }
      case ServerResponse.ERROR: {
        // Something went wrong...
        break;
      }
    }

    return response;
  });

// Get all communications of a business/workspace
// All filter values are optional
new GetCommunications(sdk)
  .supplyAsync({
    [GetCommunications.FROM]: 1651152663689,
    [GetCommunications.LIMIT]: 10,
    [GetCommunications.PAGE]: 0,
    [GetCommunications.RECIPIENTS]: ["jane@email.com", "jack@email.com"],
    // Generic search field by user defined input
    [GetCommunications.SEARCH]: "regex_value",
    // 0 - Available, 1 - Revoked, 2 - Expired
    [GetCommunications.STATUS]: [0, 1, 2],
    // 1 - Good, 2 - Warning, 3 - Threat
    [GetCommunications.THREATS]: [1, 2, 3],
    [GetCommunications.TO]: 1651152675602,
    // 0 - Unknown, 1 - File, 2 - Email, 3 - Chat, 4 - Form
    [GetCommunications.TYPE]: [0, 1, 2, 3, 4],
    [GetCommunications.TZ]: 12,
    [GetCommunications.USERS]: ["joe@email.com", "john@email.com"]
  })
  .then((response) => {
    switch (response.status) {
      case ServerResponse.OK: {
        // Success. The list of communications were returned.
        const data = response.payload;
        const communications = data[GetBusinesses.COMMUNICATIONS];
        break;
      }
      case ServerResponse.ERROR: {
        // Something went wrong...
        break;
      }
    }

    return response;
  });
```

### Managing an application
Once you have a business created, you may create applications under your current business. The number of applications a single business can have are limited - If the limit is reached, older keys may be removed in order to add new ones.

The SDK provides a variety of CRUD services for applications, such as `AddApplication`, `GetApplications`, `RemoveApplication`, and `UpdateApplication`.

``` javascript
import { 
  AddApplication,
  GetApplications,
  RemoveApplication,
  ServerResponse, 
  UpdateApplication, 
  XQSDK 
} from "@xqmsg/jssdk-core";

const sdk = new XQSDK({
  DASHBOARD_API_KEY: "YOUR_DASHBOARD_API_KEY"
});

// Get all applications of a business/workspace
new GetApplications(sdk)
  .supplyAsync(null)
  .then((response) => {
    switch (response.status) {
      case ServerResponse.OK: {
        // Success. The list of communications were returned.
        const data = response.payload;
        const apps = data[GetApplications.APPS];
        // The format of apps is {id:int, name:string, desc:string}[]
        break;
      }
      case ServerResponse.ERROR: {
        // Something went wrong...
        break;
      }
    }

    return response;
  });

// Add a new application to the current business/workspace
new AddApplication(sdk)
  .supplyAsync({
    [AddApplication.NAME]: "My App Name",
    [AddApplication.DESC]: "My app description",
  })
  .then((response) => {
    switch (response.status) {
      case ServerResponse.OK: {
        // Success. The new application was created.
        const data = response.payload;
        // The id of the new application.
        const id = data.id
        break;
      }
      case ServerResponse.ERROR: {
        // Something went wrong...
        break;
      }
    }

    return response;
  });

// Update an existing application
new UpdateApplication(sdk)
  .supplyAsync({
    [UpdateApplication.ID]: 123,
    [UpdateApplication.NAME]: "My App Name",
    [UpdateApplication.DESC]: "My app description",
  })
  .then((response) => {
    switch (response.status) {
      case ServerResponse.OK: {
        // Success. The application was updated.
        break;
      }
      case ServerResponse.ERROR: {
        // Something went wrong...
        break;
      }
    }

    return response;
  });

// Remove an existing application
new RemoveApplication(sdk)
  .supplyAsync({
    [RemoveApplication.ID]: 123,
  })
  .then((response) => {
    switch (response.status) {
      case ServerResponse.OK: {
        // Success. The application was removed.
        break;
      }
      case ServerResponse.ERROR: {
        // Something went wrong...
        break;
      }
    }

    return response;
  });
```

### Managing a user group

Users may group a number of emails accounts under a single alias. Doing this makes it possible to add all of the associated email accounts to an outgoing message by adding that alias as a message recipient instead. Note that changing the group members does not affect the access rights of messages that have previously been sent. 

Additionally, the SDK provides services for finding, updating, and removing user groups.

```javascript
import { 
  AddUserGroup, 
  FindUserGroups, 
  RemoveUserGroup, 
  ServerResponse, 
  UpdateUserGroup,
  XQSDK 
} from "@xqmsg/jssdk-core";

const sdk = new XQSDK({
  DASHBOARD_API_KEY: "YOUR_DASHBOARD_API_KEY"
});

// Add a user group
new AddUserGroup(sdk)
  .supplyAsync({
    [AddUserGroup.NAME]: "New Test Generated User Group",
    [AddUserGroup.MEMBERS]: ["john@email.com", "jane@email.com"],
  })
  .then((response) => {
    switch (response.status) {
      case ServerResponse.OK: {
        // Success. The new user group was created.
        const data = response.payload;
        const groupId = data[AddUserGroup.ID];
        // The new group email format is {groupId}@group.local
        break;
      }
      case ServerResponse.ERROR: {
        // Something went wrong...
        break;
      }
    }

    return response;
  });

// Find user groups
new FindUserGroups(sdk)
  .supplyAsync(null)
  .then((response) => {
    switch (response.status) {
      case ServerResponse.OK: {
        // Success. The user group were found.
        const groups = response.payload;
        // The format of groups is {id:int, name:string, bid:int}[]
        break;
      }
      case ServerResponse.ERROR: {
        // Something went wrong...
        break;
      }
    }

    return response;
  });

// Remove user groups
new RemoveUserGroup(sdk)
  .supplyAsync({
    [RemoveUserGroup.ID]: "1234567"
  })
  .then((response) => {
    switch (response.status) {
      case ServerResponse.OK: {
        // Success. The user group was removed.
        break;
      }
      case ServerResponse.ERROR: {
        // Something went wrong...
        break;
      }
    }

    return response;
  });

// Update a user group
new UpdateUserGroup(sdk)
  .supplyAsync({
    [UpdateUserGroup.ID]: "1234567"
    [UpdateUserGroup.NAME]: "Updated User Group",
    [UpdateUserGroup.MEMBERS]: ["john@email.com", "jane@email.com"],
  })
  .then((response) => {
    switch (response.status) {
      case ServerResponse.OK: {
        // Success. The user group was updated.
        break;
      }
      case ServerResponse.ERROR: {
        // Something went wrong...
        break;
      }
    }

    return response;
  });
    
```

### Using an external ID-based contact for tracking

In situations where a user may want to associate an external account with an XQ account for the purposes of encryption and tracking , they can choose to create an account with an **Alias** role.

These type of accounts will allow user authorization using only an account ID. However, these accounts have similar restrictions to anonymous accounts: They will be incapable of account management, and also have no access to the dashboard. However - unlike basic anonymous accounts - they can be fully tracked in a dashboard portal.

After an account is created, you now have the ability to look up contacts as well as disable and remove contacts.

```javascript
import { 
  AddContact, 
  DisableContact,
  GetContacts,
  RemoveContacts,
  ServerResponse, 
  XQSDK 
  } from "@xqmsg/jssdk-core";

const sdk = new XQSDK({
  DASHBOARD_API_KEY: "YOUR_DASHBOARD_API_KEY",
});

// Add a contact
new AddContact(sdk)
  .supplyAsync({
    [AddContact.EMAIL]: "1234567",
    [AddContact.NOTIFICATIONS]: NotificationEnum.NONE,
    [AddContact.ROLE]: RolesEnum.ALIAS,
    [AddContact.TITLE]: "External",
    [AddContact.FIRST_NAME]: "John",
    [AddContact.LAST_NAME]: "Doe",
  })
  .then((response) => {
    switch (response.status) {
      case ServerResponse.OK: {
        // Success. The contact was created.
        break;
      }
      case ServerResponse.ERROR: {
        // Something went wrong...
        break;
      }
    }

    return response;
  });
```
// Disable a contact
new DisableContact(sdk)
  .supplyAsync({
    [DisableContact.ID]: "1234567"
  })
  .then((response) => {
    switch (response.status) {
      case ServerResponse.OK: {
        // Success. The contact was disabled.
        break;
      }
      case ServerResponse.ERROR: {
        // Something went wrong...
        break;
      }
    }

    return response;
  });

// Get contacts
new GetContacts(sdk)
  .supplyAsync(null)
  .then((response) => {
    switch (response.status) {
      case ServerResponse.OK: {
        // Success. The contact was disabled.
        const data = response.payload;
        const contacts = data[GetContacts.CONTACT]
        // The format of contacts is ContactSummary[].
        break;
      }
      case ServerResponse.ERROR: {
        // Something went wrong...
        break;
      }
    }

    return response;
  });

// Disable a contact
new RemoveContact(sdk)
  .supplyAsync({
    [RemoveContact.ID]: "1234567"
  })
  .then((response) => {
    switch (response.status) {
      case ServerResponse.OK: {
        // Success. The contact was removed.
        break;
      }
      case ServerResponse.ERROR: {
        // Something went wrong...
        break;
      }
    }

    return response;
  });
```

### Using event logs
Each communication that a user interacts with has logs associated with it. Each log will contain a key of `action`, describing what how the user associated with the log interacted with the communication. This allows for in depth tracking of communications - giving you the ability closely monitor where a communication is being accessed from, associated threat level of the action, who the sender/recipients are, and much more.

Additionally you may fetch a list of all possible event types in a business/workspace. This includes any custom events that have been defined by the user.

```javascript
import { 
  GetEventLogs,
  GetEventTypes,
  ServerResponse, 
  XQSDK 
  } from "@xqmsg/jssdk-core";

const sdk = new XQSDK({
  DASHBOARD_API_KEY: "YOUR_DASHBOARD_API_KEY",
});

// Get all event logs 
// All filter values are optional
new GetEventLogs(sdk)
  .supplyAsync({
      [GetEventLogs.ACTION]: "val://fetchkey",
      [GetEventLogs.APP_ID]: 123,
      [GetEventLogs.DATA]: "regex_value",
      [GetEventLogs.FROM]: 1651154630843,
      [GetEventLogs.FULL]: true,
      [GetEventLogs.KEY_ID]: 456,
      [GetEventLogs.LIMIT]: 10,
      [GetEventLogs.PAGE]: 0,
      [GetEventLogs.REGEX]: true,
      [GetEventLogs.THREAT]: [1, 2, 3],
      [GetEventLogs.TO]: 1651154637868,
      [GetEventLogs.USER]: [1, 2, 3]
  })
  .then((response) => {
    switch (response.status) {
      case ServerResponse.OK: {
        // Success. The event logs were returned.
        const data = response.payload
        const eventLogs = data[GetEventLogs.LOG]
        // The format of eventLogs is EventLogItem[]
        break;
      }
      case ServerResponse.ERROR: {
        // Something went wrong...
        break;
      }
    }

    return response;
  });

// Get all event types
new GetEventTypes(sdk)
  .supplyAsync(null)
  .then((response) => {
    switch (response.status) {
      case ServerResponse.OK: {
        // Success. The event logs were returned.
        const data = response.payload
        const eventTypes = data[GetEventLogs.EVENT_TYPES]
        // The format of eventLogs is EventType[]
        break;
      }
      case ServerResponse.ERROR: {
        // Something went wrong...
        break;
      }
    }

    return response;
  });
```
<<<<<<< HEAD

### Managing workspaces
Users may query for workspace related information. The SDK provides `GetWorkspaces`, a service that allows you to query for a list of workspaces a user belongs to. The query uses a user email as the unique identifier for the user.

```javascript
import { 
  GetWorkspaces,
  ServerResponse, 
  XQSDK 
} from "@xqmsg/jssdk-core";

const sdk = new XQSDK({
  DASHBOARD_API_KEY: "YOUR_DASHBOARD_API_KEY"
});

// Get list of workspaces a given user belongs to
new GetWorkspaces(sdk)
  .supplyAsync({
    [GetWorkspaces.EMAIL]: "joe@email.com"
  })
  .then((response) => {
    switch (response.status) {
      case ServerResponse.OK: {
        // Success. The list of businesses were returned.
        const data = response.payload;
        const workspaces = data[GetWorkspaces.WORKSPACES];
        // The format of workspaces is WorkspaceSummary[]
        break;
      }
      case ServerResponse.ERROR: {
        // Something went wrong...
        break;
      }
    }

    return response;
  });
```
=======
>>>>>>> 72cc2eeb45466656e5e497def76cf5e6f4f146c9
