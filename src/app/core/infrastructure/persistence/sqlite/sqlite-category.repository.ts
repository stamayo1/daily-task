import { inject, Injectable } from '@angular/core';
import { SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { CategoryRepository } from '../../../domain/repositories/category.repository';
import { Category } from '../../../domain/models/category.model';
import { SqliteServices } from '../../../services/sqliteServices/sqlite-services';
import { SqliteTableName } from '../../../services/sqliteServices/sqlite.migrations';


@Injectable()
export class SqliteCategoryRepository extends CategoryRepository {
  private readonly _sqlite = inject(SqliteServices);

  private get db(): SQLiteObject {
    const db = this._sqlite.getDb();
    if (!db) throw new Error('[SqliteCategoryRepository] DB not available');
    return db;
  }

  async findAll(): Promise<Category[]> {
    const result = await this.db.executeSql(
      `SELECT id, name, createdDate, updatedDate FROM ${SqliteTableName.categories} ORDER BY name ASC;`,
      []
    );

    const items: Category[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      items.push(result.rows.item(i) as Category);
    }
    return items;
  }

  async create(name: string): Promise<Category> {
    const now = new Date().toISOString();
    const result = await this.db.executeSql(
      `INSERT INTO ${SqliteTableName.categories} (name, createdDate, updatedDate) VALUES (?, ?, ?);`,
      [name, now, now]
    );

    return {
      id: result.insertId,
      name,
      createdDate: now,
      updatedDate: now,
    };
  }

  async update(id: number, name: string): Promise<void> {
    const now = new Date().toISOString();
    await this.db.executeSql(
      `UPDATE ${SqliteTableName.categories} SET name = ?, updatedDate = ? WHERE id = ?;`,
      [name, now, id]
    );
  }

  async delete(id: number): Promise<void> {
    await this.db.sqlBatch([
      [`UPDATE ${SqliteTableName.tasks} SET category_id = NULL WHERE category_id = ?;`, [id]],
      [`DELETE FROM ${SqliteTableName.categories} WHERE id = ?;`, [id]],
    ]);
  }
}
