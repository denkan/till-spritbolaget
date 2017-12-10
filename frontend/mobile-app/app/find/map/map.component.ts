import {
    Component, OnInit, ElementRef, ViewChild, Input, Output,
    EventEmitter, OnChanges, SimpleChanges
} from '@angular/core';
import { registerElement } from 'nativescript-angular/element-registry';
import { MapView, Marker, Position, Style, Bounds, MarkerEventData, Polyline, ShapeEventData } from 'nativescript-google-maps-sdk';
import { Image } from 'ui/image';
import { GridLayout } from 'ui/layouts/grid-layout';
import { Color } from 'color';

import * as mapStyles from './map.styles';
import { LatLng, Utils } from '../../shared';

const decodePolyline = require('decode-google-map-polyline');
const Rainbow = require('rainbowvis.js');

// Important - must register MapView plugin in order to use in Angular templates
registerElement('MapView', () => MapView);

export const enum MARKER_TYPES { ME, STORE };


@Component({
    moduleId: module.id,
    selector: 'TheMap',
    template: `
        <GridLayout #container rows="auto,*">
            <MapView row="1" #mapView [latitude]="latitude" [longitude]="longitude"
                [zoom]="zoom" [bearing]="bearing" [padding]="padding"
                [tilt]="tilt" (mapReady)="onMapReady($event)"

                compassEnabled="false"
                indoorLevelPickerEnabled="false"
                mapToolbarEnabled="false"
                myLocationButtonEnabled="false"
                rotateGesturesEnabled="false"
                scrollGesturesEnabled="true"
                tiltGesturesEnabled="false"
                zoomControlsEnabled="false"
                zoomGesturesEnabled="true"

                (markerSelect)="onMarkerSelect($event)"
                (shapeSelect)="onShapeSelect($event)"
            ></MapView>
        </GridLayout>
    `,
})
export class MapComponent implements OnInit, OnChanges {
    @Input() myLocation: LatLng;
    @Input() items: any[];
    @Input() selectedIndex: number;

    @Output() selectItem = new EventEmitter()

    @ViewChild('container') container: ElementRef;

    // map props
    latitude = 60;
    longitude = 15;
    zoom = 6;
    bearing = 0;
    tilt = 0;
    padding = [300, 600, 200, 200];
    mapView: MapView;
    lastCamera: String;


    constructor() { }

    ngOnInit() {

    }

