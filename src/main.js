/*!
Copyright (C) 2019 Cryptium Corporation. All rights reserved.
*/

import { HttpException } from './HttpException';

const ajax = require('axios');

/**
 * Encapsulates requests to the LoginShield Realm API.
 */
class RealmClient {
    constructor({
        endpointURL, realmId, authorizationToken, requestHeaders,
    } = {}) {
        this.endpointURL = endpointURL || process.env.LOGINSHIELD_ENDPOINT_URL;
        this.realmId = realmId || process.env.LOGINSHIELD_REALM_ID;

        if (typeof authorizationToken === 'string') {
            this.authorizationHeader = () => ({
                Authorization: `Token ${authorizationToken}`,
            });
        } else if (typeof process.env.LOGINSHIELD_AUTHORIZATION_TOKEN === 'string') {
            this.authorizationHeader = () => ({
                Authorization: `Token ${authorizationToken}`,
            });
        } else {
            this.authorizationHeader = () => ({});
        }

        if (typeof requestHeaders === 'function') {
            this.requestHeaders = requestHeaders;
        } else if (typeof requestHeaders === 'object') {
            const copy = { ...requestHeaders };
            this.requestHeaders = () => copy;
        } else {
            this.requestHeaders = () => ({});
        }

        this.computeRequestHeaders = async (url) => {
            const authorization = await this.authorizationHeader();
            const request = await this.requestHeaders(url);
            return {
                ...authorization,
                ...request,
            };
        };
    }

    /**
     * If the request is denied, an exception will be thrown. The exception object
     * will have a `response` property which is an object like `{ status, statusText, headers, data }`.
     *
     * @param {*} id
     */
    async getRealmInfoById(id) {
        try {
            console.log('getRealmInfoById id: %s', id);
            const requestHeadersResult = await this.computeRequestHeaders(`${this.endpointURL}/service/realm`);
            const headers = {
                ...requestHeadersResult,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            };
            const response = await ajax.get(
                `${this.endpointURL}/service/realm`,
                {
                    headers,
                    params: { id },
                },
            );
            return response.data;
        } catch (err) {
            if (err.response) {
                throw new HttpException(err.response);
            }
            console.log('getRealmInfoById unknown error', err);
            throw err;
        }
    }

    /**
     * If the request is denied, an exception will be thrown. The exception object
     * will have a `response` property which is an object like `{ status, statusText, headers, data }`.
     *
     * @param {*} uri
     */
    async getRealmInfoByURI(uri) {
        try {
            console.log('getRealmInfoByURI: %s', uri);
            const requestHeadersResult = await this.computeRequestHeaders(`${this.endpointURL}/service/realm`);
            const headers = {
                ...requestHeadersResult,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            };
            const response = await ajax.get(
                `${this.endpointURL}/service/realm`,
                {
                    headers,
                    params: { uri },
                },
            );
            return response.data;
        } catch (err) {
            if (err.response) {
                throw new HttpException(err.response);
            }
            console.log('getRealmInfoByURI unknown error', err);
            throw err;
        }
    }

    /**
     * Register a new user with the 'immediate' method.
     *
     * The immediate method is preferred for the best user experience.
     * To use the immediate method, provide `realmScopedUserId`, `name`, and `email`,
     * and if the service responds with { isCreated: true } then continue to the
     * first login with LoginShield (specify the new key flag) to complete registration.
     *
     * `realmScopedUserId`: how LoginShield should identify the user for this authentication realm
     * `name`: the user's display name
     * `email`: the user's email address
     * `replace`: optional, if true the service will replace any existing realmScopedUserId record instead of returning a conflict error
     * @param {*} param0
     */
    async createRealmUser({
        realmScopedUserId, name, email, replace,
    }) {
        try {
            const request = {
                realmId: this.realmId,
                realmScopedUserId,
                name,
                email,
                replace,
            };
            console.log('createRealmUser request: %o', request);
            const requestHeadersResult = await this.computeRequestHeaders(`${this.endpointURL}/service/realm/user/create`);
            const headers = {
                ...requestHeadersResult,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            };
            const response = await ajax.post(
                `${this.endpointURL}/service/realm/user/create`,
                JSON.stringify(request),
                {
                    headers,
                },
            );
            console.log('createRealmUser response status: %o', response.status);
            console.log('createRealmUser response status text: %o', response.statusText);
            console.log('createRealmUser response headers: %o', response.headers);
            console.log('createRealmUser response data: %o', response.data);
            if (response.data && response.data.isCreated) {
                return response.data; // { isCreated: true }
            }
            return { error: 'unexpected-response', response }; // { isCreated: false, fault }
        } catch (err) {
            // console.log('createRealmUser error', err);
            if (err.response) {
                console.log('createRealmUser response status: %o', err.response.status);
                console.log('createRealmUser response status text: %o', err.response.statusText);
                console.log('createRealmUser response headers: %o', err.response.headers);
                console.log('createRealmUser response data: %o', err.response.data);
            }
            return { error: 'registration-failed', err };
        }
    }

