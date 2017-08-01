import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { MyApp } from './app.component';
// import { HttpModule } from '@angular/http';

import { AppVersion } from '@ionic-native/app-version';
import { SocialSharing } from '@ionic-native/social-sharing';
import { File } from '@ionic-native/file';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { CalculationProvider } from '../providers/calculation/calculation';
import { StorageProvider } from '../providers/storage/storage';
import { ReportingProvider } from '../providers/reporting/reporting';

@NgModule({
  declarations: [
    MyApp,
  ],
  imports: [
    BrowserModule,
    // HttpModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot({
      name: '__timbrageDb',
      driverOrder: ['sqlite', 'indexeddb', 'websql']
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    AppVersion, SocialSharing, File,
    CalculationProvider, StorageProvider,
    ReportingProvider
  ]
})
export class AppModule { }
