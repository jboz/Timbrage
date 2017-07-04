import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';

import { Duration } from 'moment';
import * as moment from 'moment';

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
  sum: Duration = moment.duration();

  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController,
    public calculationService: CalculationProvider, public storageService: StorageProvider) {

    this.loadTimbrages();

    // each second, refresh time and duration
    setInterval(() => {
      this.now = new Date();
      this.sum = this.calculationService.calculate(this.timbrages);
    }, 1000);
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
    this.save(new Timbrage());
  }

  public onChangeTime(timbrage: Timbrage): void {
    this.save(timbrage);
  }

  public delete(timbrage) {
    this.storageService.delete(timbrage).then(() => this.loadTimbrages());
  }
}
