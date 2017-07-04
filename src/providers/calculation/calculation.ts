import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

import { Timbrage } from '../../model/Timbrage';
import { Duration } from 'moment';
import * as moment from 'moment';

@Injectable()
export class CalculationProvider {

  constructor() {
  }

  public calculate(timbrages: Array<Timbrage>): Duration {
    // if (!this.isOdd(timbrages)) {
    //   // add a new date if array is not pair
    //   timbrages = timbrages.concat([new Timbrage()]);
    // }
    let duration = moment.duration();
    
    if (!timbrages || timbrages.length == 0) {
      // no times
      return duration;
    }

    // calculate duration by pairs of Timbrage
    this.splitPairs(timbrages).forEach(pair => {
      duration = duration.add(this.diff(pair[1], pair[0]));
    });

    // return moment.duration(timbrages);
    return duration;
  }

  public diff(t1: Timbrage, t0: Timbrage): Duration {
    let diff = t1.getMoment().diff(t0.getMoment());

    return moment.duration(diff);
  }

  public isOdd(timbrages: Array<Timbrage>) {
    return timbrages.length % 2;
  }

  public splitPairs(list: Array<Timbrage>, endOfDay = false): Array<Array<Timbrage>> {
    var pairs = [];
    for (var i = 0; i < list.length; i += 2) {
      if (list[i + 1] !== undefined) {
        pairs.push([list[i], list[i + 1]]);
      } else {
        // the list of timbrages is not odd
        let missing = new Timbrage();
        if (endOfDay) {
          // TODO set time to end of day
          missing.date = moment(list[i].date).endOf('day').format();
        }
        pairs.push([list[i], missing]);
      }
    }
    return pairs;
  };
}
