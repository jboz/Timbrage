import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

import { Timbrage } from '../../model/Timbrage';
import { Event } from '../../model/Event';
import { Duration } from 'moment';
import * as moment from 'moment';

import { SettingsProvider } from "../settings/settings";
import { StorageProvider } from "../storage/storage";

@Injectable()
export class CalculationProvider {

  constructor(public settings: SettingsProvider, public storage: StorageProvider) {
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
        // if we must set missing report to end of the day (use in calendar view)
        // only if it's not in the today date
        // and the actual time is not before the parameterized end of day
        let isToday = moment().isSame(list[i].getDate(), "day");
        let isAfterParametizedEndOfDay = moment().isAfter(this.settings.getEndOfDay());
        if (endOfDay && (!isToday || isAfterParametizedEndOfDay)) {
          // set time to end of day
          missing.date = this.settings.applyEndOfDay(moment(list[i].date)).startOf('minute').format();

          if (this.settings.get().saveMissings) {
            // missing timbrage must be save to database
            this.storage.saveSync(missing).then((timbrage) => missing = timbrage[0]);
          }
        }
        pairs.push([list[i], missing]);
      }
    }
    return pairs;
  };
}
