import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { NgShadowModule } from 'nativescript-ng-shadow'; 

import { routes } from "./find.routes";
import { FindComponent } from "./find.component";
import { FindService } from "./find.service";
import { MapComponent } from "./map/map.component";
import { GeolocationModule } from "../shared/geolocation";
import { GoogleMapsModule } from "../shared/google-maps";


@NgModule({
    imports: [
        NativeScriptCommonModule,
        NativeScriptRouterModule.forChild(routes),
        NgShadowModule,
        GeolocationModule,
        GoogleMapsModule,
    ],
    declarations: [
        FindComponent,
        MapComponent,
    ],
    providers: [
        FindService,
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class FindModule { }
