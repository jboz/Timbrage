import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

import { Storage } from '@ionic/storage';

import { Moment } from 'moment';
import * as moment from 'moment';

import * as PouchDB from 'pouchdb';
PouchDB.plugin(require('pouchdb-find'));

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
        console.info("index on field date " + result);
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

  public add(timbrage: Timbrage): Promise<Timbrage> {
    return this.db().then((db) => db.post(timbrage)).then(() => timbrage);
  }

  public update(timbrage: Timbrage): Promise<Timbrage> {
    return this.db().then((db) => db.put(timbrage)).then(() => timbrage);
  }

  public delete(timbrage: Timbrage): Promise<Timbrage> {
    return this.db().then((db) => db.remove(timbrage)).then(() => timbrage);
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
      .then((data) => data.rows.map((row) => this.toModel(row.doc)))
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
    return new Timbrage(doc.date, doc._id, doc._rev);
  }
}
