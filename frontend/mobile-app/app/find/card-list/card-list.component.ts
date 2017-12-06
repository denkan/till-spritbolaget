import {
    Component, OnInit, Input, Output, ViewChild,
    ElementRef, EventEmitter, OnChanges, SimpleChanges
} from '@angular/core';
import { ScrollView, ScrollEventData } from "ui/scroll-view";
import { Size, UIService } from "../../shared";

@Component({
    moduleId: module.id,
    selector: 'TheCardList',
    templateUrl: './card-list.component.html',
    styleUrls: ['./card-list.component.css']
})
export class CardListComponent implements OnInit, OnChanges {
    @Input() items: any[];
    @Input() selectedIndex: number;

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

    private changeTasks: Function[] = [];
    doChangeTasks() {
        while (this.changeTasks.length) {
            this.changeTasks.shift().apply(this);
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        //console.log('card-list.comp.changes:', Object.keys(changes).join(' | '));

        if (changes.selectedIndex !== undefined) {
            this.changeTasks.push(this.scrollToCard);
        }

        // run immediately if cardStyle's set - or wait and run in setCardStyle()
        if (this.cardStyle) this.doChangeTasks();
    }

    setCardStyle(pageSize: Size) {
        if (!pageSize || !pageSize.width) return;

        this.pageSize = pageSize;

        this.cardStyle = {
            width: Math.floor(this.pageSize.width * 0.6), // 60%
            margin: 10, //old: this.pageWidth * 0.1,
            offsetX: Math.floor(this.pageSize.width * 0.2 - 10),
        }

        this.doChangeTasks();
        return true;
    }

    onSelect(item) {
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

            this.scrollToCard(closestCardIndex, 300);

        }, 50);
    }

    scrollToCard(index?: number, selectDelay?: number) {
        index = index || this.selectedIndex;

        const cardWidth = this.cardStyle.width + (this.cardStyle.margin * 2);
        this.scrollList.scrollToHorizontalOffset((index * cardWidth), true);

        if (selectDelay !== undefined && this.selectedIndex !== index) {
            this.scrollTimer = setTimeout(() => {
                this.onSelect(this.items[index]);
            }, selectDelay);
        }
    }
}