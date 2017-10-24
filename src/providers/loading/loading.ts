import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { LoadingController, Loading } from 'ionic-angular';
import { TranslateService } from "@ngx-translate/core";

@Injectable()
export class LoadingProvider {

  loader: Loading;

  constructor(private loadingCtrl: LoadingController, private translateService: TranslateService) {
  }

  private create(): Loading {
    this.loader = this.loadingCtrl.create({
      content: this.translateService.instant("loading.message")
    });
    return this.loader;
  }

  public present(): void {
    this.create().present();
  }

  public dismiss(): void {
    this.loader.dismiss();
  }
}
