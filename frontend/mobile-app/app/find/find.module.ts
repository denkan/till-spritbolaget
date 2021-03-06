import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { NgShadowModule } from 'nativescript-ng-shadow'; 

import { routes } from "./find.routes";
import { FindComponent } from "./find.component";
import { FindService } from "./find.service";
import { AlertButtonComponent } from "./alert-button/alert-button.component";
import { MapComponent } from "./map/map.component";
import { CardComponent } from "./card/card.component";
import { CardListComponent } from "./card-list/card-list.component";
import { GeolocationModule, GoogleMapsModule, UIModule } from "../shared";


@NgModule({
    imports: [
        NativeScriptCommonModule,
        NativeScriptRouterModule.forChild(routes),
        NgShadowModule,
        GeolocationModule,
        GoogleMapsModule,
        UIModule,
    ],
    declarations: [
        FindComponent,
        AlertButtonComponent,
        MapComponent,
        CardComponent,
        CardListComponent,
    ],
    providers: [
        FindService,
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class FindModule { }
