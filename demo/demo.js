import ServerResponse from "./../src/com/xqmsg/sdk/v2/ServerResponse.js";
import Decrypt from "./../src/com/xqmsg/sdk/v2/services/Decrypt.js";
import Encrypt from "./../src/com/xqmsg/sdk/v2/services/Encrypt.js";
import Authorize from "../src/com/xqmsg/sdk/v2/services/Authorize.js";
import CodeValidator from "../src/com/xqmsg/sdk/v2/services/CodeValidator.js";
import EncryptionAlgorithm from "./../src/com/xqmsg/sdk/v2/algorithms/EncryptionAlgorithm.js";
import XQSDK from "./../src/com/xqmsg/sdk/v2/XQSDK.js";

import {
  removeAllProperties,
  setProperty,
  getProperty,
  replaceProperty,
} from "../src/com/xqmsg/sdk/v2/Commons";

var xqsdk = new XQSDK();

$(
  "#sender-access-request-button, #validate-access-request-button, #recipient-list-button, #recipient-access-request-button, #encrypt-button, #decrypt-button, #refresh-button"
).on("click", function (clickEvent) {
  switch (clickEvent.currentTarget.id) {
    case "sender-access-request-button":
      //initally clear out old stores
      removeAllProperties();

      let user = $("#user-input").val();
      setProperty("user", user);
      new Authorize(xqsdk)
        .supplyAsync({ [Authorize.USER]: user, [Authorize.CODE_TYPE]: "pin" })
        .then(function (response) {
          switch (response.status) {
            case ServerResponse.OK: {
              setProperty("next", "encryptScreen");
              buildValidationScreen();
              break;
            }
            case ServerResponse.ERROR: {
              console.info(response);
              break;
            }
          }
        });
      break;
    case "validate-access-request-button":
      new CodeValidator(xqsdk)
        .supplyAsync({ [CodeValidator.PIN]: $("#pin-input").val() })
        .then(function (validationResponse) {
          switch (validationResponse.status) {
            case ServerResponse.OK: {
              if (getProperty("next") === "encryptScreen") {
                buildEncryptScreen();
              } else {
                $("#decrypt-button").trigger("click", [$("#user-input").val()]);
              }
              break;
            }
            case ServerResponse.ERROR: {
              console.info(validationResponse);
              removeProperty("tempToken");
              break;
            }
          }
        });
      break;
    case "encrypt-button":
      const recipientsInput = $("#recipient-list-input")
        .val()
        .split(/,|\s+/g)
        .filter(function (el) {
          return el !== "" && el != null;
        });
      const text = $("#encrypt-input").val();
      const expiresHours = 1;
      const algorithm = $("#algorithmSelectBox").val();
      if (!["OTPV2", "AES"].includes(algorithm)) {
        console.error(
          "Invalid algorithm selection : " +
            algorithm +
            "! Select one of [OTPV2, AES]"
        );
        break;
      }
      setProperty("algorithm", algorithm);
      let payload = {
        [Encrypt.TEXT]: text,
        [Encrypt.RECIPIENTS]: recipientsInput,
        [Encrypt.EXPIRES_HOURS]: expiresHours,
      };

      new Encrypt(xqsdk, xqsdk.getAlgorithm(algorithm))
        .supplyAsync(payload)
        .then(function (encryptResponse) {
          switch (encryptResponse.status) {
            case ServerResponse.OK: {
              const data = encryptResponse.payload;

              const locatorKey = data[Encrypt.LOCATOR_KEY];
              const encryptedText = data[Encrypt.ENCRYPTED_TEXT];

              setProperty(Encrypt.LOCATOR_KEY, locatorKey);
              setProperty(Encrypt.ENCRYPTED_TEXT, encryptedText);

              buildIdentifyScreen();
              break;
            }
            case ServerResponse.ERROR: {
              console.info(encryptResponse);
              break;
            }
          }
        });
      break;
    case "recipient-access-request-button":
      let recipient = $("#recipient-input").val();
      setProperty("user", recipient);
      new Authorize(xqsdk)
        .supplyAsync({ [Authorize.USER]: recipient })
        .then(function (response) {
          switch (response.status) {
            case ServerResponse.OK: {
              replaceProperty("next", "enryptScreen", "decryptScreen");
              buildValidationScreen();
              break;
            }
            case ServerResponse.ERROR: {
              console.info(response);
              break;
            }
          }
        });
      break;
    case "decrypt-button":
      const locatorKey = getProperty(Encrypt.LOCATOR_KEY);
      const encryptedText = getProperty(Encrypt.ENCRYPTED_TEXT);
      new Decrypt(xqsdk, xqsdk.getAlgorithm(getProperty("algorithm")))
        .supplyAsync({
          [Decrypt.LOCATOR_KEY]: locatorKey,
          [Decrypt.ENCRYPTED_TEXT]: encryptedText,
        })
        .then(function (decryptResponse) {
          switch (decryptResponse.status) {
            case ServerResponse.OK: {
              const data = decryptResponse.payload;
              const decryptedText = data[EncryptionAlgorithm.DECRYPTED_TEXT];
              setProperty("decryptedText", decryptedText);
              buildDecryptScreen();
              break;
            }
            case ServerResponse.ERROR: {
              console.info(decryptResponse);
              break;
            }
          }
        });
      break;
    case "refresh-button":
      removeAllProperties();
      location.reload();
      break;
  }
});

