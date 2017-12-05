import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/toPromise';

import { GoogleMapsService, LatLng, Utils } from '../shared';
import { Location } from 'nativescript-geolocation';

@Injectable()
export class FindService {
    private _foundNearby$$: BehaviorSubject<any[]> = new BehaviorSubject(null);

    get foundNearby$() {
        return this._foundNearby$$.asObservable();
    }

    constructor(
        private googleMaps: GoogleMapsService,
    ) { }

    /**
     * Find Systembolaget nearby
     * @param location 
     */
    findNearby(location: LatLng) {
        return new Promise((resolve, reject) => {

            const searchName = 'Systembolaget'
            const defaultOptions = {
                keyword: searchName,
                name: searchName,
                location: location.toString(),
                language: 'sv',
                //radius: 100000, // 100 km
                type: 'liquor_store',
                rankby: 'distance',
                //opennow: true,
            };
            const validOptions = {}; //pick(req.query, ['nowopen']);
            const searchOptions = Object.assign({}, defaultOptions, validOptions);

            this.googleMaps.fetch('place/nearbysearch', searchOptions)
                .toPromise()
                .then(_finalizeData)
                .catch(reject);

            const that = this;
            function _finalizeData(googleData: any) {
                let results = (googleData || {}).results || [];
                // systembolaget only:
                results = results.filter(r => r.name === searchName);

                results = results.map(r => {
                    // calc distance
                    const pos = LatLng.fromObject(r.geometry.location);
                    r.distance = Math.round(Utils.getDistance(location, pos));
                    // parse street + city
                    const address = (', '+r.vicinity).split(', ');
                    r.city = address.pop();
                    r.street = address.slice(1);
                    return r;
                });

                that._foundNearby$$.next(results);
                resolve(results);
            }

        });
    }

}