import ServerResponse from "./../src/com/xqmsg/sdk/v2/ServerResponse.js";
import Authorize from "../src/com/xqmsg/sdk/v2/services/Authorize.js"
import CodeValidator from "../src/com/xqmsg/sdk/v2/services/CodeValidator.js"
import XQSDK from "./../src/com/xqmsg/sdk/v2/XQSDK.js"
import TestContainer from "./TestContainer.js";


const oReq = new XMLHttpRequest();
oReq.open("GET",  "/tests/resources/utf-8-sampler.txt");

oReq.addEventListener("load", function () {

    const xqsdk = new XQSDK();
    const container = new TestContainer(xqsdk, this.responseText);
    const tests = container.loadTests();

    try {
        xqsdk.getCache().getActiveProfile(true);
        showReadyScreen(false);
    } catch (err) {
        showRegistrationScreen();
    }
    showInitialTestAgenda();

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
                                case ServerResponse.OK: {
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

    function showRegistrationScreen(withClearCredentialsDisabled = true) {
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

    function doAuthorize(user){
        let authorize = new Authorize(xqsdk);

        return authorize
            .supplyAsync({[Authorize.USER]: user, [Authorize.CODE_TYPE]:"pin"})
            .then(function (serverResponse) {
                switch (serverResponse.status) {
                    case ServerResponse.OK: {
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
            .supplyAsync({[CodeValidator.PIN]: pin})
            .then(function (serverResponse) {
                switch (serverResponse.status) {
                    case ServerResponse.OK: {

                        showReadyScreen();

                        $("label[for='label-content']")
                            .remove();

                        $("div[id='label-content']")
                            .append(`<label for="label-content" class="TertiaryText" style="font-style:normal; color:#000; visibility:visible;">
                                       You can now run the tests.<br />If you want to fresh you credentials, please press 
                                       <span style='color: #0082FF'>Clear Credentials</span>
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

    $("#register-button, #confirm-button, #run-button, #clear-credentials-button")
        .on("click", function (clickEvent) {
            switch (clickEvent.currentTarget.id) {
                case 'register-button': {
                    const userEmail = $("#register-input").val();

                   doAuthorize(userEmail)
                        .then(function (serverResponse) {
                            switch (serverResponse.status) {
                                case ServerResponse.OK: {
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
                                case ServerResponse.OK: {
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
                    showRegistrationScreen();
                    showInitialTestAgenda();
                    break;
                }
            }
        });

});
oReq.send();