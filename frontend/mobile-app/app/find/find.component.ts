import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { android as isAndroid, ios as isIOS } from 'application';
import { Page } from "ui/page/page";
import * as dialogs from "ui/dialogs";
import { ScrollView } from "ui/scroll-view";
import { AndroidData, IOSData, ShapeEnum } from "nativescript-ng-shadow";
import { Location } from "nativescript-geolocation";

import { FindService } from "./find.service";
import { GeolocationService } from "../shared/geolocation";
import { LatLng } from "../shared/models";

@Component({
    selector: "FindPage",
    moduleId: module.id,
    templateUrl: "./find.component.html",
    styleUrls: ["./find.component.css"],
})
export class FindComponent implements OnInit {
    searched = false;
    currLocation: Location;
    foundNearby: any[];
    selectedItemIndex = 0;

    alertButtonShadow: AndroidData | IOSData;

    @ViewChild('scrollList') scrollListRef: ElementRef;
    scrollList: ScrollView;

    pageWidth: number;
    cardStyle: { width: number, margin: number, offsetX: number };

    constructor(
        private page: Page,
        private geolocation: GeolocationService,
        private findService: FindService,
    ) {
    }

    ngOnInit(): void {
        this.page.actionBarHidden = true;

        this.alertButtonShadow = isAndroid ? {
            elevation: 12,
            bgcolor: '#D84039',
            shape: ShapeEnum.OVAL,
        } : {
                elevation: 12,
            }

        this.collectUiInfo();

        this.geolocation.currentLocation$.subscribe(loc => {
            this.currLocation = loc;
            this.fetchNearby();
        });
        this.findService.foundNearby$.subscribe(results => this.foundNearby = results);
        this.geolocation.getCurrent({ silent: true });
    }

    fetchNearby() {
        if (!this.currLocation) return;

        const latlng = LatLng.fromObject(this.currLocation);
        this.findService.findNearby(latlng)
            .catch(e => dialogs.alert(e.message || e));
    }

    collectUiInfo() {
        this.pageWidth = this.page.getActualSize().width;

        if (!this.pageWidth) {
            setTimeout(() => { this.collectUiInfo() }, 100);
            return false;
        }

        this.cardStyle = {
            width: this.pageWidth * 0.6, // 80%
            margin: 10, //this.pageWidth * 0.1, // 10%
            offsetX: this.pageWidth * 0.2 - 10,
        }
        return true;
    }

    onAlertButtonTap() {

        this.geolocation.getCurrent()
            .then(data => this.searched = true)
            .catch(e => dialogs.alert(e.message || e));
    }

    onItemTap(item, index) {
        this.selectedItemIndex = index;
    }
}
