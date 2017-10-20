import { Component } from '@angular/core';
import { IonicPage, MenuController } from 'ionic-angular';

import { Duration } from 'moment';
import * as moment from 'moment';
import _ from 'lodash';

import { Timbrage } from '../../model/Timbrage';
import { CalculationProvider } from '../../providers/calculation/calculation';
import { StorageProvider } from '../../providers/storage/storage';

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

  constructor(public calculationService: CalculationProvider, public storageService: StorageProvider,
    public menuCtrl: MenuController) {

    // each second, refresh time and duration
    setInterval(() => {
      this.now = new Date();
      this.sumDay = this.calculationService.calculate(this.timbrages);
      this.storageService.find(moment().startOf('week'), moment().endOf('week')).then((timbrages) => {
        this.sumWeek = this.calculationService.calculate(timbrages);
      });
      this.storageService.find(moment().startOf('month'), moment().endOf('month')).then((timbrages) => {
        this.sumMonth = this.calculationService.calculate(timbrages);
      });
    }, 1000);
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true, 'menuTimbrage');
    this.menuCtrl.enable(false, 'menuCalendar');
    this.loadTimbrages();
  }

  public loadTimbrages() {
    this.storageService.find(moment()).then((data) => {
      this.timbrages = data;
    });
  }

  public save(timbrage: Timbrage): void {
    this.storageService.save(timbrage).then(() => this.loadTimbrages());
  }

  public timbrer() {
    let timbrage = new Timbrage();
    this.timbrages.push(timbrage);
    this.save(timbrage);
  }

  public onChangeTime(timbrage: Timbrage): void {
    this.save(timbrage);
  }

  public delete(timbrage) {
    _.pull(this.timbrages, timbrage);
    this.storageService.delete(timbrage).then(() => this.loadTimbrages());
  }
}
