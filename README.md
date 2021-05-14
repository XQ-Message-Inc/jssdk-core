## jssdk-core

A Javascript Implementation of XQ Message SDK, V.2

## _API Keys_
##### Two API keys are required for interaction with the XQ Message Framework and the Dashboard Application

* An xq framework api key can be obtained fomr https://manage.xqmsg.com/applications

*  _Once  created one, it must be insterted it into [Config.js](./src/com/xqmsg/sdk/v2/Config.js)_

````
	XQ_API_KEY = <xq-framework-api-key-goes-here>;
	DASHBOARD_API_KEY = <dashboard-framework-api-key-goes-here>;
````


## _Tests/Demo_
Besides the core API code, the jssdk-core  project also contains two web applications .
They are intended to give the user a high level overview of the enctpytion and decryption flow
as well as some sample implementations of  core components.
*  demo web app (a minimal  example of encryping and decrypting text)
*  tests web app (vaious tests using  the core api calls)

### Setup

-configure a suitable webserver to host the web applications contained in the  jssdk-core project.
index page for the demo web app :  jssdk-core/demo/html/demo.html  
index page to the tests web app:  jssdk-core/tests/html/tests.html

### Running Tests:

- Initially the api user will need to register with the XQ Framework.
  To do so, he clicks the "Register" button  which promts him for his email.
  A numeric authorization  token will be sent  to that email.
  That token is then entered into the input field and registration is oncluded once "Confirm" is   
  pressed.At this point the user is fully  authenticated with XQ. An access token is  stored in  
  his  local browser cache. This token is used to automatically authenticate the user with XQ  for
  most interactions. One can press "Clear Credentials" at any time to reauthenticate.

  _The  test suite has the following tests:_

  Test Get XQ Authorization Token From Active Profile
  Test Dashboard Login
  Test Get Dashboard Applications
  Test Add Dashboard Group
  Test Update Dashboard Group
  Test Remove Dashboard Group
  Test Add Dashboard Contact
  Test Disable Dashboard Contact
  Test Remove Dashboard Contact
  Test Get User Info
  Test Get User Settings
  Test Update User Settings
  Test Create Delegate Access Token
  Test OTP V2 Algorithm
  Test AES Algorithm
  Test Encrypt And Decrypt Text Using OTP V2
  Test Encrypt And Decrypt Text Using AES
  Test File Encrypt And File Decrypt Text Using OTP V2
  Test Combine Authorizations
  Test Delete Authorization
  Test Delete User
  Test Authorize Alias
  Test Check API Key
  Test Key Manipulations



------
## Functionality

#### Encrypting a message
For encryption supply a piece of textual data along with the author's email, one or more emails of intended
recipients and the intended life-span of the message.
```
                const usr = getProperty('user');
                const recipientsInput = $("#recipient-list-input")
                                                .val()
                                                .split(/,|\s+/g)
                                                .filter(function(el){return el != "" && el != null;});
                const text = $("#encrypt-input").val();
                const expiresHours = 1;
                const algorithm = $("#algorithmSelectBox").val();
                if(!["OTPV2", "AES"].includes(algorithm)){
                    console.error('Invalid algorithm selection : '+ algorithm + "! Select one of [OTPV2, AES]");
                    break;
                }
                setProperty("algorithm", algorithm);
                let payload = {[Encrypt.prototype.USER]: usr,
                    [Encrypt.prototype.TEXT]: text,
                    [Encrypt.prototype.RECIPIENTS]: recipientsInput,
                    [Encrypt.prototype.EXPIRES_HOURS]:expiresHours}

               ;
                new Encrypt(xqsdk, xqsdk.getAlgorithm(algorithm))
                    .supplyAsync(payload)
                    .then(function (encryptResponse) {
                        switch (encryptResponse.status) {
                            case ServerResponse.prototype.OK: {

                                const data = encryptResponse.payload;

                                const locatorKey = data[Encrypt.prototype.LOCATOR_KEY];
                                const encryptedText = data[Encrypt.prototype.ENCRYPTED_TEXT];

                                setProperty(Encrypt.prototype.LOCATOR_KEY, locatorKey);
                                setProperty(Encrypt.prototype.ENCRYPTED_TEXT, encryptedText);

                                buildIdentifyScreen();
                                break;

                            }
                            case ServerResponse.prototype.ERROR: {
                                console.info(encryptResponse);
                                break;
                            }
                        }
                    });
```
#### Decrypting a message
For decryption supply a piece of textual data along with the locator key you received when encrypting
```
                const locatorKey = getProperty(Encrypt.prototype.LOCATOR_KEY);
                const encryptedText = getProperty(Encrypt.prototype.ENCRYPTED_TEXT);
                 new Decrypt(xqsdk, xqsdk.getAlgorithm(getProperty("algorithm")))
                    .supplyAsync({[Decrypt.prototype.LOCATOR_KEY]: locatorKey, [Decrypt.prototype.ENCRYPTED_TEXT]: encryptedText})
                    .then(function (decryptResponse) {
                        switch (decryptResponse.status) {
                            case ServerResponse.prototype.OK: {
                                const data = decryptResponse.payload;
                                const decryptedText = data[EncryptionAlgorithm.prototype.DECRYPTED_TEXT];
                                setProperty("decryptedText", decryptedText);
                                buildDecryptScreen()
                                break;
                            }
                            case ServerResponse.prototype.ERROR: {
                                console.info(decryptResponse);
                                break;
                            }
                        }
                    });
```
#### Encrypting a file
For file encryption supply the path to the unencrypted source document as well as a
path to the target document to contain the encrypted data, along with the author's email,
one or more emails of intended recipients and the life-span of the message.
```
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
```
#### Decrypting a file
For file decryption supply the path to the encrypted source document as well as a <br> path to the target document to contain the decryped data.
```

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
```
#### Authorizing
Request an access token for a particular email address. If successful, the user will receive an email containing a PIN and a validation link. The user can choose to either click the link, or use the PIN via CodeValidator.

The service itself will return a pre-authorization token that can be exchanged for a full access token once validation is complete.
```
let user = $("#user-input").val();
setProperty('user', user);
 new Authorize(xqsdk)
    .supplyAsync({[Authorize.prototype.USER]: user})
    .then(function (response) {
        switch (response.status) {
            case ServerResponse.prototype.OK: {
                setProperty('next', 'encryptScreen');
                buildValidationScreen();
                break;
            }
            case ServerResponse.prototype.ERROR: {
                console.info(response);
                break;
            }
        }
    })
```
#### Gaining Access

Authenticate the PIN that was sent to a users email and return a validated temporary access token.
```
                let user = $("#user-input").val();
                setProperty('user', user);
                 new Authorize(xqsdk)
                    .supplyAsync({[Authorize.prototype.USER]: user})
                    .then(function (response) {
                        switch (response.status) {
                            case ServerResponse.prototype.OK: {
                                setProperty('next', 'encryptScreen');
                                buildValidationScreen();
                                break;
                            }
                            case ServerResponse.prototype.ERROR: {
                                console.info(response);
                                break;
                            }
                        }
                    })
```


#### Revoking Key Access
Revokes a key using its token. Only the user who sent the message will be able to revoke it. **Note that this action is not reversible**
```
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
```
------