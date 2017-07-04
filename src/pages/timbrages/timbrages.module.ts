import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TimbragesPage } from './timbrages';

import { SharedPipesModule } from "../../pipes/shared.module";

@NgModule({
  declarations: [
    TimbragesPage,
  ],
  imports: [
    IonicPageModule.forChild(TimbragesPage),
    SharedPipesModule,
  ],
  exports: [
    TimbragesPage
  ]
})
export class TimbragesModule {}
