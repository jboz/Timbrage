import { Component } from '@angular/core';

import { TimbragesPage } from '../timbrages/timbrages';
import { CalendarPage } from '../calendar/calendar';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = TimbragesPage;
  tab2Root = CalendarPage;

  constructor() {

  }
}
