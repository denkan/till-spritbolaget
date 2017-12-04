import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import * as geolocation from "nativescript-geolocation";
import { Accuracy } from "ui/enums";



@Injectable()
export class GeolocationService {
    private _enabled$$: BehaviorSubject<boolean>;
    private _currentLocation$$: BehaviorSubject<geolocation.Location>;

    get enabled$() {
        return this._enabled$$.asObservable();
    }

    get currentLocation$() {
        return this._currentLocation$$.asObservable();
    }

    constructor() {
        this._enabled$$ = new BehaviorSubject(false);
        this._currentLocation$$ = new BehaviorSubject(null);

        geolocation.isEnabled()
            .then(enabled => this._enabled$$.next(enabled))
            .catch(e => console.log("Error: " + (e.message || e)));
        ;
    }

    getCurrent(options?: GetCurrentOptions) {
        options = options || {};

        return new Promise((resolve, reject) => {

            if (options.silent) {
                return this._enabled$$.value
                    ? _getCurrentLocation()
                    : reject(new Error('Geolocation not enabled'));
            }

            this.enable().then(_getCurrentLocation, reject);
            
            const that = this;
            function _getCurrentLocation(){
                const opts = Object.assign({}, {
                    desiredAccuracy: Accuracy.high,
                    timeout: 3000
                }, options);

                geolocation.getCurrentLocation(opts).then(data => {
                    that._currentLocation$$.next(data);
                    resolve(data);
                }, reject)
            }
        });


    }

    enable(options?: EnableOptions) {
        options = options || {};

        return new Promise((resolve, reject) => {
            geolocation.enableLocationRequest(options.iosAlways)
                .then(() => {
                    this._enabled$$.next(true);
                    resolve(true)
                })
                .catch(e => {
                    console.log("[enableLocationRequest] Error: " + (e.message || e))
                    this._enabled$$.next(false);
                    reject(e);
                });
        });
    }
}


export interface EnableOptions {
    options?: geolocation.Options;
    iosAlways?: boolean;
}

export interface GetCurrentOptions extends geolocation.Options {
    silent?: boolean
}