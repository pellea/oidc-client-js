// Copyright (c) Brock Allen & Dominick Baier. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE in the project root for license information.

import Log from './Log';
import MetadataService from './MetadataService';
import Global from './Global';
require('es6-promise').polyfill();
//require('isomorphic-fetch');

const AccessTokenTypeHint = "access_token";

export default class TokenRevocationClient {
    constructor(settings, MetadataServiceCtor = MetadataService) {
        if (!settings) {
            Log.error("No settings provided");
            throw new Error("No settings provided.");
        }
        
        this._settings = settings;
        this._metadataService = new MetadataServiceCtor(this._settings);
    }

    revoke(accessToken, required) {
        Log.info("TokenRevocationClient.revoke");

        if (!accessToken) {
            Log.error("No accessToken provided");
            throw new Error("No accessToken provided.");
        }

        return this._metadataService.getRevocationEndpoint().then(url => {
            if (!url) {
                if (required) {
                    Log.error("Revocation not supported");
                    throw new Error("Revocation not supported");
                }

                // not required, so don't error and just return
                return;
            }

            var client_id = this._settings.client_id;
            var client_secret = this._settings.client_secret;
            return this._revoke(url, client_id, client_secret, accessToken);
        });
    }

    _revoke(url, client_id, client_secret, accessToken) {
        Log.info("Calling revocation endpoint");

        var body = "client_id=" + encodeURIComponent(client_id); 
        if (client_secret) {
            body += "&client_secret=" + encodeURIComponent(client_secret);
        }
        body += "&token_type_hint=" + encodeURIComponent(AccessTokenTypeHint);
        body += "&token=" + encodeURIComponent(accessToken);

        let settings = {  
            method: 'post',
            mode: 'cors',
            // credentials: 'include',
            headers: {  
                "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"  
            },  
            body: body
        };

        return fetch(url, settings)
            .then(this.status)
            .catch(this.onerror);
    }

    status(response) {
        Log.info("HTTP response received, status", response.status);
        if (response.status === 200) {  
            return Promise.resolve();
        } else {  
            return Promise.reject(Error(response.statusText + " (" + response.status + ")"));
        }  
    }
    
    onerror(error) {
        Log.error("network error");
        return Promise.reject(Error("Network Error: '" + error + '"'));
    }
}
