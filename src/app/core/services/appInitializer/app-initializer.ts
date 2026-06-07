import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SqliteServices } from '../sqliteServices/sqlite-services';
import { LoggerServices } from '../loggerServices/logger-services';
import { Platform } from '@ionic/angular/standalone';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root',
})
export class AppInitializer {

  private DB_NAME = environment.sqliteDatabaseName;
  private DB_LOCATION = environment.sqliteDatabaseLocation;
  private _sqlite = inject(SqliteServices);
  private _userService = inject(UserService);
  private _logger = inject(LoggerServices);
  private _platform = inject(Platform);

  async init(): Promise<void> {
    try {
      await this._platform.ready();

      this._logger.info('[AppInitializer] Dispositivo listo. Iniciando SQLite...');

      await this._sqlite.open(this.DB_NAME, this.DB_LOCATION);
      await this._userService.checkOnboarding();

      this._logger.info('[AppInitializer] Inicialización completada con éxito.');
    } catch (error) {
      const msg = error instanceof Error ? error.message : JSON.stringify(error);
      alert('Initialization error: ' + msg);
      this._logger.error('[AppInitializer] Error during initialization', error);
    }
  }

}
