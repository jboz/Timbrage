// Copyright (C) 2017 Julien Boz
//
// This file is part of Focus IT - Timbrage.
//
// Focus IT - Timbrage is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Focus IT - Timbrage is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Focus IT - Timbrage.  If not, see <http://www.gnu.org/licenses/>.
//

import { ElementRef, Injectable } from "@angular/core";
import { File } from "@ionic-native/file";
import * as moment from "moment";
import { Moment } from "moment";
import _ from "lodash";
import { Event } from "../../model/Event";

@Injectable()
export class ReportingProvider {
  constructor(public fileSystem: File) {}

  public share(currentDate: Date, events: Event[], exportLink: ElementRef) {
    let month = moment(currentDate).format("YYYY-MM");
    let csv = this.createCsvReport(events);

    let blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = exportLink.nativeElement;
    link.href = url;
    link.download = `${month}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    // return this.createFile(`${month}.csv`, csv).then((path) => {
    // return this.social.share('Here are the times of the month', `Reporting of ${month}`, path);
    // });
  }

  public createFile(name: string, content: string): Promise<string> {
    return this.fileSystem
      .writeFile(this.fileSystem.dataDirectory, name, content, {
        replace: true
      })
      .then(() => {
        return `${this.fileSystem.dataDirectory}/${name}`;
      });
  }

  public createCsvReport(events: Event[]): string {
    let dates = [];
    dates.push("timbrages");
    events.forEach(event => {
      dates.push(ReportingProvider.format(event.startTimbrage.getMoment()));
      dates.push(ReportingProvider.format(event.endTimbrage.getMoment()));
    });
    return _.join(dates, "\r\n");
  }

  private static format(date: Moment): string {
    return date.format("YYYY-MM-DD HH:mm");
  }
}
