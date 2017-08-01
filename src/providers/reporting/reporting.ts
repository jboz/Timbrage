import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

import { SocialSharing } from "@ionic-native/social-sharing";
import { File } from '@ionic-native/file';

import { Moment } from 'moment';
import * as moment from 'moment';
import _ from 'lodash';

import { Event } from '../../model/Event';

@Injectable()
export class ReportingProvider {

  constructor(public social: SocialSharing, public fileSystem: File) {
  }

  public share(currentDate: Date, events: Event[]): Promise<any> {
    let month = moment(currentDate).format('YYYY-MM');
    let csv = this.createCsvReport(events);

    return this.createFile(`${month}.csv`, csv).then((path) => {
      return this.social.share('Here are the times of the month', `Reporting of ${month}`, path);
    });
  }

  public createFile(name: string, content: string): Promise<string> {
    return this.fileSystem.writeFile(this.fileSystem.dataDirectory, name, content, { replace: true })
      .then(() => {
        return `${this.fileSystem.dataDirectory}/${name}`;
      });
  }

  public createCsvReport(events: Event[]): string {
    let dates = [];
    dates.push('date');
    events.forEach(event => {
      dates.push(this.format(event.startTimbrage.getMoment()));
      dates.push(this.format(event.endTimbrage.getMoment()));
    });
    return _.join(dates, '\r\n');
  }

  private format(date: Moment): string {
    return date.format('YYYY-MM-DD HH:mm');
  }
}
