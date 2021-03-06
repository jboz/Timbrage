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

import { ElementRef, Component, ViewChild } from "@angular/core";
import { IonicPage, MenuController, ToastController } from "ionic-angular";

import { Duration, Moment } from "moment";
import * as moment from "moment";
import _ from "lodash";

import { TranslateService } from "@ngx-translate/core";

import { Timbrage } from "../../model/Timbrage";
import { Event } from "../../model/Event";
import { CalculationProvider } from "../../providers/calculation/calculation";
import { StorageProvider } from "../../providers/storage/storage";
import { ReportingProvider } from "../../providers/reporting/reporting";
import { CalendarProvider } from "../../providers/calendar/calendar";
import { LoadingProvider } from "../../providers/loading/loading";

import { CalendarComponent } from "ionic2-calendar/calendar";

@IonicPage()
@Component({
  selector: "page-calendar",
  templateUrl: "calendar.html"
})
export class CalendarPage {
  events: Array<Event> = [];
  viewTitle;
  isSelectedToday: boolean;
  sumDay: Duration;

  @ViewChild(CalendarComponent)
  calendar;

  @ViewChild("export")
  private exportLink: ElementRef;

  constructor(
    private calculationService: CalculationProvider,
    private storageService: StorageProvider,
    private reporting: ReportingProvider,
    private menuCtrl: MenuController,
    public calendarCtrl: CalendarProvider,
    private toastCtrl: ToastController,
    private translate: TranslateService,
    public loader: LoadingProvider
  ) {}

  public ionViewWillEnter() {
    this.menuCtrl.enable(false, "menuTimbrage");
    this.menuCtrl.enable(true, "menuCalendar");
    this.loadAllEvents();
  }

  /**
   * Load all events of the day.
   */
  private reloadDay(date: Date = this.calendarCtrl.currentDate) {
    this.updateSumOfDay();
    let start = moment(this.calendarCtrl.currentDate).startOf("day");
    let end = start.clone().endOf("day");
    this.storageService
      .find(start, end)
      .then(timbrages => this.addTimbragesAsEvent(timbrages, start))
      .then(events => this.updateSumOfDay(events))
      .then(() => this.calendar.loadEvents());
  }

  /**
   * Load all events of the month.
   */
  private loadAllEvents(): Promise<Event[]> {
    let start = moment(this.calendarCtrl.currentDate).startOf("month");
    let end = start.clone().endOf("month");
    return this.storageService
      .find(start, end)
      .then(timbrages => {
        if (!timbrages || timbrages.length == 0) {
          return;
        }
        // group by day
        let days = _.groupBy(timbrages, x =>
          x
            .getMoment()
            .startOf("day")
            .toISOString()
        );
        this.events = new Array();
        for (var day in days) {
          var timbragesDuJour: Array<Timbrage> = days[day];
          this.addEvents(timbragesDuJour);
        }

        return this.events;
      })
      .then(events => {
        this.updateSumOfDay();
        return events;
      });
  }

  private addTimbragesAsEvent(
    timbrages: Array<Timbrage>,
    start: Moment = moment(this.calendarCtrl.currentDate).startOf("day")
  ): Event[] {
    if (!timbrages || timbrages.length == 0) {
      return;
    }
    // remove previous events
    _.remove(
      this.events,
      event => event && event.getMoment().isSame(start, "day")
    );
    // create new events
    return this.addEvents(timbrages);
  }

  private addEvents(timbrages: Array<Timbrage>): Event[] {
    // create event from pair of timbrage
    // if one timbrage is missing, add one at end of day
    let events: Event[] = this.calculationService
      .splitPairs(timbrages, true)
      .map(pair => this.toEvent(pair));

    this.validateDuration(events);

    this.events = this.events.concat(events);

    return events;
  }

  private validateDuration(events: Event[]): void {
    this.calculationService.calculateFromEvents(events).then(duration => {
      if (duration.get("minutes") < 0) {
        let day = moment(events[0].startTime).format("LL");
        let toast = this.toastCtrl.create({
          message: this.translate.instant("error.calendar.event.sum.negative", {
            day: day
          }),
          position: "bottom",
          showCloseButton: true,
          closeButtonText: "Ok"
        });
        toast.present();
      }
    });
  }

  public updateSumOfDay(
    events: Event[] = _.filter(
      this.events,
      event =>
        event &&
        event.getMoment().isSame(moment(this.calendarCtrl.currentDate), "day")
    )
  ): void {
    this.calculationService
      .calculateFromEvents(events)
      .then(duration => (this.sumDay = duration));
  }

  /**
   * Map Timbrage object to Event object.
   */
  toEvent(pair: Timbrage[]): Event {
    let duration = this.calculationService.diff(pair[1], pair[0]);
    return Event.fromTimbrages(
      duration.toString().replace("PT", ""),
      pair[0],
      pair[1]
    );
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
    this.isSelectedToday =
      moment(event)
        .startOf("day")
        .toString() ==
      moment()
        .startOf("day")
        .toString();
    // if month changed, load events
    let monthChanged =
      moment(event).month() != moment(this.calendarCtrl.currentDate).month();
    let dayChanged =
      moment(event).day() != moment(this.calendarCtrl.currentDate).day();
    this.calendarCtrl.currentDate = event;
    if (monthChanged) {
      this.loadAllEvents();
    } else if (dayChanged) {
      this.reloadDay();
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
    this.reloadDay();
  }

  public onChangeTime(timbrage: Timbrage): void {
    this.updateSumOfDay();
    this.storageService.save(timbrage).then(() => this.reloadDay());
  }

  public deleteStart(event: Event) {
    this.storageService
      .delete(event.startTimbrage)
      .then(() => (event.startTimbrage = null))
      .then(() => {
        if (event.endTimbrage == null && event.startTimbrage == null) {
          // remove empty event
          _.remove(this.events, event);
        }
      })
      .then(() => this.updateSumOfDay());
  }

  public deleteEnd(event: Event) {
    this.storageService
      .delete(event.endTimbrage)
      .then(() => (event.endTimbrage = null))
      .then(() => {
        if (event.endTimbrage == null && event.startTimbrage == null) {
          // remove empty event
          _.remove(this.events, event);
        }
      })
      .then(() => this.updateSumOfDay());
  }

  public share(): void {
    this.reporting.share(
      this.calendarCtrl.currentDate,
      this.events,
      this.exportLink
    );
  }

  public addTimbrage() {
    this.storageService
      .save(Timbrage.from(this.calendarCtrl.currentDate))
      .then(() => this.reloadDay());
  }

  public addTimbrages() {
    let timbrages = [
      Timbrage.from(this.calendarCtrl.currentDate, 8, 0),
      Timbrage.from(this.calendarCtrl.currentDate, 12, 0),
      Timbrage.from(this.calendarCtrl.currentDate, 13, 0),
      Timbrage.from(this.calendarCtrl.currentDate, 17, 0)
    ];
    this.addTimbragesAsEvent(timbrages);
    this.storageService.save(...timbrages).then(() => this.reloadDay());
  }
}
