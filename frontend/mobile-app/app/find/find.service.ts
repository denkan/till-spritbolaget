import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/toPromise';

import { GoogleMapsService, LatLng, Utils } from '../shared';
import { Location } from 'nativescript-geolocation';

@Injectable()
export class FindService {
    private _items$$ = new BehaviorSubject<any[]>([]);
    private _selectedIndex$$ = new BehaviorSubject<number>(null);

    get items$() {
        return this._items$$.asObservable();
    }
    get selectedIndex$() {
        return this._selectedIndex$$.asObservable();
    }
    get selectedItem$() {
        return this.selectedIndex$.map(i => {
            const items = this._items$$.value;
            return items.length ? items[i] : null;
        });
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

                that._items$$.next(results);
                resolve(results);
            }

        });
    }

    /**
     * Set selected item index
     * @param index 
     */
    setSelectedIndex(index: number) {
        if(!this._items$$.value[index]) return false;
        
        this._selectedIndex$$.next(index);
        return true;
    }

}