import { Injectable, inject } from '@angular/core';
import { FirebaseCrashlytics } from '@awesome-cordova-plugins/firebase-crashlytics/ngx';
import { environment } from 'src/environments/environment';
import { Platform } from '@ionic/angular/standalone';

@Injectable({ providedIn: 'root' })
export class LoggerServices {

  private readonly isProd = environment.production;
  private platform = inject(Platform);

  constructor(private firebase: FirebaseCrashlytics) {
    this.firebase.initialise();
  }

  debug(message: string, ...args: any[]): void {
    if (!this.isProd) console.debug(`[DEBUG] ${message}`, ...args);
  }

  info(message: string, ...args: any[]): void {
    if (!this.isProd) console.info(`[INFO] ${message}`, ...args);
    if (this.platform.is('cordova')) {
      this.firebase.log(message);
    }
  }

  warn(message: string, ...args: any[]): void {
    console.warn(`[WARN] ${message}`, ...args);
    if (this.platform.is('cordova')) {
      this.firebase.log(`[WARN] ${message}`);
    }
  }

  error(message: string, error?: unknown): void {
    console.error(`[ERROR] ${message}`, error);
    if (this.platform.is('cordova')) {
      const detail = error instanceof Error ? error.message : String(error ?? '');
      this.firebase.logException(detail ? `${message}: ${detail}` : message);
    }
  }
}