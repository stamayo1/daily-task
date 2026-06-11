import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { SQLite } from '@awesome-cordova-plugins/sqlite/ngx';
import { FirebaseX } from '@awesome-cordova-plugins/firebase-x/ngx';
import { inject, provideAppInitializer } from '@angular/core';
import { AppInitializer } from './app/core/services/appInitializer/app-initializer';

const initializeFactory = () => async () => {
  const initConfig = inject(AppInitializer)
  await initConfig.init()
}

bootstrapApplication(AppComponent, {
  providers: [
    SQLite,
    FirebaseX,
    AppInitializer,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideAppInitializer(initializeFactory()),
  ],
});
