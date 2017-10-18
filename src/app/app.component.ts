import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Globalization } from '@ionic-native/globalization';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser';

import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

import { defaultLanguage, availableLanguages } from './i18n.constants';
import { CalendarPage } from "../pages/calendar/calendar";

@Component({
  templateUrl: 'app.html',
  providers: [CalendarPage]
})
export class MyApp {
  rootPage: any = 'TabsPage';
  appName;
  packageName;
  versionNumber;
  versionCode;

  constructor(private platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, globalization: Globalization,
    public calendarCtrl: CalendarPage, public translate: TranslateService,
    private inAppBrowser: InAppBrowser) {
    this.setLang(defaultLanguage);

    platform.ready().then(() => {
      if ((<any>window).cordova) {
        globalization.getPreferredLanguage().then(result => {
          var language = this.getSuitableLanguage(result.value);
          this.setLang(language);
        });
      } else {
        let browserLanguage = translate.getBrowserLang() || defaultLanguage;
        var language = this.getSuitableLanguage(browserLanguage);
        this.setLang(language);
      }

      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
    // if (platform.is('cordova')) {
    //   appVersion.getAppName().then((appName) => {
    //     this.appName = appName;
    //   });
    //   appVersion.getPackageName().then((packageName) => {
    //     this.packageName = packageName;
    //   });
    //   appVersion.getVersionNumber().then((versionNumber) => {
    //     this.versionNumber = versionNumber;
    //   });
    //   appVersion.getVersionCode().then((versionCode) => {
    //     this.versionCode = versionCode;
    //   });
    // }
  }

  /**
   * Changement du type de vue.
   */
  changeMode(mode: string): void {
    this.calendarCtrl.changeMode(mode);
  }

  setLang(lang: string): void {
    this.translate.setDefaultLang(lang);
    moment.locale(lang);
  }

  getSuitableLanguage(language) {
    language = language.substring(0, 2).toLowerCase();
    return availableLanguages.some(x => x.code == language) ? language : defaultLanguage;
  }

  options: InAppBrowserOptions = {
    location: 'yes',//Or 'no' 
    hidden: 'no', //Or  'yes'
    clearcache: 'yes',
    clearsessioncache: 'yes',
    zoom: 'yes',//Android only ,shows browser zoom controls 
    hardwareback: 'yes',
    mediaPlaybackRequiresUserAction: 'no',
    shouldPauseOnSuspend: 'no', //Android only 
    closebuttoncaption: 'Close', //iOS only
    disallowoverscroll: 'no', //iOS only 
    toolbar: 'yes', //iOS only 
    enableViewportScale: 'no', //iOS only 
    allowInlineMediaPlayback: 'no',//iOS only 
    presentationstyle: 'pagesheet',//iOS only 
    fullscreen: 'yes',//Windows only    
  };

  openGithub(): void {
    this.inAppBrowser.create("https://github.com/jboz/timbrage", "_system", this.options);
  }
}
