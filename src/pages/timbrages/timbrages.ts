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

import { Component, ViewChild } from '@angular/core';
import { IonicPage, MenuController, Content } from 'ionic-angular';

import { Duration } from 'moment';
import * as moment from 'moment';
import _ from 'lodash';

import { Timbrage } from '../../model/Timbrage';
import { CalculationProvider } from '../../providers/calculation/calculation';
import { StorageProvider } from '../../providers/storage/storage';
import { LoadingProvider } from '../../providers/loading/loading';

@IonicPage()
@Component({
  selector: 'page-timbrages',
  templateUrl: 'timbrages.html',
  providers: [CalculationProvider, StorageProvider]
})
export class TimbragesPage {

  timbrages = new Array<Timbrage>();
  now = new Date();
  sumDay: Duration = moment.duration();
  sumWeek: Duration = moment.duration();
  sumMonth: Duration = moment.duration();

  @ViewChild(Content) content: Content;

  timerDay: any;
  timerWeek: any;
  timerMonth: any;

  constructor(public calculationService: CalculationProvider, public storageService: StorageProvider,
    public menuCtrl: MenuController, public loader: LoadingProvider) {
  }

  ionViewDidEnter() {
    // refresh time and duration
    this.startTimers();
  }

  ionViewDidLeave() {
    this.stopTimers();
  }

  private startTimers(): void {

    this.timerDay = setInterval(() => {
      this.now = new Date();
      this.calculationService.calculate(this.timbrages).then((duration) => this.sumDay = duration);
    }, 1000);

    this.timerWeek = setInterval(() => {
      this.storageService.find(moment().startOf('week'), moment().endOf('week')).then((timbrages) => {
        this.calculationService.calculate(timbrages).then((duration) => this.sumWeek = duration);
      });
    }, 1000);

    this.timerMonth = setInterval(() => {
      this.storageService.find(moment().startOf('month'), moment().endOf('month')).then((timbrages) => {
        this.calculationService.calculate(timbrages).then((duration) => this.sumMonth = duration);
      });
    }, 1000);
  }

  private stopTimers() {
    if (this.timerDay) clearInterval(this.timerDay);
    if (this.timerWeek) clearInterval(this.timerWeek);
    if (this.timerMonth) clearInterval(this.timerMonth);
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true, 'menuTimbrage');
    this.menuCtrl.enable(false, 'menuCalendar');
    this.loadTimbrages();
  }

  public loadTimbrages() {
    this.loader.present();

    this.storageService.find()
      .then((data) => this.timbrages = _.filter(data, (timbrage) => timbrage && timbrage.getMoment().isSame(moment(), 'day')))
      .then(() => this.loader.dismiss());
  }

  public save(timbrage: Timbrage): void {
    this.storageService.save(timbrage);
    this.reorder();
  }

  private reorder() {
    this.timbrages = _.sortBy(this.timbrages, (timbrage) => timbrage.getDate());
  }

  public timbrer() {
    let timbrage = new Timbrage();
    this.timbrages.push(timbrage);
    this.save(timbrage);
    this.reorder();
    this.content.scrollToBottom();
  }

  public onChangeTime(timbrage: Timbrage): void {
    this.save(timbrage);
  }

  public delete(timbrage) {
    _.pull(this.timbrages, timbrage);
    this.storageService.delete(timbrage);
  }
}
