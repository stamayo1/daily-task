import { inject, Injectable, signal } from '@angular/core';
import { Category } from '../../models/category.model';
import { SqliteServices } from '../sqliteServices/sqlite-services';
import { LoggerServices } from '../loggerServices/logger-services';
import { SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { SqliteTableName } from '../sqliteServices/sqlite.migrations';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly _sqlite = inject(SqliteServices);
  private readonly _logger = inject(LoggerServices);

  readonly categories = signal<Category[]>([]);

  private get db(): SQLiteObject {
    const db = this._sqlite.getDb();
    if (!db) throw new Error('[CategoryService] DB not available');
    return db;
  }

  async loadAll(): Promise<void> {
    try {
      const result = await this.db.executeSql(
        `SELECT id, name, createdDate, updatedDate FROM ${SqliteTableName.categories} ORDER BY name ASC;`,
        []
      );

      const items: Category[] = [];
      for (let i = 0; i < result.rows.length; i++) {
        items.push(result.rows.item(i) as Category);
      }

      this.categories.set(items);
      this._logger.info(`[CategoryService] Loaded ${items.length} categories`);
    } catch (error) {
      this._logger.error('[CategoryService] Error loading categories', error);
    }
  }

  getById(id: number): Category | undefined {
    return this.categories().find(c => c.id === id);
  }
}
