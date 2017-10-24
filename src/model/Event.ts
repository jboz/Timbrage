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