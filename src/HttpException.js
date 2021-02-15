/*!
Copyright (C) 2021 Cryptium Corporation. All rights reserved.
*/

class HttpException {
    constructor({
        status, statusText, headers, data,
    }) {
        this.message = `${status} ${statusText}`;
        this.response = {
            status, statusText, headers, data,
        };
    }
}

export { HttpException };
