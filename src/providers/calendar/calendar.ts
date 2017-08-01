import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

@Injectable()
export class CalendarProvider {

  mode: string = 'month';
  currentDate = new Date();

}
