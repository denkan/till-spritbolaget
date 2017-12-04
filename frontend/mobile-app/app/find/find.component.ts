import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { android as isAndroid, ios as isIOS } from 'application';
import { Page } from "ui/page/page";
import { ScrollView } from "ui/scroll-view";
import { AndroidData, IOSData, ShapeEnum } from "nativescript-ng-shadow";

@Component({
    selector: "FindPage",
    moduleId: module.id,
    templateUrl: "./find.component.html",
    styleUrls: ["./find.component.css"],
})
export class FindComponent implements OnInit {
    searched = false;
    myItems = [{}, {}, {}, {}, {}];
    selectedItemIndex = 0;

    alertButtonShadow: AndroidData  |  IOSData;

    @ViewChild('scrollListFFS') scrollListRef: ElementRef;
    scrollList: ScrollView;

    pageWidth: number;
    cardStyle: { width: number, margin: number, offsetX: number };

    constructor(
        private page: Page,
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
        this.searched = true;
    }

    onItemTap(item, index) {
        this.selectedItemIndex = index;
    }
}
