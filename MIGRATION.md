# Migrating from jssdk-core v2 to v3

jssdk-core v3 consolidates the SDK around a single unified API key and a single backend endpoint (Delta). This guide covers all breaking changes and how to update your code.

---

## Breaking Changes

### 1. API Key Consolidation

The two separate API keys (`XQ_API_KEY` and `DASHBOARD_API_KEY`) have been replaced by a single `API_KEY`.

**Before (v2):**
```js
const xqsdk = new XQSDK({
  XQ_API_KEY: "YOUR_XQ_API_KEY",
  DASHBOARD_API_KEY: "YOUR_DASHBOARD_API_KEY",
});
```

**After (v3):**
```js
const xqsdk = new XQSDK({
  API_KEY: "YOUR_API_KEY",
});
```

The same key is used for all operations — encryption, dashboard, and administration.

### 2. Unified Backend (Delta Server)

Multiple server URLs (`XQ_SERVER_URL`, `DASHBOARD_SERVER_URL`, `SUBSCRIPTION_SERVER_URL`, `VALIDATION_SERVER_URL`) have been replaced by a single Delta endpoint.

The SDK defaults to `https://delta.xqmsg.net/v3`. You can override it via the optional second argument:

```js
const xqsdk = new XQSDK(
  { API_KEY: "YOUR_API_KEY" },
  { DELTA_SERVER_URL: "https://your-custom-delta-server.example/v3" }
);
```

### 3. Algorithm Renames

| v2 Name    | v3 Name | Constant              |
|------------|---------|-----------------------|
| `"OTPV2"`  | `"OTP"` | `xqsdk.OTP_ALGORITHM` |
| `"AES"`    | `"GCM"` | `xqsdk.GCM_ALGORITHM` |

**Before (v2):**
```js
const algorithm = xqsdk.getAlgorithm(xqsdk.OTPv2_ALGORITHM);
// or
if (!["OTPV2", "AES"].includes(algorithm)) { ... }
```

**After (v3):**
```js
const algorithm = xqsdk.getAlgorithm(xqsdk.OTP_ALGORITHM);
// or
if (!["OTP", "GCM"].includes(algorithm)) { ... }
```

v3 also adds two new algorithms: `CTR` (`xqsdk.CTR_ALGORITHM`) and `NTV` (`xqsdk.NTV_ALGORITHM`).

### 4. Cache Method Rename

`getDashboardAccess()` has been removed. Use `getXQAccess()` instead — it serves both XQ and dashboard access in the unified model.

**Before (v2):**
```js
const token = xqsdk.getCache().getDashboardAccess(user, true);
```

**After (v3):**
```js
const token = xqsdk.getCache().getXQAccess(user, true);
```

### 5. API Key Instance Property

If you referenced `xqsdk.XQ_API_KEY` directly, update to `xqsdk.API_KEY`.

**Before (v2):**
```js
new CheckApiKey(xqsdk).supplyAsync({ [CheckApiKey.API_KEY]: xqsdk.XQ_API_KEY });
```

**After (v3):**
```js
new CheckApiKey(xqsdk).supplyAsync({ [CheckApiKey.API_KEY]: xqsdk.API_KEY });
```

---

## Quick-Reference Checklist

- [ ] Replace `{ XQ_API_KEY, DASHBOARD_API_KEY }` with `{ API_KEY }` in the XQSDK constructor
- [ ] Remove any custom server URL configs; the SDK now uses `DELTA_SERVER_URL` only
- [ ] Rename `"OTPV2"` → `"OTP"` and `"AES"` → `"GCM"` in algorithm strings
- [ ] Rename `OTPv2_ALGORITHM` → `OTP_ALGORITHM` and `AES_ALGORITHM` → `GCM_ALGORITHM`
- [ ] Replace `getDashboardAccess()` calls with `getXQAccess()`
- [ ] Replace `xqsdk.XQ_API_KEY` with `xqsdk.API_KEY`
- [ ] Update your dependency: `"@xqmsg/jssdk-core": "^3.0.0"`
