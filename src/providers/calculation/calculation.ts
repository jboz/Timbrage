import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

import { Timbrage } from '../../model/Timbrage';
import { Event } from '../../model/Event';
import { Duration } from 'moment';
import * as moment from 'moment';

@Injectable()
export class CalculationProvider {

  constructor() {
  }

  public calculateFromEvents(events: Event[]): Duration {
    if (!events || events.length == 0) {
      return moment.duration();
    }
    let duration = moment.duration();
    events.forEach(event => {
      duration = duration.add(event.duration());
    });
    return duration;
  }

  public calculate(timbrages: Array<Timbrage>): Duration {
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

  public splitPairs(list: Array<Timbrage>, endOfDay = false): Array<Array<Timbrage>> {
    var pairs = [];
    for (var i = 0; i < list.length; i += 2) {
      if (list[i + 1] !== undefined) {
        pairs.push([list[i], list[i + 1]]);
      } else {
        // the list of timbrages is not odd
        let missing = new Timbrage();
        if (endOfDay) {
          // set time to end of day
          missing.date = moment(list[i].date).endOf('day').startOf('minute').format();
        }
        pairs.push([list[i], missing]);
      }
    }
    return pairs;
  };
}
