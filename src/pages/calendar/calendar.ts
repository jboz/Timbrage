import { Component, ViewChild } from '@angular/core';
import { IonicPage, MenuController, Platform, ToastController, Content } from 'ionic-angular';

import { Duration } from 'moment';
import * as moment from 'moment';
import _ from 'lodash';

import { TranslateService } from '@ngx-translate/core';

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

  @ViewChild(Content) content: Content;

  constructor(private calculationService: CalculationProvider, private storageService: StorageProvider,
    private reporting: ReportingProvider, private menuCtrl: MenuController, public calendarCtrl: CalendarProvider,
    private platform: Platform, private toastCtrl: ToastController, private translate: TranslateService) {
  }

  public ionViewWillEnter() {
    this.menuCtrl.enable(false, 'menuTimbrage');
    this.menuCtrl.enable(true, 'menuCalendar');
    this.loadEvents();
  }

  /**
   * Load all events of the month.
   */
  private loadEvents() {
    let start = moment(this.calendarCtrl.currentDate).set('date', 1);
    let end = start.clone().add(1, 'month');
    this.storageService.find(start, end).then((timbrages) => {
      if (!timbrages || timbrages.length == 0) {
        return;
      }
      // group by day
      let groups = _.groupBy(timbrages, x => x.getMoment().startOf('day').toISOString());
      this.events = new Array();
      for (var day in groups) {
        var timbragesDuJour: Array<Timbrage> = groups[day];
        this.addEvents(timbragesDuJour);
      }
    });
  }

  private addEvents(timbrages: Array<Timbrage>): void {
    // create event from pair of timbrage
    // if one timbrage is missing, add one at end of day
    let events: Event[] = this.calculationService.splitPairs(timbrages, true)
      .map(pair => this.toEvent(pair));

    // // create an 'all day' event to show the sum of the day
    // let duration = this.sumOfDay(events);
    // events.push(Event.allDay(duration.toString(), moment(day)));

    this.validateDuration(events);

    this.events = this.events.concat(events);
  }

  private validateDuration(events: Event[]): void {
    let duration = this.sumOfDay(events);
    if (duration.get('minutes') < 0) {
      let day = moment(events[0].startTime).format('LL');
      let toast = this.toastCtrl.create({
        message: this.translate.instant('error.calendar.event.sum.negative', { day: day }),
        position: 'bottom',
        showCloseButton: true,
        closeButtonText: 'Ok'
      });
      toast.present();
    }
  }

  public sumOfDay(events: Event[]): Duration {
    return this.calculationService.calculateFromEvents(events);
  }

  /**
   * Map Timbrage object to Event object.
   */
  toEvent(pair: Timbrage[]): Event {
    let duration = this.calculationService.diff(pair[1], pair[0]);
    return Event.fromTimbrages(duration.toString().replace('PT', ''), pair[0], pair[1]);
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

  public deleteStart(event: Event) {
    this.storageService.delete(event.startTimbrage).then(() => event.startTimbrage = null);
  }

  public deleteEnd(event: Event) {
    this.storageService.delete(event.endTimbrage).then(() => event.endTimbrage = null);
  }

  public share(): void {
    if (this.platform.is('cordova')) {
      this.reporting.share(this.calendarCtrl.currentDate, this.events);
    }
  }

  public addTimbrage() {
    // add event
    let timbrages = [];
    timbrages.push(Timbrage.from(this.calendarCtrl.currentDate, 8, 0));
    this.addEvents(timbrages);
  }

  public addTimbrages() {
    let currentDate = this.calendarCtrl.currentDate;
    // add event
    let timbrages = [];
    timbrages.push(Timbrage.from(currentDate, 8, 0));
    timbrages.push(Timbrage.from(currentDate, 12, 0));
    timbrages.push(Timbrage.from(currentDate, 13, 0));
    timbrages.push(Timbrage.from(currentDate, 17, 0));
    this.storageService.save(...timbrages).then(() => this.addEvents(timbrages));
  }
}
