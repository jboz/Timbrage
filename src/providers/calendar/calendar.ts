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
import { TranslateService } from '@ngx-translate/core';
import { SettingsProvider } from '../settings/settings';

@Injectable()
export class CalendarProvider {

  mode: string = 'month';
  currentDate = new Date();
  startHour = 7;

  constructor(public translateService: TranslateService, settings: SettingsProvider) {
    this.startHour = settings.get().startOfDay.hour;
  }

  get dateFormatter() {
    let week = this.translateService.instant('page.calendar.week');
    return {
      formatMonthViewDay: function (date: Date) {
        return date.getDate().toString();
      },
      formatMonthViewDayHeader: function (date: Date) {
        return moment(date).format('ddd');
      },
      formatMonthViewTitle: function (date: Date) {
        return moment(date).format('MMM YYYY');
      },
      formatWeekViewDayHeader: function (date: Date) {
        return moment(date).format('ddd DD');
      },
      formatWeekViewTitle: function (date: Date) {
        return moment(date).format(`MMM YYYY, [${week}] ww`);
      },
      formatWeekViewHourColumn: function (date: Date) {
        return moment(date).format('HH [h]');
      },
      formatDayViewHourColumn: function (date: Date) {
        return moment(date).format('HH [h]');
      },
      formatDayViewTitle: function (date: Date) {
        return moment(date).format('ddd DD MMM YY');
      }
    };
  }
}