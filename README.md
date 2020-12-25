realm-client-node-js
====================

Back-end part of LoginShield SDK for direct integration into a web application.

This library integrates into the website back-end JavaScript using NodeJS.

Use the LoginShield Realm Client in this library to connect to the LoginShield
service for user management and authentication.

# API

The library provides 3 functions:

* register (to use only the first time the user activates LoginShield)
* startLogin (when starting a login, or completing an activation or reset)
* verifyLogin (to verify a login)

## Register

This is a `POST` to `https://loginshield.com/service/realm/user/create`.

Required headers:

```
Authorization: Token {{authorizationToken}}
Content-Type: application/json
Accept: application/json
```

JSON request format:

```
{
    realmId: String,
    realmScopedUserId: String,
    name: String,
    email: String,
    replace: Boolean
}
```

The `realmId` value comes from LoginShield Enterprise account settings.

The `realmScopedUserId` value comes from the enterprise application: it can be the username or any other unique identifier for the user.

The `name` and `email` values come from the enterprise application: these are used by LoginShield to send emails to the user as needed for account verification and access recovery.

The `replace` value should be `false`, UNLESS the user has lost access to their account and is doing an access recovery process for which it needs to be `true`.

JSON response format:

```
{
    isCreated: Boolean
}
```

## Start Login

This is a `POST` to `https://loginshield.com/service/realm/login/start`.

Required headers:

```
Authorization: Token {{authorizationToken}}
Content-Type: application/json
Accept: application/json
```

JSON request format:

```
{
    realmId: String,
    userId: String,
    isNewKey: Boolean,
    redirect: String
}
```

The `realmId` value comes from LoginShield Enterprise account settings.

The `userId` value comes from the enterprise application: it is the same as the `realmScopedUserId` used in registration.

The `isNewKey` value should be `false` except when activating LoginShield for the first time or doing an access recovery.

The `redirect` value is a URL to the plugin's login activity; it is used only during a safety notice; when called, a 'loginshield' parameter will be added to this URL by LoginShield (this parameter is used by the browser portion of the SDK)

JSON response format:

```
{
    forward: String
}
```

The `forward` value is a URL that needs to be transmitted to the browser part of the SDK. 

## Verify Login

This is a `POST` to `https://loginshield.com/service/realm/login/verify`.

Required headers:

```
Authorization: Token {{authorizationToken}}
Content-Type: application/json
Accept: application/json
```

JSON request format:

```
{
    token: String
}
```

The `token` value comes from the browser portion of the SDK.

JSON response format when response status code is `200 OK`:

```
{
    realmId: String,
    realmScopedUserId: String
}
```

The `realmId` and `realmScopedUserId` values in the response should match the ones provided by the
application in the start login request, and identify the user who authenticated successfully.

JSON response format when response status code is `401 Unauthorized`:

```
{
    error: String,
    fault: Object
}
```

The `error` or `fault` values may be null. Either way, the unauthorized response indicates the login
was not completed successfully and the user who attempted to login is NOT authenticated.

# Build

```
npm run lint
npm run build
```
