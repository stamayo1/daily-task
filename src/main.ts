import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { SQLite } from '@awesome-cordova-plugins/sqlite/ngx';
import { FirebaseX } from '@awesome-cordova-plugins/firebase-x/ngx';
import { inject, provideAppInitializer } from '@angular/core';
import { AppInitializer } from './app/core/services/appInitializer/app-initializer';
import { TaskRepository } from './app/core/domain/repositories/task.repository';
import { CategoryRepository } from './app/core/domain/repositories/category.repository';
import { AnalyticsPort } from './app/core/domain/repositories/analytics.port';
import { SqliteTaskRepository } from './app/core/infrastructure/persistence/sqlite/sqlite-task.repository';
import { SqliteCategoryRepository } from './app/core/infrastructure/persistence/sqlite/sqlite-category.repository';
import { FirebaseAnalyticsAdapter } from './app/core/infrastructure/analytics/firebase-analytics.adapter';

const initializeFactory = () => async () => {
  const initConfig = inject(AppInitializer)
  await initConfig.init()
}

bootstrapApplication(AppComponent, {
  providers: [
    SQLite,
    FirebaseX,
    AppInitializer,
    { provide: TaskRepository, useClass: SqliteTaskRepository },
    { provide: CategoryRepository, useClass: SqliteCategoryRepository },
    { provide: AnalyticsPort, useClass: FirebaseAnalyticsAdapter },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideAppInitializer(initializeFactory()),
  ],
});
