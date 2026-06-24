import { inject, Injectable } from '@angular/core';
import { SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { User } from '../../../models/user.model';
import { SqliteServices } from '../../../services/sqliteServices/sqlite-services';
import { SqliteTableName } from '../../../services/sqliteServices/sqlite.migrations';

@Injectable()
export class SqliteUserRepository extends UserRepository {
  private readonly _sqlite = inject(SqliteServices);

  private get db(): SQLiteObject {
    const db = this._sqlite.getDb();
    if (!db) throw new Error('[SqliteUserRepository] DB not available');
    return db;
  }

  async findFirst(): Promise<User | null> {
    const result = await this.db.executeSql(
      `SELECT id, onboarding_check FROM ${SqliteTableName.users} LIMIT 1;`,
      []
    );

    if (result.rows.length === 0) return null;
    return result.rows.item(0) as User;
  }

  async completeOnboarding(): Promise<void> {
    await this.db.executeSql(
      `UPDATE ${SqliteTableName.users} SET onboarding_check = 1 WHERE id = 1;`,
      []
    );
  }
}
