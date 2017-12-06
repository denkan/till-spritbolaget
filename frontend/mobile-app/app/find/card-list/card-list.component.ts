import { Component, OnInit, Input, Output, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { ScrollView, ScrollEventData } from "ui/scroll-view";
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
        this.scrollList = <ScrollView>this.scrollListRef.nativeElement;
        this.ui.pageSize$.subscribe(size => this.setCardStyle(size));
    }

    setCardStyle(pageSize: Size) {
        if (!pageSize || !pageSize.width) return;

        this.pageSize = pageSize;

        this.cardStyle = {
            width: Math.floor(this.pageSize.width * 0.6), // 60%
            margin: 10, //old: this.pageWidth * 0.1,
            offsetX: Math.floor(this.pageSize.width * 0.2 - 10),
        }
        return true;
    }

    onSelect(item) {
        this.selectedItemIndex = this.items.findIndex(r => r.id === item.id);
        this.select.emit(item);
    }

    private scrollTimer: number = null;
    onScroll(e: ScrollEventData) {
        clearTimeout(this.scrollTimer);

        this.scrollTimer = setTimeout(() => {

            // find and scroll to closest card
            const
                cardWidth = this.cardStyle.width + (this.cardStyle.margin * 2),
                cardCount = this.items.length,
                scrollWidth = cardWidth * cardCount,
                x = e.scrollX,
                closestCardRate = ((x + cardWidth / 2) / scrollWidth) * cardCount,
                closestCardIndex = Math.floor(closestCardRate);

            this.scrollToCard(closestCardIndex);

        }, 50);
    }

    scrollToCard(index: number) {
        const cardWidth = this.cardStyle.width + (this.cardStyle.margin * 2);
        this.scrollList.scrollToHorizontalOffset((index * cardWidth), true);
    }
}