import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class CalendarProvider {

  mode: string = 'month';
  currentDate = new Date();

  constructor(public translateService: TranslateService) { }

  get dateFormatter() {
    let week = this.translateService.instant('calendar.week');
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