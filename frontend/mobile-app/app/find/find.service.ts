import { Injectable } from '@angular/core';
import 'rxjs/add/operator/toPromise';

import { GoogleMapsService } from '../shared/google-maps';
import { Location } from 'nativescript-geolocation';

import { LatLng } from '../shared/models';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

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
                .then(_filterAndCacheData)
                .catch(reject);

            const that = this;
            function _filterAndCacheData(googleData: any) {
                let results = (googleData || {}).results || [];
                // systembolaget only:
                results = results.filter(r => r.name === searchName);

                that._foundNearby$$.next(results);
                resolve(results);
            }

        });
    }

}