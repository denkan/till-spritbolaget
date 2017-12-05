import { Component, OnInit } from "@angular/core";
import { Page } from "ui/page/page";
import * as dialogs from "ui/dialogs";
import { Location } from "nativescript-geolocation";

import { FindService } from "./find.service";
import { GeolocationService, LatLng, Size, UIService } from "../shared";

@Component({
    selector: "FindPage",
    moduleId: module.id,
    templateUrl: "./find.component.html",
    styleUrls: ["./find.component.css"],
})
export class FindComponent implements OnInit {
    searched = false;
    currLocation: Location;
    items: any[];
    selectedIndex = null;

    constructor(
        private page: Page,
        private geolocation: GeolocationService,
        private findService: FindService,
    ) { }

    ngOnInit(): void {
        this.page.actionBarHidden = true;

        this.geolocation.currentLocation$.subscribe(loc => {
            this.currLocation = loc;
            this.fetchNearby();
        });
        this.geolocation.getCurrent({ silent: true });
        this.findService.selectedIndex$.subscribe(index => this.selectedIndex = index);
        this.findService.items$.subscribe(items => {
            this.items = items;
            this.findService.setSelectedIndex(0);
        });
    }

    fetchNearby() {
        if (!this.currLocation) return;

        const latlng = LatLng.fromObject(this.currLocation);
        this.findService.findNearby(latlng)
            .catch(e => dialogs.alert(e.message || e));
    }

    onAlertButtonTap() {
        this.geolocation.getCurrent()
            .then(data => this.searched = true)
            .catch(e => dialogs.alert(e.message || e));
    }

    onSelect(item) {
        const index = this.items.findIndex(r => r.id===item.id);
        this.findService.setSelectedIndex(this.selectedIndex);
    }
}
