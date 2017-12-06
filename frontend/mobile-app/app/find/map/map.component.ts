import { Component, OnInit, ElementRef, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { registerElement } from 'nativescript-angular/element-registry';
import { MapView, Marker, Position, Style, Bounds } from 'nativescript-google-maps-sdk';
import { Image } from 'ui/image';
import { GridLayout } from 'ui/layouts/grid-layout';

import * as mapStyles from './map.styles';
import { GeolocationService, LatLng, Utils } from '../../shared';
import { FindService } from '../find.service';

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
            ></MapView>
        </GridLayout>
    `,
})
export class MapComponent implements OnInit, OnChanges {
    @Input() myLocation: LatLng;
    @Input() items: any[];
    @Input() selectedIndex: number;

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


    constructor(
        private geolocation: GeolocationService,
        private findService: FindService,
    ) {
    }

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
        if (changes.selectedIndex && this.changeTasks.length === 0) {
            this.changeTasks.push(this.zoomMap);
        }

        // run immediately if map's loaded - or wait and run in onMapReady()
        if (this.mapView) this.doChangeTasks();
    }

    onMapReady(event) {
        this.mapView = event.object;
        this.mapView.setStyle(<Style>mapStyles.DARK);

        this.doChangeTasks();
    }

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

        const img = new Image();
        img.src = 'res://icon';
        img.width = 20;
        img.height = 20;
        //img.stretch = 'none';
        //marker.icon = img;
        marker.color = Utils.COLORS.WARNING;

        this.mapView.addMarker(marker);
        this.zoomMap();
    }

    addStoreMarkers(items?: any[]) {
        items = items || this.items || [];

        // clear old 
        let oldMarker = new Marker();
        while (oldMarker) {
            oldMarker = this.mapView.findMarker(m => m.userData.type === MARKER_TYPES.STORE);
            if (oldMarker) this.mapView.removeMarker(oldMarker);
        }

        items.forEach(item => {
            const pos = LatLng.fromObject(item.geometry.location);
            const marker = new Marker();
            marker.position = Position.positionFromLatLng(pos.latitude, pos.longitude);
            marker.title = (Math.round(item.distance / 100) / 10) + ' km';
            marker.snippet = item.vicinity;
            marker.userData = { type: MARKER_TYPES.STORE };
            marker.color = item.opening_hours.open_now ? Utils.COLORS.SUCCESS : Utils.COLORS.ERROR;
            this.mapView.addMarker(marker);
        });

        this.zoomMap();
    }



    zoomMap() {
        if(this.selectedIndex !== undefined) {
            const item = this.items[this.selectedIndex];
            const itemLocation = LatLng.fromObject(item.geometry.location);
            this.zoomMapToViewport(itemLocation, this.myLocation);
            return;
        }

        if(this.myLocation) {
            this.zoomMapToSingle(this.myLocation);
        }
    }

    zoomMapToSingle(pos: LatLng, zoom?: number) {
        this.latitude = pos.latitude;
        this.longitude = pos.longitude;
        this.zoom = zoom || 12;
    }

    zoomMapToViewport(location1: LatLng, location2: LatLng, padding?: number) {
        // clone to make sure to not alter original object
        const pos1 = Object.assign({}, location1);
        const pos2 = Object.assign({}, location2);

        if(pos1.latitude > pos2.latitude){
            const tmp = pos2.latitude;
            pos2.latitude = pos1.latitude;
            pos1.latitude = tmp;
        }
        if(pos1.longitude > pos2.longitude){
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