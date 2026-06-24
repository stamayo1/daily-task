import { inject, Injectable } from '@angular/core';
import { FirebaseX } from '@awesome-cordova-plugins/firebase-x/ngx';
import { AnalyticsPort } from '../../domain/repositories/analytics.port';
import { LoggerServices } from '../../services/loggerServices/logger-services';

@Injectable()
export class FirebaseAnalyticsAdapter implements AnalyticsPort {
  private readonly _firebase = inject(FirebaseX);
  private readonly _logger = inject(LoggerServices);

  async track(event: string, params: Record<string, unknown> = {}): Promise<void> {
    try {
      await this._firebase.logEvent(event, params);
    } catch (e) {
      this._logger.warn(`[Analytics] Failed to log event "${event}"`, e);
    }
  }
}
