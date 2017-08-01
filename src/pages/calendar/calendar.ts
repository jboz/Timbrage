import { Component } from '@angular/core';
import { IonicPage, MenuController, Platform } from 'ionic-angular';

import { Duration } from 'moment';
import * as moment from 'moment';
import _ from 'lodash';

import { Timbrage } from '../../model/Timbrage';
import { Event } from '../../model/Event';
import { CalculationProvider } from '../../providers/calculation/calculation';
import { StorageProvider } from '../../providers/storage/storage';
import { ReportingProvider } from '../../providers/reporting/reporting';
import { CalendarProvider } from '../../providers/calendar/calendar';

@IonicPage()
@Component({
  selector: 'page-calendar',
  templateUrl: 'calendar.html',
})
export class CalendarPage {

  events: Array<Event> = [];
  viewTitle;
  isSelectedToday: boolean;

  constructor(public calculationService: CalculationProvider, public storageService: StorageProvider,
    public reporting: ReportingProvider, public menuCtrl: MenuController, public calendarCtrl: CalendarProvider,
    public platform: Platform) {
    this.menuCtrl.enable(false, 'menuTimbrage');
    this.menuCtrl.enable(true, 'menuCalendar');
  }

  public ionViewWillEnter() {
    this.loadEvents();
  }

  /**
   * Load all events of the month.
   */
  private loadEvents() {
    let start = moment(this.calendarCtrl.currentDate).set('date', 1);
    let end = start.clone().add(1, 'month');
    this.storageService.find(start, end).then((timbrages) => {
      // TODO group by day and after split pairs
      if (!timbrages || timbrages.length == 0) {
        return;
      }
      // group by day
      let groups = _.groupBy(timbrages, x => x.getMoment().startOf('day').toISOString());
      this.events = new Array();
      for (var day in groups) {
        var timbragesDuJour: Array<Timbrage> = groups[day];
        // create event from pair of timbrage
        // if one timbrage is missing, add one at end of day
        let events: Event[] = this.calculationService.splitPairs(timbragesDuJour, true)
          .map(pair => this.toEvent(pair));

        // // create an 'all day' event to show the sum of the day
        // let duration = this.sumOfDay(events);
        // events.push(Event.allDay(duration.toString(), moment(day)));

        this.events = this.events.concat(events);
      }
    });
  }

  public sumOfDay(events: Event[]): Duration {
    return this.calculationService.calculateFromEvents(events);
  }

  /**
   * Map Timbrage object to Event object.
   */
  toEvent(pair: Timbrage[]): Event {
    let duration = this.calculationService.diff(pair[1], pair[0]);
    return Event.fromTimbrages(duration.toString(), pair[0], pair[1]);
  }


  /**
   * Mark next month to disable.
   */
  markDisabled = (date: Date) => {
    return moment(date).month() > moment().month();
  };

  /**
   * Update flag that indicate if the selected date is today.
   */
  onCurrentDateChanged(event: Date) {
    this.isSelectedToday = moment(event).startOf('day').toString() == moment().startOf('day').toString();
    // if month changed, load events
    let isChanged = moment(event).month() != moment(this.calendarCtrl.currentDate).month();
    this.calendarCtrl.currentDate = event;
    if (isChanged) {
      this.loadEvents();
    }
  }

  /**
   * Mise à jour du titre de la page avec la vue calendrier en cours.
   */
  onViewTitleChanged(title) {
    this.viewTitle = title;
  }

  /**
   * Changement du type de vue.
   */
  changeMode(mode: string): void {
    this.calendarCtrl.mode = mode;
  }

  /**
   * Navigate to today date.
   */
  today() {
    this.calendarCtrl.currentDate = new Date();
    this.loadEvents();
  }

  public onChangeTime(timbrage: Timbrage): void {
    this.storageService.save(timbrage).then(() => this.loadEvents());
  }

  public delete(timbrage: Timbrage) {
    this.storageService.delete(timbrage).then(() => this.loadEvents());
  }

  public share(): void {
    if (this.platform.is('cordova')) {
      this.reporting.share(this.calendarCtrl.currentDate, this.events);
    }
  }
}
