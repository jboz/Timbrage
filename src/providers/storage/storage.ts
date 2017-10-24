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

import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

import { Storage } from '@ionic/storage';

import { Moment } from 'moment';
import * as moment from 'moment';

import PouchDB from 'pouchdb';
import PouchFind from 'pouchdb-find';
PouchDB.plugin(PouchFind);

import { Timbrage } from '../../model/Timbrage';

@Injectable()
export class StorageProvider {
  private _db;

  constructor(public storage: Storage) {
  }

  db(): Promise<any> {
    if (!this._db) {
      console.log("creating database connection...");
      this._db = new PouchDB('timbrages.db', { adapter: 'websql' });
      console.log('database connection created');
      this._db.info().then(function (response) {
        console.info("db info: " + response.result);
      });
      this._db.createIndex({
        index: {
          fields: ['date']
        }
      }).then(function (result) {
        console.info("index on field date " + JSON.stringify(result));
      });
    }
    return Promise.resolve(this._db);
  }

  public reset(): Promise<any> {
    if (this._db) {
      return this._db.destroy().then(function () {
        console.log('database cleaned');
      });
    }
    return Promise.resolve().then(() => {
      console.log('no database to clean');
    });
  }

  // ex: return this.parallelize(timbrages, (db) => db.post(timbrages));
  // private parallelize(timbrages: Timbrage[], promise: (db: any) => any) {
  //   return this.db().then((db) => {
  //     let promises = [];
  //     timbrages.forEach((timbrage) => {
  //       promises.push(promise(db));
  //     });

  //     return Promise.all(promises);
  //   });
  // }

  public async saveSync(...timbrages: Timbrage[]): Promise<Timbrage[]> {
    let saved = await this.save(...timbrages);
    return saved;
  }

  public save(...timbrages: Timbrage[]): Promise<Timbrage[]> {
    return this.db().then((db) => {
      timbrages.forEach(timbrage => {
        if (timbrage._id) {
          db.put(timbrage)
        } else {
          db.post(timbrage)
        }
      });
    }).then(() => timbrages);
  }

  public delete(...timbrages: Timbrage[]): Promise<Timbrage[]> {
    return this.db().then((db) => {
      timbrages.forEach(timbrage => {
        if (timbrage._id) {
          db.remove(timbrage)
        }
      });
    }).then(() => timbrages);
  }

  public find(start: Moment = moment(), end?: Moment): Promise<Array<Timbrage>> {
    start = start.clone().startOf("day");
    end = end ? end.clone().startOf("day") : start.clone().add(1, 'day');

    return this.db().then((db) => db.query(function (doc, emit) {
      let date = moment(doc.date);
      if (date.isSameOrAfter(start) && date.isBefore(end)) {
        emit(doc.date);
      }
    }, {
        include_docs: true
      })
      // create model from db data
      .then((data) => data.rows.map((row) => this.toModel(row.doc)).filter(x => x))
      // sort ascending
      // TODO sort in query options ?
      .then((timbrages) => {
        return timbrages.sort((a, b) => {
          return a.compareTo(b);
        });
      }));
  }

  public findAll(): Promise<Array<Timbrage>> {
    return this.db().then((db) => db.allDocs({ include_docs: true }))
      .then((data) => data.rows.map((row) => this.toModel(row.doc)));
  }

  private toModel(doc: any): Timbrage {
    if (doc === undefined) {
      return null;
    }
    // _id and _rev are required to update/delete fields
    return new Timbrage(doc.date, doc._id, doc._rev);
  }
}
