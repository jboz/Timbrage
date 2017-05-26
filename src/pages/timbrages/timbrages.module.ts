import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TimbragesPage } from './timbrages';

@NgModule({
  declarations: [
    TimbragesPage,
  ],
  imports: [
    IonicPageModule.forChild(TimbragesPage),
  ],
  exports: [
    TimbragesPage
  ]
})
export class TimbragesModule {}
