import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { Page } from "ui/page/page";
import { ScrollView } from "ui/scroll-view";

@Component({
    selector: "FindPage",
    moduleId: module.id,
    templateUrl: "./find.component.html",
    styleUrls: ["./find.component.css"],
})
export class FindComponent implements OnInit {
    searched = false;
    myItems = [ {},{},{},{},{} ];
    selectedItemIndex = 0;

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

        this.collectUiInfo();
    }

    collectUiInfo(){
        this.pageWidth = this.page.getActualSize().width;

        if(!this.pageWidth){
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
