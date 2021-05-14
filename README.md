## jssdk-core

A Javascript Implementation of XQ Message SDK, V.2

## _API Keys_

##### Two API keys are required for interaction with the XQ Message Framework and the Dashboard Application

They can be created under https://manage.xqmsg.com/applications.
Go to your application  and press "Add A New Key"
To create an XQ framework key  select "General" To create a Dashboard key select "Dashboard".
Once  created, add them to  [Config.js](./src/com/xqmsg/sdk/v2/Config.js)_

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
const xqsdk = new XQSDK();               
let payload = {
 [Encrypt.prototype.USER]:<some-email>,                      
 [Encrypt.prototype.TEXT]: <some-text>,
 [Encrypt.prototype.RECIPIENTS]:[<some-email>,<another-email>,...],
 [Encrypt.prototype.EXPIRES_HOURS]:[0,9]+
};
              
new Encrypt(xqsdk, xqsdk.getAlgorithm(algorithm))
     .supplyAsync(payload)
     .then(function (encryptResponse) {
         switch (encryptResponse.status) {
          case ServerResponse.prototype.OK: {
            const data = encryptResponse.payload;
            const locatorKey = data[Encrypt.prototype.LOCATOR_KEY];
            const encryptedText =data[Encrypt.prototype.ENCRYPTED_TEXT];
          }
         }
     });
```
#### Decrypting a message
For decryption supply a piece of textual data along with the locator key you received when encrypting
```
const xqsdk = new XQSDK();
new Decrypt(xqsdk, xqsdk.getAlgorithm(<OPTV2-or-AES>))
   .supplyAsync({
   [Decrypt.prototype.LOCATOR_KEY]: <locator-key>,  
   [Decrypt.prototype.ENCRYPTED_TEXT]: <some-encrypted-text>})
           .then(function (decryptResponse) {
               switch (decryptResponse.status) {
                  case ServerResponse.prototype.OK: {
                      const data = decryptResponse.payload;
const decryptedText = data[EncryptionAlgorithm.prototype.DECRYPTED_TEXT];
                               
                        }
                    });
```
#### Encrypting a file
For file encryption supply the path to the unencrypted source document as well as a
path to the target document to contain the encrypted data, along with the author's email,
one or more emails of intended recipients and the life-span of the message.
```
const xqsdk = new XQSDK();
var algorithm = xqsdk.getAlgorithm(<OPTV2-or-AES>);

new FileEncrypt(xqsdk, algorithm)
         .supplyAsync({
 [FileEncrypt.prototype.USER]: <some-email>,
 [FileEncrypt.prototype.RECIPIENTS]: [<some-email>,<another-email>,...],
 [FileEncrypt.prototype.EXPIRES_HOURS]: [0-9]+,
 [FileEncrypt.prototype.SOURCE_FILE]: <some-file>
 }).then(async function (serverResponse) {
    switch (serverResponse.status) {
     case ServerResponse.prototype.OK: {
         var encryptedFile = serverResponse.payload;
         //do sometthing with the encryptd file         
          }
    });
                           
```
#### Decrypting a file
For file decryption supply the path to the encrypted source document as well as a <br> path to the target document to contain the decryped data.
```
const xqsdk = new XQSDK();
var algorithm = xqsdk.getAlgorithm(<OPTV2-or-AES>);

 new FileDecrypt(xqsdk, algorithm)
 .supplyAsync({[FileDecrypt.prototype.SOURCE_FILE]: <some-encrypted-file>})
 .then(async function (serverResponse) {
                switch (serverResponse.status) {
                    case ServerResponse.prototype.OK: {
                        var decryptedFile = serverResponse.payload;
                     }  
                }
  });
```
#### Authorizing
Request an access token for a particular email address. If successful, the user will receive an email containing a PIN and a validation link. The user can choose to either click the link, or use the PIN via CodeValidator.

The service itself will return a pre-authorization token that can be exchanged for a full access token once validation is complete.
```
const xqsdk = new XQSDK();

 new Authorize(xqsdk)
    .supplyAsync({[Authorize.prototype.USER]: <some-email>})
    .then(function (response) {
        switch (response.status) {
            case ServerResponse.prototype.OK: {
               //do something
            }
        }
    })
```
#### Gaining Access, Validating and gettting an Access Token

Authenticate the PIN that was sent to a users email and, if valid exchange the  temporary access token with a permanent one which is added to the active user profile
```
const xqsdk = new XQSDK();
    
new CodeValidator(xqsdk);
            .supplyAsync({[codeValidator.PIN]: [0-9]{5}})
            .then(function (serverResponse) {
                switch (serverResponse.status) {
                    case ServerResponse.prototype.OK: {
                    // At this point code was validiated and 
                    //the temporary access token was exchanged 
                    //for a permanent one which is added to the active user profile.
                    }
                }
           });
```


#### Revoking Key Access
Revokes a key using its token. Only the user who sent the message will be able to revoke it. **Note that this action is not reversible**
```
const xqsdk = new XQSDK();

return new RevokeKeyAccess(xqsdk)
   .supplyAsync({[RevokeKeyAccess.prototype.LOCATOR_KEY]: <a-locator-key>})
 .then(function (serverResponse) {
                   switch (serverResponse.status) {
                       case ServerResponse.prototype.OK: {
                           let noContent = serverResponse.payload;
                       }  
                   }
               }
           ));
```
------