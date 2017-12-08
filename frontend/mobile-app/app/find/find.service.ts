import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/toPromise';

import { GoogleMapsService, GeolocationService, LatLng, Utils } from '../shared';
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
        private geolocation: GeolocationService,
    ) { }

    /**
     * Find Systembolaget nearby
     * @param location 
     */
    findNearby(location: LatLng) {
        return new Promise((resolve, reject) => {

            // https://developers.google.com/places/web-service/search
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
                });
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
        if (item.directions_loading === undefined) {
            this.findAndMergeDirections(item);
        }

        this._selectedIndex$$.next(index);
        return true;
    }

    /**
     * Find details of place and merge into existing item object
     * @param itemOrIndex 
     */
    findAndMergeDetails(itemOrIndex: number | any) {
        const item = (typeof itemOrIndex === 'number') ? this._items$$.value[itemOrIndex] : itemOrIndex;
        item.details_loading = true;

        return new Promise((resolve, reject) => {
            const doReject = (err?: Error) => {
                item.details_loading = false;
                reject(err);
            }

            // https://developers.google.com/places/web-service/details
            this.googleMaps.fetch('place/details', { place_id: item.place_id })
                .map(googleData => googleData.result || {})
                .toPromise()
                .catch(doReject)
                .then(details => {
                    // merge data
                    item.opening_hours = details.opening_hours;
                    item.address_components = details.address_components;
                    item.formatted_address = details.formatted_address;
                    item.details_loading = false;
                    resolve(details);
                });
        });
    }

    /**
     * Find directions between location and item/store and merge into existing item object
     * @param itemOrIndex 
     */
    findAndMergeDirections(itemOrIndex: number | any) {
        const item = (typeof itemOrIndex === 'number') ? this._items$$.value[itemOrIndex] : itemOrIndex;
        item.directions_loading = true;

        return new Promise((resolve, reject) => {
            const doReject = (err?: Error) => {
                item.directions_loading = false;
                reject(err);
            }

            this.geolocation.currentLocation$.first().subscribe(myLocation => {

                // https://developers.google.com/maps/documentation/directions/intro
                const searchParams = {
                    origin: LatLng.fromObject(myLocation).toString(),
                    destination: LatLng.fromObject(item.geometry.location).toString(),
                }
                this.googleMaps.fetch('directions', searchParams)
                    .toPromise()
                    .catch(doReject)
                    .then(directions => {
                        // merge data
                        item.directions = directions;
                        item.directions_loading = false;
                        this.findAndMergeRoadSnaps(item);
                        resolve(directions);
                    });
            });
        });
    }

    /**
     * Find road-snaps on directions and merge into existing item object
     * @param itemOrIndex 
     */
    findAndMergeRoadSnaps(itemOrIndex: number | any) {
        const item = (typeof itemOrIndex === 'number') ? this._items$$.value[itemOrIndex] : itemOrIndex;
        item.roadsnaps_loading = true;

        return new Promise((resolve, reject) => {
            const doReject = (err?: Error) => {
                item.roadsnaps_loading = false;
                reject(err);
            }

            // --- collect route points ---
            const routes: any[] = ((item || {}).directions || {}).routes  ||  []; // item.direction.routes?
            if (!routes.length || !(routes[0].legs || []).length) return doReject();

            const route = routes[0];

            const points: LatLng[] = [];
            route.legs.forEach(l => {
                const steps = <any[]>l.steps;
                steps.forEach(step => {
                    const fromPos = LatLng.fromObject(step.start_location);
                    const toPos = LatLng.fromObject(step.end_location);

                    // avoid unneccessary points
                    const lastPos = points.length ? points[points.length - 1] : new LatLng(0, 0);
                    if (fromPos.toString() !== lastPos.toString()) {
                        points.push(fromPos);
                    }

                    points.push(toPos);
                });
            });

            // --- search snap-to-road points ---
            // https://developers.google.com/maps/documentation/roads/snap
            const searchParams = {
                path: points.map(p => p.toString()).join('|'),
                interpolate: true
            }
            this.googleMaps.fetch('roads/snapToRoads', searchParams)
                .toPromise()
                .catch(doReject)
                .then(data => {
                    // merge data
                    item.directions.snappedPoints = data.snappedPoints;
                    item.directions.snappedPointsPath = points;
                    item.directions.snappedRoute = route;
                    item.roadsnaps_loading = false;
                    resolve(data.snappedPoints);
                });
        });
    }

}