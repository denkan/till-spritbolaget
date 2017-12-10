import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EventData } from 'tns-core-modules/ui/frame/frame';
import { android as isAndroid, ios as isIOS } from 'application';
import { AndroidData, IOSData, ShapeEnum } from "nativescript-ng-shadow";

import { UIService } from '../../shared';

@Component({
    selector: 'TheAlertButton',
    template: `
        <GridLayout *ngIf="!searched" colums="*,auto,*" rows="*,auto,*">
            <Image src="res://alert_button" 
                *ngIf="pageWidth"
                [width]="pageWidth"
                [height]="pageWidth"
                col="1" row="1" 
                (tap)="onTap($event)"
            ></Image>
        </GridLayout>
    `,
})
export class AlertButtonComponent implements OnInit {
    @Output() tap = new EventEmitter<EventData>();

    shadow: AndroidData | IOSData;
    pageWidth: number;

    constructor(
        private ui: UIService,
    ) { }

    ngOnInit() {
        this.shadow = isAndroid
            ? { elevation: 12, bgcolor: '#D84039', shape: ShapeEnum.OVAL }
            : { elevation: 12 };

        this.ui.pageSize$.filter(s => !!s).subscribe(s => this.pageWidth=s.width);
    }

    onTap(e: EventData) {
        this.tap.emit(e);
    }
}