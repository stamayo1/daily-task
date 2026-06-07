import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { FirebaseCrashlytics } from '@awesome-cordova-plugins/firebase-crashlytics/ngx';
import { FirebaseAnalytics } from '@awesome-cordova-plugins/firebase-analytics/ngx';
import { SQLite } from '@awesome-cordova-plugins/sqlite/ngx';
import { FirebaseConfig } from '@awesome-cordova-plugins/firebase-config/ngx';
import { inject, provideAppInitializer } from '@angular/core';
import { AppInitializer } from './app/core/services/appInitializer/app-initializer';

const initializeFactory = () => async () => {
  const initConfig = inject(AppInitializer)
  await initConfig.init()
}

bootstrapApplication(AppComponent, {
  providers: [
    FirebaseCrashlytics,
    FirebaseAnalytics,
    SQLite,
    FirebaseConfig,
    AppInitializer,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideAppInitializer(initializeFactory()),
  ],
});
