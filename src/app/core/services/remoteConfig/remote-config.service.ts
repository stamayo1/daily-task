import { inject, Injectable, signal } from '@angular/core';
import { LoggerServices } from '../loggerServices/logger-services';
import { FirebaseX } from '@awesome-cordova-plugins/firebase-x/ngx';

@Injectable({
  providedIn: 'root'
})
export class RemoteConfigService {

  private readonly _logger = inject(LoggerServices);
  private readonly firebaseX = inject(FirebaseX);

  readonly showCategoryClassification = signal<boolean>(true);

  async init(): Promise<void> {
    this._logger.info('RemoteConfigService initializer is working...');
    await this.config();
    await this.fetchAndUpdate();
  }

  async fetchAndUpdate(): Promise<void> {
    try {

      const activated = await this.fetchAndActivate();

      if (activated) {
        this._logger.info('Remote Config value changed or first load');
        await this.loadShowCategoryClassification();
      }
    } catch (error) {
      this._logger.error('Error fetching remote config', error);
    }
  }

  private async loadShowCategoryClassification(): Promise<void> {
    const value = await this.getValue('show_category_classification');
    this._logger.info(`Remote Config loaded value for show_category_classification: ${value}`);

    this.showCategoryClassification.set(
      Boolean(value)
    );
  }

  private fetchAndActivate(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.firebaseX.fetchAndActivate(resolve, reject);
    });
  }

  private getValue(key: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.firebaseX.getValue(key).then((value) => {
        resolve(value);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  private config(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.firebaseX.setConfigSettings(1800, 0, resolve, reject);
    });
  }
}