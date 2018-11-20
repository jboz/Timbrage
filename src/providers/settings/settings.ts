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

import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Moment } from 'moment';

export class Settings {
  endOfDay = {
    hour: 18,
    minute: 0,
    second: 0
  };

  startOfDay = {
    hour: 8,
    minute: 0,
    second: 0
  };

  saveMissings = true;
}

@Injectable()
export class SettingsProvider {

  private settings = new Settings();

  constructor() {
  }

  public get(): Settings {
    return this.settings;
  }

  public getEndOfDay(): Moment {
    return this.applyEndOfDay();
  }

  public applyEndOfDay(date: Moment = moment()): Moment {
    date.hour(this.settings.endOfDay.hour);
    date.minute(this.settings.endOfDay.minute);
    date.second(this.settings.endOfDay.second);

    return date;
  }
}
