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

import * as moment from 'moment';
import { Moment } from 'moment';

export class Timbrage {

  // création de la date arrondie à la minute
  constructor(public date: string = moment().startOf('minute').format(), public _id?: string, public _rev?: string) {
  }

  /**
   * @return la date au format Date.
   */
  public getDate(): Date {
    return new Date(this.date);
  }

  /**
   * @return la date au format Moment
   */
  public getMoment(): Moment {
    return moment(this.date);
  }

  /**
   * Compare two timbrage by their moment.
   */
  public compareTo(other: Timbrage): number {
    return this.getMoment().diff(other.getMoment());
  }

  public static from(baseDate: Date, hour: number = moment().hour(), minute: number = moment().minutes()): Timbrage {
    let dateTime = moment(baseDate);
    dateTime.set('hour', hour);
    dateTime.set('minute', minute);
    return new Timbrage(dateTime.format());
  }
}