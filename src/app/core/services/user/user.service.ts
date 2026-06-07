import { inject, Injectable, signal } from '@angular/core';
import { User } from '../../models/user.model';
import { SqliteServices } from '../sqliteServices/sqlite-services';
import { LoggerServices } from '../loggerServices/logger-services';
import { SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { SqliteTableName } from '../sqliteServices/sqlite.migrations';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly _sqlite = inject(SqliteServices);
  private readonly _logger = inject(LoggerServices);

  readonly onboardingCompleted = signal<boolean>(false);

  private get db(): SQLiteObject {
    const db = this._sqlite.getDb();
    if (!db) throw new Error('[UserService] DB not available');
    return db;
  }

  async checkOnboarding(): Promise<void> {
    try {
      const result = await this.db.executeSql(
        `SELECT onboarding_check FROM ${SqliteTableName.users} LIMIT 1;`,
        []
      );

      if (result.rows.length > 0) {
        const user: User = result.rows.item(0);
        this.onboardingCompleted.set(user.onboarding_check === 1);
        this._logger.info(`[UserService] onboarding_check = ${user.onboarding_check}`);
      }
    } catch (error) {
      this._logger.error('[UserService] Error checking onboarding status', error);
    }
  }

  async completeOnboarding(): Promise<void> {
    try {
      await this.db.executeSql(
        `UPDATE ${SqliteTableName.users} SET onboarding_check = 1 WHERE id = 1;`,
        []
      );

      this.onboardingCompleted.set(true);
      this._logger.info('[UserService] Onboarding completed');
    } catch (error) {
      this._logger.error('[UserService] Error completing onboarding', error);
    }
  }
}
