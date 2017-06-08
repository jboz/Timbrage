import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';

import { Duration, Moment } from 'moment';
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

    this.storageService.find(moment()).then((data) => {
      this.timbrages = data;
    });

    // each second, refresh time and duration
    setInterval(() => {
      this.now = new Date();
      this.sum = this.calculationService.calculate(this.timbrages);
    }, 1000);
  }

  public timbrer() {
    this.storageService.add(new Timbrage()).then((timbrage) => {
      //timbrages.forEach(timbrage => this.timbrages.push(timbrage));
      this.timbrages.push(timbrage);
    });
  }

  public onChangeTime(timbrage: Timbrage): void {
    this.storageService.update(timbrage);
  }

  public delete(timbrage) {
    let index = this.timbrages.indexOf(timbrage);

    if (index > -1) {
      this.timbrages.splice(index, 1);
      this.storageService.delete(timbrage);
    }
  }
}
