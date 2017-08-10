import { NgModule } from '@angular/core';
import { TabsPage } from './tabs';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [TabsPage],
  imports: [
    IonicPageModule.forChild(TabsPage),
    TranslateModule.forChild()
  ],
  entryComponents: [TabsPage]
})
export class TabsPageModule { }