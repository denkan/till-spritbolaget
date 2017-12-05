import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { registerElement } from 'nativescript-angular/element-registry';
import { MapView, Marker, Position, Style, Bounds } from 'nativescript-google-maps-sdk';
import { Image } from 'ui/image';
import { GridLayout } from 'ui/layouts/grid-layout';

import * as mapStyles from './map.styles';
import { GeolocationService, LatLng } from '../../shared';
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
            [zoom]="zoom" [bearing]="bearing"
            [tilt]="tilt" (mapReady)="onMapReady($event)"
            compassEnabled="false"
            indoorLevelPickerEnabled="false"
            mapToolbarEnabled="false"
            myLocationButtonEnabled="false"
            rotateGesturesEnabled="false"
            scrollGesturesEnabled="true"
            tiltGesturesEnabled="false"
            zoomControlsEnabled="false"
            zoomGesturesEnabled="true"></MapView>
    </GridLayout>
`,
})
export class MapComponent implements OnInit {
    @ViewChild('container') container: ElementRef;

    latitude =  60;
    longitude = 15;
    zoom = 6;
    bearing = 0;
    tilt = 0;
    padding = [40, 40, 40, 40];
    mapView: MapView;

    lastCamera: String;

    myLocation: LatLng;

    constructor(
        private geolocation: GeolocationService,
        private findService: FindService,
    ) {
    }

    ngOnInit() {
    }

    onMapReady(event) {
        this.mapView = event.object;
        this.mapView.setStyle(<Style>mapStyles.DARK);
        
        this.geolocation.currentLocation$
            .filter(pos => !!pos)
            .map(pos => LatLng.fromObject(pos))
            .subscribe(pos => {
                this.myLocation = pos;
                this.setMyLocationMarker(pos);
            });
        
    }

    setMyLocationMarker(pos?: LatLng) {
        pos = pos || this.myLocation;

        // clear old 
        const oldMarker = this.mapView.findMarker(m => m.userData.type === MARKER_TYPES.ME);
        if(oldMarker) this.mapView.removeMarker(oldMarker);

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
        marker.color = '#F2C112';

        this.mapView.addMarker(marker);
        this.zoomMap();
    }

    zoomMap() {
        this.latitude = this.myLocation.latitude;
        this.longitude = this.myLocation.longitude;
        this.zoom = 12;
    }

}