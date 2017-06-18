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

  public splitPairs(arr: Array<Timbrage>): Array<Array<Timbrage>> {
    var pairs = [];
    for (var i = 0; i < arr.length; i += 2) {
      if (arr[i + 1] !== undefined) {
        pairs.push([arr[i], arr[i + 1]]);
      } else {
        // the list of timbrages is not odd
        pairs.push([arr[i], new Timbrage()]);
      }
    }
    return pairs;
  };
}
