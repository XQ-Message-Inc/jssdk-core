import XQSDK from "../src/com/xqmsg/sdk/v2/XQSDK";
import AuthorizeAlias from "../src/com/xqmsg/sdk/v2/services/AuthorizeAlias";

const sdk = new XQSDK({
  XQ_API_KEY: "YOUR_API_KEY",
  DASHBOARD_API_KEY: "YOUR_DASHBOARD_KEY",
});

test("AuthorizeAlias", (done) => {
  new AuthorizeAlias(sdk).supplyAsync({ user: "alias_user" }).then((_) => {
    // TODO fill out functionality once issues are fixed.
    done();
  });
});
