import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'TheCard',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
    @Input() item: any;
    @Input() selected: boolean;
    @Input() style: any;

    @Output() select = new EventEmitter();

    constructor() { }

    ngOnInit() { }

    onSelect() {
        this.select.emit(this.item);
    }
}