# @xqmsg/jssdk-core

[![version](https://img.shields.io/badge/version-0.2-green.svg)](https://semver.org)

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

- [DashboardLogin](#connecting-to-the-dashboard)
- [AddUserGroup](#managing-a-user-group)
- [AddContact](#using-an-external-id-based-contact-for-tracking)

### Connecting to the Dashboard

```javascript
import { DashboardLogin, ServerResponse, XQSDK } from "@xqmsg/jssdk-core";

const sdk = new XQSDK({
  DASHBOARD_API_KEY: "YOUR_DASHBOARD_API_KEY"
});

new DashboardLogin(sdk).supplyAsync(null).then((response) => {
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
```

### Managing a user group

Users may group a number of emails accounts under a single alias. Doing this makes it possible to add all of the associated email accounts to an outgoing message by adding that alias as a message recipient instead. Note that changing the group members does not affect the access rights of messages that have previously been sent.

```javascript
import { AddUserGroup, ServerResponse, XQSDK } from "@xqmsg/jssdk-core";

const sdk = new XQSDK({
  DASHBOARD_API_KEY: "YOUR_DASHBOARD_API_KEY"
});

new AddUserGroup(sdk)
  .supplyAsync({
    [AddUserGroup.NAME]: "New Test Generated User Group",
    [AddUserGroup.MEMBERS]: ["john@email.com", "jane@email.com"],
  })
  .then((response) => {
    switch (response.status) {
      case ServerResponse.OK: {
        // Success. The new user group was created.
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
```

### Using an external ID-based contact for tracking

In situations where a user may want to associate an external account with an XQ account for the purposes of encryption and tracking , they can choose to create an account with an **Alias** role.

These type of accounts will allow user authorization using only an account ID. However, these accounts have similar restrictions to anonymous accounts: They will be incapable of account management, and also have no access to the dashboard. However - unlike basic anonymous accounts - they can be fully tracked in a dashboard portal.

```javascript
import { AddContact, ServerResponse, XQSDK } from "@xqmsg/jssdk-core";

const sdk = new XQSDK({
  DASHBOARD_API_KEY: "YOUR_DASHBOARD_API_KEY",
});

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
