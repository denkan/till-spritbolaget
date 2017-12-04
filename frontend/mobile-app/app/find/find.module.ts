import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { NgShadowModule } from 'nativescript-ng-shadow'; 

import { routes } from "./find.routes";
import { FindComponent } from "./find.component";
import { GeolocationModule } from "../shared/geolocation";

@NgModule({
    imports: [
        NativeScriptCommonModule,
        NativeScriptRouterModule.forChild(routes),
        NgShadowModule,
        GeolocationModule
    ],
    declarations: [
        FindComponent,
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class FindModule { }
