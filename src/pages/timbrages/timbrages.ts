import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';

import { Timbrage } from '../../model/Timbrage';

@IonicPage()
@Component({
  selector: 'page-timbrages',
  templateUrl: 'timbrages.html',
})
export class TimbragesPage {

  timbrages = new Array<Timbrage>();
  now = new Date();

  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController) {
    setInterval(() => {
      this.now = new Date();
    }, 1000);
  }

  public today() {
    return new Date();
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