    private changeTasks: Function[] = [];
    doChangeTasks() {
        while (this.changeTasks.length) {
            this.changeTasks.shift().apply(this);
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        //console.log('map.comp.changes:', Object.keys(changes).join(' | '));

        if (changes.myLocation) {
            this.changeTasks.push(this.addMyLocationMarker);
        }
        if (changes.items) {
            this.changeTasks.push(this.addStoreMarkers);
        }
        if (changes.selectedIndex !== undefined) {
            this.changeTasks.push(this.drawDirectionRoutes);
        }

        this.changeTasks.push(this.zoomMap);

        // run immediately if map's loaded - or wait and run in onMapReady()
        if (this.mapView) this.doChangeTasks();
    }

    onMapReady(event) {
        this.mapView = event.object;
        this.mapView.setStyle(<Style>mapStyles.DARK);

        this.doChangeTasks();
    }

    onMarkerSelect(e: MarkerEventData) {
        const data = e.marker.userData;
        if (data.type === MARKER_TYPES.STORE) {
            this.selectItem.emit(data.item);
        }
    }

    onShapeSelect(e: ShapeEventData) {
        const route = e.shape.userData.route;
        if (!route) return;

        this.zoomMapToViewport(
            LatLng.fromObject(route.bounds.southwest),
            LatLng.fromObject(route.bounds.northeast)
        );
    }

    private _myLocationAnimation: number;
    addMyLocationMarker(pos?: LatLng) {
        pos = pos || this.myLocation;

        // clear old 
        const oldMarker = this.mapView.findMarker(m => m.userData.type === MARKER_TYPES.ME);
        if (oldMarker) this.mapView.removeMarker(oldMarker);

        // add new
        const marker = new Marker();
        marker.position = Position.positionFromLatLng(pos.latitude, pos.longitude);
        marker.title = "Du";
        // marker.snippet = "Du";
        marker.userData = { type: MARKER_TYPES.ME };

        const icons = [
            'icon_my_location_0',
            'icon_my_location_1',
            'icon_my_location_2',
            'icon_my_location_3',
        ];
        marker.icon = icons[0];
        marker.anchor = [0.5, 0.76];

        // marker.flat = true;
        // marker.color = Utils.COLORS.WARNING;
        this.mapView.addMarker(marker);

        // animate marker
        clearInterval(this._myLocationAnimation);
        let count = 0;
        this._myLocationAnimation = setInterval(() => {
            marker.icon = icons[count++ % icons.length];
        }, 200);
    }

    addStoreMarkers(items?: any[]) {
        items = items || this.items || [];

        // clear old 
        let oldMarker = new Marker();
        while (oldMarker) {
            oldMarker = this.mapView.findMarker(m => m.userData.type === MARKER_TYPES.STORE);
            if (oldMarker) this.mapView.removeMarker(oldMarker);
        }

        items.forEach((item, index) => {
            const pos = LatLng.fromObject(item.geometry.location);
            const marker = new Marker();
            marker.position = Position.positionFromLatLng(pos.latitude, pos.longitude);
            marker.title = (Math.round(item.distance / 100) / 10) + ' km';
            marker.snippet = item.vicinity;
            marker.userData = {
                type: MARKER_TYPES.STORE,
                item: item,
                index: index,
            };
            marker.flat = true;
            marker.color = item.opening_hours.open_now ? Utils.COLORS.SUCCESS : Utils.COLORS.ERROR;
            this.mapView.addMarker(marker);
        });
    }

    drawDirectionRoutes() {
        const item = this.items[this.selectedIndex];

        if (!item.directions || !this.mapView) {
            // directions (or map) not yet loaded - try again later (max 10 times)
            let tries = 0;
            let triesInterval = setInterval(() => {
                tries++;
                if (tries >= 10 || item.directions) {
                    clearInterval(triesInterval);
                }
                if (item.directions) {
                    // loaded - draw again
                    this.drawDirectionRoutes();
                }
            }, 100);
            return;
        }

        const routes: any[] = item.directions.routes;

        // item.directions.routes.legs === array with items?
        if (!routes.length || !(routes[0].legs || []).length) return;

        // ready to draw...

        const route = routes[0];

        // clear old drawings
        this.mapView.removeAllShapes();

        // collect route points
        const decodedPoints = decodePolyline(route.overview_polyline.points);
        const points: Position[] = decodedPoints.map(x => Position.positionFromLatLng(x.lat, x.lng));

        if (!points.length) return;

        // make gradients
        const gradients = new Rainbow();
        gradients.setSpectrum(
            Utils.COLORS.WARNING,
            item.opening_hours.open_now ? Utils.COLORS.SUCCESS : Utils.COLORS.ERROR
        );
        gradients.setNumberRange(0, points.length);

        // draw each point as line
        let lastPos = null;
        points.forEach((pos, i) => {

            if (lastPos) {
                const p = new Polyline();
                p.color = new Color('#' + gradients.colourAt(i));
                p.width = 10;
                p.addPoints([lastPos, pos]);
                p.clickable = true;
                p.userData = {
                    index: this.selectedIndex,
                    item: item,
                    route: route,
                }
                this.mapView.addPolyline(p);
            }

            lastPos = pos;
        })

    }

    zoomMap() {
        if (this.selectedIndex !== undefined) {
            const item = this.items[this.selectedIndex];
            const itemLocation = LatLng.fromObject(item.geometry.location);
            this.zoomMapToViewport(itemLocation, this.myLocation);
            return;
        }

        if (this.myLocation) {
            this.zoomMapToSingle(this.myLocation);
        }
    }

    zoomMapToSingle(pos: LatLng, zoom?: number) {
        this.latitude = pos.latitude;
        this.longitude = pos.longitude;
        this.zoom = zoom || 12;
    }

    zoomMapToViewport(location1: LatLng, location2: LatLng, padding?: number) {
        // clone to make sure to not alter original object
        const pos1 = Object.assign({}, location1);
        const pos2 = Object.assign({}, location2);

        if (pos1.latitude > pos2.latitude) {
            const tmp = pos2.latitude;
            pos2.latitude = pos1.latitude;
            pos1.latitude = tmp;
        }
        if (pos1.longitude > pos2.longitude) {
            const tmp = pos2.longitude;
            pos2.longitude = pos1.longitude;
            pos1.longitude = tmp;
        }


        const bounds = Bounds.fromCoordinates(
            Position.positionFromLatLng(pos1.latitude, pos1.longitude),
            Position.positionFromLatLng(pos2.latitude, pos2.longitude)
        );
        this.mapView.setViewport(bounds, padding);
    }

}