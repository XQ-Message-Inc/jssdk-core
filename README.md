## jssdk-core

A Javascript Implementation of XQ Message SDK (V.2) which provides convenient access to the XQ Message API.

## Table of contents

- [Sample Applications](#sample-applications)
- [Installation](#installation)
- [Generating API Keys](#api-keys)
- [Basic Usage](#basic-usage)
- [Initializing the XQ Javascript SDK](#initializing-the-sdk)
- [Encrypt](#encrypting-a-message)
- [Decrypt](#decrypting-a-message)
- [FileEncrypt](#encrypting-a-file)
- [FileDecrypt](#decrypting-a-file)
- [Authorize](#authorization)
- [Revoke Key Access](#revoking-key-access)
- [GrantUserAccess](#granting-and-revoking-user-access)
- [DashboardLogin](#connecting-to-the-dashboard)
- [AddUserGroup](#admin-managing-a-user-group)
- [AddContact](#admin-using-an-external-id-based-contact-for-tracking)
- [AuthorizeAlias](#admin-connect-to-an-alias-account)

---

## Sample Applications

Besides the core API code, the `jssdk-core` project also contains two web applications.

They are intended to give the user a high-level overview of the encryption and decryption flow, as well as some sample implementations of core components. In order to run these applications you will need to generate XQ Message [API keys](#api-keys) and input them in both the `demo.js` and `TestLauncher.js` files.

To run the sample applications, simply run:

**Demo**
To run the Demo application, first input your API keys in the `XQSDK` configuration in [demo.js](#./demo/demo.js) then run:

```sh
yarn dev
```

**Tests**
To run the Demo application, first input your API keys in the `XQSDK` configuration in [TestLauncher.js](#./tests/TestLauncher.js) then run:

```sh
yarn dev-test
```

---

## Installation

Install the package with:

```sh
yarn add @xqmsg/jssdk-core
# or
npm install @xqmsg/jssdk-core
```

#### Requirements

Node 8, 10 or higher.

#### API Keys

In order to utilize the XQ SDK and interact with XQ servers you will need both the **`General`** and **`Dashboard`** API keys. To generate these keys, follow these steps:

1. Go to your [XQ management portal](https://manage.xqmsg.com/applications).
2. Select or create an application.
3. Create a **`General`** key for the XQ framework API.
4. Create a **`Dashboard`** key for the XQ dashboard API.

---

## Basic Usage

#### Initializing the SDK

To initialize an XQ SDK instance in your JavaScript application, provide the generated `XQ_API_KEY` (General) and `DASHBOARD_API_KEY` (Dashboard) API keys as shown below:

```javascript
const sdk = new XQSDK({
  XQ_API_KEY: "YOUR_XQ_API_KEY",
  DASHBOARD_API_KEY: "YOUR_DASHBOARD_API_KEY",
});
```

**_Note: You only need to generate one SDK instance for use across your application._**

#### Encrypting a message

The text to be encrypted should be submitted along with the email addresses of the intended recipients and the amount of time that the message should be available.

```javascript
const sdk = new XQSDK({
  XQ_API_KEY: "YOUR_XQ_API_KEY",
  DASHBOARD_API_KEY: "YOUR_DASHBOARD_API_KEY",
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

#### Decrypting a message

To decrypt a message, the encrypted payload must be provided, along with the locator token received from XQ during encryption. The authenticated user must be one of the recipients that the message was originally sent to ( or the sender themselves).

```javascript
const sdk = new XQSDK({
  XQ_API_KEY: "YOUR_XQ_API_KEY",
  DASHBOARD_API_KEY: "YOUR_DASHBOARD_API_KEY",
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

#### Encrypting a file

Here, a `File` object containing the data for encryption must be provided. Like message encryption, a list of recipients who will be able to decrypt the file, as well as the amount of time before expiration must also be provided.

```javascript
const sdk = new XQSDK({
  XQ_API_KEY: "YOUR_XQ_API_KEY",
  DASHBOARD_API_KEY: "YOUR_DASHBOARD_API_KEY",
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

#### Decrypting a file

To decrypt a file, the URI to the XQ encrypted file must be provided. The user decrypting the file must be one of the recipients original specified ( or the sender ).

```javascript
const sdk = new XQSDK({
  XQ_API_KEY: "YOUR_XQ_API_KEY",
  DASHBOARD_API_KEY: "YOUR_DASHBOARD_API_KEY",
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

#### Authorization

Request an access token for a particular email address. If successful, the user will receive an email containing a PIN and a validation link.

The service itself will return a pre-authorization token that can be exchanged for a full access token once validation is complete.

```javascript
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

At this point,the user can submit the PIN they received using the `CodeValidator` class. Once submitted and validated, the temporary token they received previously will be replaced for a valid access token that can be used for other requests:

```javascript
new CodeValidator(sdk)
  .supplyAsync({ [codeValidator.PIN]: "123456" })
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

#### Revoking Key Access

Revokes a key using its token. Only the user who sent the message will be able to revoke it. **Note that this action is not reversible**

```javascript
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

#### Granting and Revoking User Access

There may be cases where additional users need to be granted access to a previously sent message, or access needs to be revoked. This can be achieved via **GrantUserAccess** and **RevokeUserAccess** respectively:

```javascript
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
// Revoke access from particular users.
new RevokeUserAccess(sdk)
  .supplyAsync({
    [GrantUserAccess.RECIPIENTS]: ["jack@email.com"],
    [GrantUserAccess.LOCATOR_TOKEN]: "message_locator_token",
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

#### Connecting to the Dashboard

The SDK provides limited functionality for dashboard administration. Before using any dashboard-specific features, a user would perform the following after signing into XQ with an authorized email account associated with the management portal:

```javascript
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

#### Admin: Managing a User Group

Users may group a number of emails accounts under a single alias. Doing this makes it possible to add all of the associated email accounts to an outgoing message by adding that alias as a message recipient instead. Note that changing the group members does not affect the access rights of messages that have previously been sent.

```javascript
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

#### Admin: Using an external ID-based contact for tracking

In situations where a user may want to associate an external account with an XQ account for the purposes of encryption and tracking , they can choose to create an account with an **Alias** role.

These type of accounts will allow user authorization using only an account ID. However, these accounts have similar restrictions to anonymous accounts: They will be incapable of account management, and also have no access to the dashboard. However - unlike basic anonymous accounts - they can be fully tracked in a dashboard portal.

```javascript
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

#### Admin: Connect to an alias account

After creation, a user can connect to an Alias account by using the **`AuthorizeAlias`** endpoint:

```javascript
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
