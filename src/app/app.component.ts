import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AppVersion } from '@ionic-native/app-version';

import { StorageProvider } from '../providers/storage/storage';

@Component({
  templateUrl: 'app.html',
  providers: [StorageProvider]
})
export class MyApp {
  rootPage: any = 'TabsPage';
  appName;
  packageName;
  versionNumber;
  versionCode;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen,
    public storageService: StorageProvider, private appVersion: AppVersion) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
    if (platform.is('cordova')) {
      appVersion.getAppName().then((appName) => {
        this.appName = appName;
      });
      appVersion.getPackageName().then((packageName) => {
        this.packageName = packageName;
      });
      appVersion.getVersionNumber().then((versionNumber) => {
        this.versionNumber = versionNumber;
      });
      appVersion.getVersionCode().then((versionCode) => {
        this.versionCode = versionCode;
      });
    }
  }

  resetDatabase(): void {
    this.storageService.reset().then(() => {
      // TODO add toast message
      console.info("reset done");
    });
  }
}
