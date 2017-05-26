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

  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController) {
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

  public edit(timbrage) {
    let prompt = this.alertCtrl.create({
      title: 'Modification',
      inputs: [{
        name: 'horodatage',
        type: 'time'
      }],
      buttons: [
        {
          text: 'Annuler'
        },
        {
          text: 'Enregistrer',
          handler: data => {
            let index = this.timbrages.indexOf(timbrage);

            if (index > -1) {
              this.timbrages[index].date = data;
            }
          }
        }
      ]
    });

    prompt.present();
  }
}