function buildValidationScreen() {
  $("div[id='label-content']").css("visibility", "visible");

  $("label[for='label-content']")
    .empty()
    .html(
      "Please check your email. <br/>" +
        "We sent you confirmation pin. <br>" +
        "Enter it below and then press 'Confirm'.<br />"
    )
    .css("visibility", "visible");

  $("button[id='sender-access-request-button']").hide();
  $("input[id='user-input']").hide();

  $("button[id='recipient-access-request-button']").hide();
  $("input[id='recipient-input']").hide();

  $("button[id='validate-access-request-button']").show();
  $("input[id='pin-input']")
    .val("")
    .attr("placeholder", "Enter Your 6 digit Pin Here:")
    .focus()
    .show();

  $("#user-input").val("");
}

function buildEncryptScreen() {
  $("div[id='label-content']").css("visibility", "visible");

  $("div[id='algorithms']").show();

  $("label[for='label-content']")
    .empty()
    .html(
      "Its time to add emails of the folks who you want to be able to read your message.<br />" +
        "In this demo, for the sake of simplicity you are permitted to add only one recipient.<br />" +
        "In real a life scenario you can add as many recipients as you like.<br /><br />" +
        "Also please add the message you want to encrypt below and then press 'Encrypt'. <br />"
    );

  $("button[id='validate-access-request-button']").hide();
  $("input[id='pin-input']").hide();

  $("input[id='recipient-list-input']")
    .attr("placeholder", "Enter at least one recipient email here:")
    .focus()
    .show();

  $("div[id='recipient-list-div']").show();

  $("button[id='encrypt-button']").show();
  $("input[id='encrypt-input']")
    .attr("placeholder", "Your message goes here.")
    .focus()
    .show();
}

function buildIdentifyScreen() {
  $("div[id='algorithms']").hide();

  $("input[id='encrypt-input']").hide();

  $("div[id='recipient-list-div']").hide();

  $("input[id='recipient-list-input']").hide();

  $("button[id='encrypt-button']").hide();

  $("div[id='label-content']")
    .css("visibility", "visible")
    .empty()
    .html(
      "Hello Recipient! <br/>" +
        "You have received an encrypted message!<br />" +
        "Please enter your email address in order to request access to the message.<br />"
    )
    .append("<span>Encrypted Message: <br /></span>")
    .append(
      "<span><b class='client-name'>" +
        getProperty(Encrypt.ENCRYPTED_TEXT) +
        "<br /></span>"
    );

  $("button[id='recipient-access-request-button']").show();

  $("input[id='recipient-input']")
    .attr("placeholder", "Enter Your Recipient Email")
    .empty()
    .focus()
    .show();
}

function buildDecryptScreen() {
  $("#encrypt-input").val("");

  $(
    "#sender-access-request-button, #validate-access-request-button, #recipient-list-button, #recipient-access-request-button, #encrypt-button, #decrypt-button"
  ).hide();
  $(
    "#user-input, #pin-input, #recipient-list-input, #recipient-input, #encrypt-input, #decrypt-input"
  ).hide();

  $("div[id='label-content']").css("visibility", "visible");

  $("label[for='label-content']")
    .empty()
    .html(
      "Bravo!<br />" +
        "You successfully decrypted your message using XQ Message ©.<br />" +
        "It reads as follows:"
    );

  $("#message-content")
    .empty()
    .html(
      "<span><b class='client-name'>" +
        getProperty("decryptedText") +
        "<br /></span>"
    );

  $("div[id='message-content']").show();

  $("button[id='refresh-button']").show();
}

window.addEventListener(
  "load",
  function initScreen() {
    $("label[for='label-content']")
      .empty()
      .html(
        "Hello, <br>" +
          "this is a brief demonstration of the Javascript XQ Message Encryption API.<br />" +
          "First, please enter your email address below and we'll send a confirmation code.<br />" +
          "We'll guide you through the next steps here. <br />"
      );

    $("div[id='label-content']").css("visibility", "visible");

    var selections = {
      default: "Select Encyption Algorithm Here:",
      OTPV2: "OTPV2",
      AES: "AES",
    };
    var selectBox = $("#algorithmSelectBox");
    $.each(selections, function (val, text) {
      selectBox.append(
        $(
          '<option style="font-family: ProximaNova, sans-serif; font-size: 24px;font-weight: 500;font-variant: normal;color: dodgerblue;"></option>'
        )
          .val(val)
          .html(text)
      );
    });
    $('#algorithmSelectBox option[value="default"]').attr("selected", true);

    $("input[id='user-input']")
      .attr("placeholder", "Enter Your Email Here:")
      .focus();
  },
  false
);
