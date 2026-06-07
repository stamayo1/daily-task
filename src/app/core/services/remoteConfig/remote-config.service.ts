import { inject, Injectable, signal } from '@angular/core';
import { Platform } from '@ionic/angular/standalone';
import { FirebaseConfig } from '@awesome-cordova-plugins/firebase-config/ngx';
import { LoggerServices } from '../loggerServices/logger-services';

@Injectable({
  providedIn: 'root',
})
export class RemoteConfigService {
  private readonly _platform = inject(Platform);
  private readonly _firebaseConfig = inject(FirebaseConfig);
  private readonly _logger = inject(LoggerServices);

  readonly showCategoryClassification = signal<boolean>(true);

  async init(): Promise<void> {
    if (this._platform.is('cordova')) {
      try {
        this._logger.info('[RemoteConfig] Inicializando Remote Config...');
        
        // Fetch and activate remote configs
        await this._firebaseConfig.fetchAndActivate();
        
        // Get the value of show_category_clasification
        const value = await this._firebaseConfig.getBoolean('show_category_clasification');
        this.showCategoryClassification.set(value);
        
        this._logger.info(`[RemoteConfig] show_category_clasification obtenido: ${value}`);
      } catch (error) {
        this._logger.error('[RemoteConfig] Error al inicializar Remote Config', error);
      }
    } else {
      this._logger.info('[RemoteConfig] Plataforma no móvil. Usando valor por defecto (true)');
    }
  }
}
