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

import { Moment, Duration } from 'moment';
import * as moment from 'moment';
import { Timbrage } from "./Timbrage";

export class Event {

    public startTime: Date;
    public endTime: Date;

    constructor(public title: string,
        public startTimbrage?: Timbrage,
        public endTimbrage?: Timbrage,
        public allDay = false) {

        this.startTime = !startTimbrage ? null : startTimbrage.getDate();
        this.endTime = !endTimbrage ? null : endTimbrage.getDate();
    }

    public getMoment() {
        return this.startTimbrage ? this.startTimbrage.getMoment() : this.endTimbrage.getMoment();
    }

    public duration(): Duration {
        return moment.duration(moment(this.endTime).diff(moment(this.startTime)));
    }

    static fromTimbrages(title: string, start: Timbrage, end: Timbrage) {
        return new this(title, start, end);
    }

    /**
     * create an event on all day.
     */
    static allDay(title: string, date: Moment): Event {
        let event = new this(title, null, null, true);
        event.startTime = date.startOf('day').add(1, 'second').toDate();
        event.endTime = date.endOf('day').toDate();
        return event;
    }
}