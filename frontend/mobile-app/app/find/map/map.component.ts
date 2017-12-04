import { Component, OnInit } from '@angular/core';
import { registerElement } from 'nativescript-angular/element-registry';
import { MapView, Marker, Position, Style, Bounds } from 'nativescript-google-maps-sdk';
import { Image } from 'ui/image/image';

import * as mapStyles from './map.styles';
import { GeolocationService } from '../../shared/geolocation';

// Important - must register MapView plugin in order to use in Angular templates
registerElement('MapView', () => MapView);


@Component({
    moduleId: module.id,
    selector: 'TheMap',
    template: `
    <GridLayout>
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

    latitude =  60;
    longitude = 15;
    zoom = 6;
    bearing = 0;
    tilt = 0;
    padding = [40, 40, 40, 40];
    mapView: MapView;

    lastCamera: String;

    constructor(
        private geolocation: GeolocationService
    ) {
    }

    ngOnInit() {
    }

    //Map events
    onMapReady(event) {
        console.log('Map Ready');

        this.mapView = event.object;

        this.mapView.setStyle(<Style>mapStyles.DARK);
        
        this.geolocation.currentLocation$
            .filter(pos => !!pos)
            .subscribe(pos => {
                console.log('got pos')
                console.dir(pos);
                this.latitude = pos.latitude;
                this.longitude = pos.longitude;
                this.zoom = 12;

                this.mapView.clear();

                const marker = new Marker();
                marker.position = Position.positionFromLatLng(pos.latitude, pos.longitude);
                // marker.title = "Du";
                // marker.snippet = "Du";
                // marker.userData = {index: 1};
                this.mapView.addMarker(marker);
            })


    }

}