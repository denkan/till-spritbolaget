import { Component, OnInit, Input, Output, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { ScrollView } from "ui/scroll-view";
import { Size, UIService } from "../../shared";

@Component({
    moduleId: module.id,
    selector: 'TheCardList',
    templateUrl: './card-list.component.html',
    styleUrls: ['./card-list.component.css']
})
export class CardListComponent implements OnInit {
    @Input() items: any[];
    selectedItemIndex = 0;

    @Output() select = new EventEmitter();

    @ViewChild('scrollList') scrollListRef: ElementRef;
    scrollList: ScrollView;

    pageSize: Size;
    cardStyle: { 
        width: number, 
        margin: number, 
        offsetX: number 
    };

    constructor(
        private ui: UIService,
    ) { }

    ngOnInit() { 
        this.ui.pageSize$.subscribe(size => this.setCardStyle(size));
    }


    setCardStyle(pageSize: Size) {
        if(!pageSize || !pageSize.width) return;

        this.pageSize = pageSize;

        this.cardStyle = {
            width: this.pageSize.width * 0.6, // 80%
            margin: 10, //this.pageWidth * 0.1, // 10%
            offsetX: this.pageSize.width * 0.2 - 10,
        }
        return true;
    }

    onSelect(item) {
        this.selectedItemIndex = this.items.findIndex(r => r.id===item.id);
        this.select.emit(item);
    }
}