export class Timbrage {
    date: string = new Date().toISOString();

    constructor() {
    }

    public getDate(): Date {
        return new Date(this.date);
    }
}