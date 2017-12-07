import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/toPromise';

import { GoogleMapsService, LatLng, Utils } from '../shared';
import { Location } from 'nativescript-geolocation';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class FindService {
    private _items$$ = new BehaviorSubject<any[]>([]);
    private _selectedIndex$$ = new BehaviorSubject<number>(null);

    get items$() {
        return this._items$$.asObservable();
    }
    get selectedIndex$() {
        return this._selectedIndex$$.asObservable();
    }
    get selectedItem$() {
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
                .catch(reject)
                .then(googleData => {
                    let results = (googleData || {}).results || [];
                    // systembolaget only:
                    results = results.filter(r => r.name === searchName);

                    results = results.map(r => {
                        // calc distance
                        const pos = LatLng.fromObject(r.geometry.location);
                        r.distance = Math.round(Utils.getDistance(location, pos));
                        // parse street + city
                        const address = (', ' + r.vicinity).split(', ');
                        r.city = address.pop();
                        r.street = address.slice(1);
                        return r;
                    });

                    this._items$$.next(results);
                    resolve(results);
                })
            ;

        });
    }

    /**
     * Set selected item index
     * @param index 
     */
    setSelectedIndex(index: number) {
        const item = this._items$$.value[index];
        if (!item) return false;

        if (item.details_loading === undefined) {
            this.findAndMergeDetails(item);
        }

        this._selectedIndex$$.next(index);
        return true;
    }

    findAndMergeDetails(itemOrIndex: number | any) {
        const item = (typeof itemOrIndex === 'number') ? this._items$$.value[itemOrIndex] : itemOrIndex;
        item.details_loading = true;
        console.log('findAndMergeDetails 1', item.place_id)

        return new Promise((resolve, reject) => {
            this.googleMaps.fetch('place/details', { place_id: item.place_id })
                .map(googleData => googleData.result || {})
                .toPromise()
                .catch(reject)
                .then(details => {
                    console.log('findAndMergeDetails 2')
                    // merge data
                    item.opening_hours = details.opening_hours;
                    item.address_components = details.address_components;
                    item.formatted_address = details.formatted_address;
                    item.details_loading = false;
                    resolve(details);
                })
            ;
        });
    }

}