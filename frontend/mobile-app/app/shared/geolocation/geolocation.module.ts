import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GeolocationService } from './geolocation.service';

@NgModule({
    declarations: [

    ],
    imports: [ 
        CommonModule, 
    ],
    exports: [

    ],
    providers: [
        GeolocationService
    ],
})
export class GeolocationModule {}