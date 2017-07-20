import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { SocialSharing } from "@ionic-native/social-sharing";

import { Moment } from 'moment';
import * as moment from 'moment';
import _ from 'lodash';

import { Event } from '../../model/Event';

@Injectable()
export class ReportingProvider {

  constructor(public social: SocialSharing) {
  }

  public share(currentDate: Date, events: Event[]): Promise<any> {
    let month = moment(currentDate).format('yyyy-MM');

    let dates = [];
    dates.push('date');
    events.forEach(event => {
      dates.push(this.format(event.startTimbrage.getMoment()));
      dates.push(this.format(event.endTimbrage.getMoment()));
    });
    let csv = _.join(dates, ',');

    return this.social.share(csv, `Reporting of ${month}`);
  }

  private format(date: Moment): string {
    return date.toISOString();
  }
}
