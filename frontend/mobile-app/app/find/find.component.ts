import { Component, OnInit } from "@angular/core";
import { Page } from "ui/page/page";

@Component({
    selector: "FindPage",
    moduleId: module.id,
    templateUrl: "./find.component.html"
})
export class FindComponent implements OnInit {

    constructor(
        private page: Page,
    ) {
    }

    ngOnInit(): void {
        this.page.actionBarHidden = true;
    }
}
