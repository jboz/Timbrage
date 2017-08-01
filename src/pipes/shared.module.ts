import { NgModule } from '@angular/core';

import { MomentPipe } from "./moment/moment";
import { DurationPipe } from "./moment/duration";

@NgModule({
    declarations: [
        MomentPipe, DurationPipe,
    ],
    exports: [
        MomentPipe, DurationPipe,
    ]
})
export class SharedPipesModule { }