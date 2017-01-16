// Copyright (c) Brock Allen & Dominick Baier. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE in the project root for license information.

import Log from './Log';
import Global from './Global';
require('es6-promise').polyfill();
//require('isomorphic-fetch');

export default class JsonService {
    getJson(url, token) {
        Log.info("JsonService.getJson", url);
        
        if (!url){
            Log.error("No url passed");
            throw new Error("url");
        }

        // if (token) {
        //     Log.info("token passed, setting Authorization header");
        //     req.setRequestHeader("Authorization", "Bearer " + token);
        // }

        let settings = {  
            method: 'get',
            mode: 'cors',
            // credentials: 'include',
            headers: {
                "Authorization": "Bearer " + token
            }    
        };

        return fetch(url, settings)
            .then(this.status)  
            .then(this.parse)
            .catch(this.onerror);
    }

    status(response) {
        Log.info("HTTP response received, status", response.status);
        if (response.status === 200) {  
            return Promise.resolve(response);
        } else {  
            return Promise.reject(Error(response.statusText + " (" + response.status + ")"));
        }  
    }

    parse(response) {
        return Promise.resolve(response.json());
    }

    onerror(error) {
        Log.error("network error");
        return Promise.reject(Error("Network Error: '" + error + '"'));
    }
}
