import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NativeScriptHttpModule } from "nativescript-angular/http";

import { GoogleMapsService } from './google-maps.service';

@NgModule({
    declarations: [

    ],
    imports: [ 
        CommonModule,
        NativeScriptHttpModule,
    ],
    exports: [

    ],
    providers: [
        GoogleMapsService,
    ],
})
export class GoogleMapsModule {}