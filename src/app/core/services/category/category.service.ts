import { inject, Injectable, signal } from '@angular/core';
import { Category } from '../../models/category.model';
import { SqliteServices } from '../sqliteServices/sqlite-services';
import { LoggerServices } from '../loggerServices/logger-services';
import { SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { SqliteTableName } from '../sqliteServices/sqlite.migrations';
import { FirebaseX } from '@awesome-cordova-plugins/firebase-x/ngx';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly _sqlite = inject(SqliteServices);
  private readonly _logger = inject(LoggerServices);
  private readonly _analytics = inject(FirebaseX);

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

  async create(name: string): Promise<number> {
    const now = new Date().toISOString();
    const result = await this.db.executeSql(
      `INSERT INTO ${SqliteTableName.categories} (name, createdDate, updatedDate) VALUES (?, ?, ?);`,
      [name, now, now]
    );

    const newCategory: Category = {
      id: result.insertId,
      name,
      createdDate: now,
      updatedDate: now,
    };

    this.categories.update(current => [...current, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
    this._logger.info(`[CategoryService] Category created with ID ${result.insertId}`);
    
    try {
      await this._analytics.logEvent('category_created', { name: name });
    } catch (e) {
      this._logger.warn('[Analytics] Failed to log category_created', e);
    }

    return result.insertId;
  }

  async update(id: number, name: string): Promise<void> {
    const now = new Date().toISOString();
    await this.db.executeSql(
      `UPDATE ${SqliteTableName.categories} SET name = ?, updatedDate = ? WHERE id = ?;`,
      [name, now, id]
    );

    this.categories.update(current =>
      current.map(c => c.id === id ? { ...c, name, updatedDate: now } : c).sort((a, b) => a.name.localeCompare(b.name))
    );
    this._logger.info(`[CategoryService] Category ID ${id} updated`);
  }

  async delete(id: number): Promise<void> {
    try {
      // Execute both queries in a single transaction
      await this.db.sqlBatch([
        [`UPDATE tasks SET category_id = NULL WHERE category_id = ?;`, [id]],
        [`DELETE FROM ${SqliteTableName.categories} WHERE id = ?;`, [id]]
      ]);

      // Update state
      this.categories.update(current => current.filter(c => c.id !== id));
      this._logger.info(`[CategoryService] Category ID ${id} deleted`);
      
      try {
        await this._analytics.logEvent('category_deleted', { id: id });
      } catch (e) {
        this._logger.warn('[Analytics] Failed to log category_deleted', e);
      }
    } catch (error) {
      this._logger.error(`[CategoryService] Error deleting Category ID ${id}`, error);
      throw error;
    }
  }
}
