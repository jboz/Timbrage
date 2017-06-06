import { Moment } from 'moment';
import * as moment from 'moment';

export class Timbrage {
    // création de la date arrondie à la seconde
    date: string;

    constructor(date: string = moment().startOf('minute').format()) {
        this.date = date;
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
}