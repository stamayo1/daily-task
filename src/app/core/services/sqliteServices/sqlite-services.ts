import { inject, Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { SQLiteDatabaseConfig } from '@awesome-cordova-plugins/sqlite';
import { DbUpgradeVersion, SqliteMigrations } from './sqlite.migrations';
import { LoggerServices } from '../loggerServices/logger-services';

@Injectable({
  providedIn: 'root',
})
export class SqliteServices {

  private db?: SQLiteObject;
  private upgrades: DbUpgradeVersion[] = SqliteMigrations;
  private dbName!: string;
  private dbLocation!: string;
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY_MS = 100;

  sqlite = inject(SQLite);
  logger = inject(LoggerServices);

  /**
   * @description This method is used to open the database connection for external call 
   * @param dbName Database name.
   * @param dbLocation Database location.
   */
  async open(dbName: string, dbLocation: string): Promise<void> {
    this.dbName = dbName;
    this.dbLocation = dbLocation;
    await this.ensureOpen();
  }

  /**
   * @description This method is used to open the database connection and apply migrations.
   */
  private async openConnection(): Promise<void> {
    if (this.db) return;

    const sqliteDatabaseConfig: SQLiteDatabaseConfig = { name: this.dbName, location: this.dbLocation };
    this.db = await this.sqlite.create(sqliteDatabaseConfig);
    await this.enableForeignKeys();
    await this.applyMigrations();
    this.logger.info(`[SQLite] Connection ready to ${this.dbName}`);
  }

  private async enableForeignKeys(): Promise<void> {
    await this.db!.executeSql('PRAGMA foreign_keys = ON;', []);
  }

  /**
   * Ensure database connection is open.
   */
  async ensureOpen(): Promise<void> {
    if (!this.db) {
      await this.openWithRetry();
      return;
    }

    try {
      await this.ping();
    } catch {
      this.logger.warn('Connection not responding, reopening...');
      this.db = undefined;
      await this.openWithRetry();
    }
  }

  /**
   * @description This method is used to open the database connection and apply migrations with retry logic.
   */
  private async openWithRetry(): Promise<void> {
    let lastError: any;

    for (let attempt = 1; attempt <= SqliteServices.MAX_RETRIES; attempt++) {
      try {
        await this.openConnection();
        return;
      } catch (error) {
        lastError = error;
        this.logger.warn(`Attempt ${attempt}/${SqliteServices.MAX_RETRIES} failed:`, error);
        if (attempt < SqliteServices.MAX_RETRIES) {
          await this.delay(SqliteServices.RETRY_DELAY_MS * attempt);
        }
      }
    }

    throw new Error(`[SQLite] Could not open DB after ${SqliteServices.MAX_RETRIES} attempts: ${lastError}`);
  }

  /**
   * Apply database migrations.
   */
  private async applyMigrations(): Promise<void> {
    await this.createVersionTable();

    const applied = await this.getAppliedVersions();
    const appliedSet = new Set(applied);
    const pending = this.upgrades.filter(u => !appliedSet.has(u.toVersion));

    if (!pending.length) {
      this.logger.info('[SQLite] No pending migrations');
      return;
    }

    for (const upgrade of pending) {
      await this.applyUpgrade(upgrade);
    }
  }

  /**
   * Create database version table.
   */
  private async createVersionTable(): Promise<void> {
    await this.db!.executeSql(
      `CREATE TABLE IF NOT EXISTS _db_version (
        version    INTEGER PRIMARY KEY,
        applied_at TEXT DEFAULT (datetime('now'))
      );`,
      [],
    );
  }

  /**
   * Get applied database versions.
   * @returns Array of applied versions.
   */
  private async getAppliedVersions(): Promise<number[]> {
    const result = await this.db!.executeSql(
      'SELECT version FROM _db_version ORDER BY version ASC;', [],
    );
    const versions: number[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      versions.push(result.rows.item(i).version);
    }
    return versions;
  }


  private async applyUpgrade(upgrade: DbUpgradeVersion): Promise<void> {
    this.logger.info(`[SQLite] Applying migration v${upgrade.toVersion}…`);
    await this.db!.sqlBatch([
      ...upgrade.statements,
      ['INSERT INTO _db_version (version) VALUES (?);', [upgrade.toVersion]],
    ]);
    this.logger.info(`[SQLite] Migration v${upgrade.toVersion} applied`);
  }

  private async ping(): Promise<void> {
    await this.db!.executeSql('SELECT 1;', []);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}
