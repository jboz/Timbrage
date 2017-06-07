import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

import { Storage } from '@ionic/storage';

import { Moment } from 'moment';
import * as moment from 'moment';

import { Timbrage } from '../../model/Timbrage';

@Injectable()
export class StorageProvider {

  public static readonly COLLECTION_NAME = "timbrages";

  constructor(public storage: Storage) {
  }

  public save(date: Moment, timbrages: Array<Timbrage>): Promise<any> {
    return this.saveOnKey(this.getKey(date), timbrages);
  }

  private getKey(date: Moment): string {
    return date.format("YYYY-MM-DD");
  }

  public saveOnKey(key: string, timbrages: Array<Timbrage>): Promise<any> {
    return this.storage.ready().then(() => {
      let data = new Array();
      timbrages.forEach(timbrage => data.push(JSON.stringify(timbrage)));
      return this.storage.set(key, data);
    });
  }

  public find(start: Moment = moment(), end?: Moment): Promise<Array<Timbrage>> {
    start = start.clone().startOf("day");
    end = end ? end.clone().startOf("day") : start.clone();

    let promises = [];
    while (start.isSameOrBefore(end)) {
      promises.push(this.get(this.getKey(start)));
      start = start.add(1, 'day');
    }

    return Promise.all(promises).then((data) => {
      return data.reduce((a, b) => a.concat(b));
    });
  }

  private get(key: string): Promise<Array<Timbrage>> {
    return this.storage.get(key)
      .then((jsonData) => {
        if (jsonData) {
          return jsonData.map(JSON.parse).map(this.toModel);
        }
        return new Array();
      });
  }

  private toModel(r: any): Timbrage {
    return new Timbrage(r.date);
  }
}
