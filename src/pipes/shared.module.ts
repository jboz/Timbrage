import { NgModule } from '@angular/core';

import { MomentPipe } from "./moment/moment";

@NgModule({
    declarations: [
        MomentPipe,
    ],
    exports: [
        MomentPipe,
    ]
})
export class SharedPipesModule { }