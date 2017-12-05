import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EventData } from 'tns-core-modules/ui/frame/frame';
import { android as isAndroid, ios as isIOS } from 'application';
import { AndroidData, IOSData, ShapeEnum } from "nativescript-ng-shadow";

@Component({
    selector: 'TheAlertButton',
    template: `
        <GridLayout *ngIf="!searched" colums="*,auto,*" rows="*,auto,*">
            <Button 
                class="btn btn-primary alert-button" 
                col="1" row="1" 
                (tap)="onTap($event)"
                [shadow]="shadow"
            ></Button>
        </GridLayout>
    `,
    styles: [`
        .alert-button {
            width: 300;
            height: 300;
            border-radius: 150;
        }
    `]
})
export class AlertButtonComponent implements OnInit {
    @Output() tap = new EventEmitter<EventData>();

    shadow: AndroidData | IOSData;

    constructor() { }

    ngOnInit() {
        this.shadow = isAndroid
            ? { elevation: 12, bgcolor: '#D84039', shape: ShapeEnum.OVAL }
            : { elevation: 12 };
    }

    onTap(e: EventData) {
        this.tap.emit(e);
    }
}