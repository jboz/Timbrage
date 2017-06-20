import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CalendarPage } from './calendar';

import { SharedPipesModule } from "../../pipes/shared.module";

@NgModule({
  declarations: [
    CalendarPage,
  ],
  imports: [
    IonicPageModule.forChild(CalendarPage),
    SharedPipesModule,
  ],
  exports: [
    CalendarPage
  ]
})
export class CalendarModule {}
