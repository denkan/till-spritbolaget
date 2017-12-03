import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { routes } from "./find.routes";
import { FindComponent } from "./find.component";

@NgModule({
    imports: [
        NativeScriptCommonModule,
        NativeScriptRouterModule.forChild(routes)
    ],
    declarations: [
        FindComponent,
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class FindModule { }
