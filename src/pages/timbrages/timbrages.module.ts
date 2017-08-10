import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TimbragesPage } from './timbrages';

import { TranslateModule } from '@ngx-translate/core';

import { SharedPipesModule } from "../../pipes/shared.module";

@NgModule({
  declarations: [
    TimbragesPage,
  ],
  imports: [
    IonicPageModule.forChild(TimbragesPage),
    SharedPipesModule,
    TranslateModule.forChild()
  ],
  exports: [
    TimbragesPage
  ]
})
export class TimbragesModule {}
