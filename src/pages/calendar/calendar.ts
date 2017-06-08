import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';

import * as moment from 'moment';

import { Timbrage } from '../../model/Timbrage';
import { CalculationProvider } from '../../providers/calculation/calculation';
import { StorageProvider } from '../../providers/storage/storage';

@IonicPage()
@Component({
  selector: 'page-calendar',
  templateUrl: 'calendar.html',
})
export class CalendarPage {

  eventSource;
  viewTitle;
  isSelectedToday: boolean;
  calendar = {
    mode: 'month',
    currentDate: new Date()
  };

  constructor(public calculationService: CalculationProvider, public storageService: StorageProvider) {
  }

  public ionViewWillEnter() {
    this.loadEvents();
  }

  private loadEvents() {
    let start = moment(this.calendar.currentDate).set('date', 1);
    let end = moment(this.calendar.currentDate).endOf('month');
    this.storageService.find(start, end).then((timbrages) => {
      this.eventSource = this.calculationService.splitPairs(timbrages).map(pair => this.toEvent(pair));
    });
  }

  /**
   * Map Timbrage object to Event object.
   */
  toEvent(pair: Timbrage[]) {
    let duration = this.calculationService.diff(pair[1], pair[0]);
    return {
      title: duration,
      startTime: pair[0].getDate(),
      endTime: pair[1].getDate(),
      startTimbrage: pair[0],
      endTimbrage: pair[1]
    }
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
    this.isSelectedToday = moment(event).startOf('day').month() == moment().startOf('day').month();
    // if month changed, load events
    let isChanged = moment(event).month() != moment(this.calendar.currentDate).month();
    this.calendar.currentDate = event;
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
  changeMode(mode) {
    this.calendar.mode = mode;
  }

  /**
   * Navigate to today date.
   */
  today() {
    this.calendar.currentDate = new Date();
    this.loadEvents();
  }
}
