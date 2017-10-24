// Copyright (C) 2017 Julien Boz
// 
// This file is part of Focus IT - Timbrage.
// 
// Focus IT - Timbrage is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// Focus IT - Timbrage is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with Focus IT - Timbrage.  If not, see <http://www.gnu.org/licenses/>.
// 

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