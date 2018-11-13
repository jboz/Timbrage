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

import { Injectable } from "@angular/core";
import "rxjs/add/operator/map";

import { Storage } from "@ionic/storage";

import * as moment from "moment";
import { Moment } from "moment";

import PouchDB from "pouchdb";
import PouchFind from "pouchdb-find";
import { Timbrage } from "../../model/Timbrage";

PouchDB.plugin(PouchFind);

@Injectable()
export class StorageProvider {
  private _db;

  constructor(public storage: Storage) {}

  db(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this._db) {
        return resolve(this._db);
      }
      console.log("creating database connection...");
      const olddb = new PouchDB("timbrages.db", { adapter: "websql" });
      this._db = new PouchDB("timbrages.db", { adapter: "idb" });
      console.log("database connection created");
      olddb.replicate
        .to(this._db)
        .then(() => {
          olddb.destroy();
          console.log("database migration done !");
          return resolve(this._db);
        })
        .catch(reject);
    });
  }

  public reset(): Promise<any> {
    if (this._db) {
      return this._db.destroy().then(function () {
        console.log("database cleaned");
      });
    }
    return Promise.resolve().then(() => {
      console.log("no database to clean");
    });
  }

  public async saveSync(...timbrages: Timbrage[]): Promise<Timbrage[]> {
    let saved = await this.save(...timbrages);
    return saved;
  }

  public save(...timbrages: Timbrage[]): Promise<Timbrage[]> {
    return this.db()
      .then(db => {
        timbrages.forEach(timbrage => {
          if (timbrage._id) {
            db.put(timbrage);
          } else {
            db.post(timbrage);
          }
        });
      })
      .then(() => timbrages);
  }

  public delete(...timbrages: Timbrage[]): Promise<Timbrage[]> {
    return this.db()
      .then(db => {
        timbrages.forEach(timbrage => {
          if (timbrage._id) {
            db.remove(timbrage);
          }
        });
      })
      .then(() => timbrages);
  }

  public find(start: Moment = moment().startOf("day"), end?: Moment): Promise<Array<Timbrage>> {
    start = start.clone();
    end = end ? end.clone() : start.clone().endOf("day");
    // this.message(`find between ${start} and ${end}`);
    return this.db().then(db =>
      db
        .query(
          (doc, emit) => {
            let date = moment(doc.date);
            if (date.isSameOrAfter(start) && date.isBefore(end)) {
              emit(doc.date);
            }
          },
          {
            include_docs: true
          }
        )
        // create model from db data
        .then(data =>
          data.rows.map(row => this.toModel(row.doc)).filter(x => x)
        )
        // sort ascending
        // TODO sort in query options ?
        .then(timbrages => {
          return timbrages.sort((a, b) => {
            return a.compareTo(b);
          });
        })
    );
  }

  public findAll(): Promise<Array<Timbrage>> {
    return this.db()
      .then(db => db.allDocs({ include_docs: true }))
      .then(data => data.rows.map(row => this.toModel(row.doc)));
  }

  private toModel(doc: any): Timbrage {
    if (doc === undefined) {
      return null;
    }
    // _id and _rev are required to update/delete fields
    return new Timbrage(doc.date, doc._id, doc._rev);
  }
}
