import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';

import * as appSettings from '../../app.settings';


@Injectable()
export class GoogleMapsService {

    private _apiKey: string;

    constructor(
        private http: Http,
    ) {
        this._apiKey = appSettings.CONFIG.GOOGLE_API_KEY;
    }

    fetch(apiPath: string, params: { [key: string]: any }) {
        const apiUrl = this._apiUrl(apiPath, params);
        console.log('[GoogleMaps] Fetching...', apiUrl)
        return this.http.get(apiUrl)
            .map(r => r.json())
            .do(r => console.log('[GoogleMaps] Fetched:', Object.keys(r).join('|')))
    }

    private _apiUrl(apiPath: string, params: { [key: string]: any }) {
        params['key'] = this._apiKey;
        const paramQuery = this._serializeParams(params);


        switch (apiPath.toLowerCase()) {
            case 'roads/snaptoroads':
                return `https://roads.googleapis.com/v1/snapToRoads?${paramQuery}`;
            default:
                return `https://maps.googleapis.com/maps/api/${apiPath}/json?${paramQuery}`;
        }
    }

    private _serializeParams(params: { [key: string]: any }) {
        var str = [];
        for (var p in params) {
            if (params.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(params[p]));
            }
        }
        return str.join("&");
    }


}