import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { MyApp } from './app.component';
import { NgCalendarModule  } from 'ionic2-calendar';
// import { HttpModule } from '@angular/http';

import { TimbragesPage } from '../pages/timbrages/timbrages';
import { CalendarPage } from '../pages/calendar/calendar';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { MomentPipe } from '../pipes/moment/moment';
import { CalculationProvider } from '../providers/calculation/calculation';
import { StorageProvider } from '../providers/storage/storage';

@NgModule({
  declarations: [
    MyApp,
    TabsPage,
    TimbragesPage, CalendarPage,
    MomentPipe
  ],
  imports: [
    BrowserModule,
    NgCalendarModule,
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
    TabsPage,
    TimbragesPage, CalendarPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    CalculationProvider,
    StorageProvider
  ]
})
export class AppModule { }
