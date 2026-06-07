import { inject, Injectable } from '@angular/core';
import { FirebaseCrashlytics } from '@awesome-cordova-plugins/firebase-crashlytics/ngx';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class LoggerServices {

  private readonly isProd = environment.production;
  private readonly firebase = inject(FirebaseCrashlytics)

  private crashlytics = this.firebase.initialise();

  debug(message: string, ...args: any[]): void {
    if (!this.isProd) console.debug(`[DEBUG] ${message}`, ...args);
  }

  info(message: string, ...args: any[]): void {
    if (!this.isProd) console.info(`[INFO] ${message}`, ...args);
    this.crashlytics.log(message);
  }

  warn(message: string, ...args: any[]): void {
    console.warn(`[WARN] ${message}`, ...args);
    this.crashlytics.log(`[WARN] ${message}`);
  }

  error(message: string, error?: unknown): void {
    console.error(`[ERROR] ${message}`, error);
    const detail = error instanceof Error ? error.message : String(error ?? '');
    this.crashlytics.logException(detail ? `${message}: ${detail}` : message);
  }
}