    /**
     * Register a new user with the 'redirect' method.
     *
     * The immediate method is preferred for the best user experience.
     *
     * To use the redirect method, provide `realmScopedUserId` and `redirect`,
     * and if the service responds with { isCreated: true, forward: <url> } then
     * redirect the user to that forward URL; and when the service has registered
     * the user, the service will redirect the user back to the specified `redirect`
     * URL.
     *
     * `realmScopedUserId`: how LoginShield should identify the user for this authentication realm
     * `redirect`: where loginshield will redirect the user after the user authenticates and confirms the link with the realm (the enterprise should complete the registration with the first login with loginshield at this url)
     * @param {*} param0
     */
    async createRealmUserWithRedirect({
        realmScopedUserId, redirect,
    }) {
        try {
            const request = {
                realmId: this.realmId,
                realmScopedUserId,
                redirect,
            };
            console.log('createRealmUser request: %o', request);
            const requestHeadersResult = await this.computeRequestHeaders(`${this.endpointURL}/service/realm/user/create`);
            const headers = {
                ...requestHeadersResult,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            };
            const response = await ajax.post(
                `${this.endpointURL}/service/realm/user/create`,
                JSON.stringify(request),
                {
                    headers,
                },
            );
            console.log('createRealmUser response status: %o', response.status);
            console.log('createRealmUser response status text: %o', response.statusText);
            console.log('createRealmUser response headers: %o', response.headers);
            console.log('createRealmUser response data: %o', response.data);
            if (response.data && response.data.isCreated && response.data.forward && response.data.forward.startsWith(this.endpointURL)) {
                return response.data; // { isCreated: true, forward }
            }
            return { error: 'unexpected-response', response }; // { isCreated: false, fault }
        } catch (err) {
            console.log('createRealmUser error', err);
            return { error: 'registration-failed', err };
        }
    }

    async startLogin({ realmScopedUserId, redirect, isNewKey = false }) {
        try {
            const request = {
                realmId: this.realmId,
                userId: realmScopedUserId,
                isNewKey,
                redirect, // this url only used for safety reset; when called, a 'loginshield' parameter will be added by loginshield
            };
            console.log('startLogin request: %o', request);
            const requestHeadersResult = await this.computeRequestHeaders(`${this.endpointURL}/service/realm/login/start`);
            const headers = {
                ...requestHeadersResult,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            };
            const response = await ajax.post(
                `${this.endpointURL}/service/realm/login/start`,
                JSON.stringify(request),
                {
                    headers,
                },
            );
            console.log('startLogin response status: %o', response.status);
            console.log('startLogin response status text: %o', response.statusText);
            console.log('startLogin response headers: %o', response.headers);
            console.log('startLogin response data: %o', response.data);
            if (response.data && response.data.forward && response.data.forward.startsWith(this.endpointURL)) {
                return response.data; // { forward (url string) }
            }
            return { error: 'unexpected-response', response };
        } catch (err) {
            console.log('startLogin error', err);
            return { error: 'login-failed', err };
        }
    }

    async verifyLogin(token) {
        try {
            const request = {
                token,
            };
            console.log('verifyLogin request: %o', request);
            const requestHeadersResult = await this.computeRequestHeaders(`${this.endpointURL}/service/realm/login/verify`);
            const headers = {
                ...requestHeadersResult,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            };
            const response = await ajax.post(
                `${this.endpointURL}/service/realm/login/verify`,
                JSON.stringify(request),
                {
                    headers,
                },
            );
            console.log('verifyLogin response status: %o', response.status);
            console.log('verifyLogin response status text: %o', response.statusText);
            console.log('verifyLogin response headers: %o', response.headers);
            console.log('verifyLogin response data: %o', response.data);
            if (response.data) {
                return response.data;
            }
            return { error: 'unexpected-response', response };
        } catch (err) {
            const { config, response } = err;
            if (config) { // this is also in response.config
                const {
                    url, method, data, headers,
                } = config;
                const headersJson = JSON.stringify(headers);
                const dataJSON = JSON.stringify(data);
                console.log(`verifyLogin error: request method ${method} url ${url} data ${dataJSON} headers ${headersJson}`);
            }
            if (response) {
                const {
                    status, statusText, headers, data,
                } = response;
                const headersJson = JSON.stringify(headers);
                const dataJSON = JSON.stringify(data);
                console.log(`verifyLogin error: response ${status} ${statusText} data ${dataJSON} headers ${headersJson}`);
            }
            console.log('verifyLogin error', err);
            return { error: 'login-failed' };
        }
    }
}

export { RealmClient };
