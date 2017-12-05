import { Injectable } from '@angular/core';
import { Page } from 'ui/page';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Size } from '../models';

@Injectable()
export class UIService {
    private _pageSize$$: BehaviorSubject<Size> = new BehaviorSubject(null);

    get pageSize$() {
        return this._pageSize$$.asObservable();
    }

    constructor(
        private page: Page, 
    ) { 
        this.fetchPageSize();
    }


    fetchPageSize() {
        const size: Size = this.page.getActualSize();
        
        if (!size || !size.width) {
            setTimeout(() => { this.fetchPageSize() }, 100);
            return size;
        }

        this._pageSize$$.next(size);
        return size;
    }

}