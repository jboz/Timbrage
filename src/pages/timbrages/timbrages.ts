import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';

import { Duration } from 'moment';
import * as moment from 'moment';

import { Timbrage } from '../../model/Timbrage';
import { CalculationProvider } from '../../providers/calculation/calculation';

@IonicPage()
@Component({
  selector: 'page-timbrages',
  templateUrl: 'timbrages.html',
  providers: [CalculationProvider]
})
export class TimbragesPage {

  timbrages = new Array<Timbrage>();
  now = new Date();
  sum: Duration = moment.duration();

  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController,
    public calculation: CalculationProvider) {
    
    // each secon, refresh time and duration
    setInterval(() => {
      this.now = new Date();
      this.sum = this.calculation.calculate(this.timbrages);
    }, 1000);
  }

  public timbrer() {
    this.timbrages.push(new Timbrage());
  }

  public delete(timbrage) {
    let index = this.timbrages.indexOf(timbrage);

    if (index > -1) {
      this.timbrages.splice(index, 1);
    }
  }
}
