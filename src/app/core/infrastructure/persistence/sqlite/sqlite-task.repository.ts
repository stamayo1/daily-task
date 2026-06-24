import { inject, Injectable } from '@angular/core';
import { SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { TaskRepository } from '../../../domain/repositories/task.repository';
import { Task, CreateTaskPayload, UpdateTaskPayload } from '../../../models/task.model';
import { SqliteServices } from '../../../services/sqliteServices/sqlite-services';
import { SqliteTableName } from '../../../services/sqliteServices/sqlite.migrations';

@Injectable()
export class SqliteTaskRepository extends TaskRepository {
  private readonly _sqlite = inject(SqliteServices);

  private get db(): SQLiteObject {
    const db = this._sqlite.getDb();
    if (!db) throw new Error('[SqliteTaskRepository] DB not available');
    return db;
  }

  async findAll(): Promise<Task[]> {
    const result = await this.db.executeSql(
      `SELECT id, title, description, priority, due_date, status,
              category_id, created_at, completed_at
       FROM ${SqliteTableName.tasks}
       ORDER BY
         CASE status WHEN 'pending' THEN 0 ELSE 1 END,
         CASE priority WHEN 1 THEN 0 WHEN 2 THEN 1 ELSE 2 END,
         created_at DESC;`,
      []
    );

    const items: Task[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      items.push(result.rows.item(i) as Task);
    }
    return items;
  }

  async create(payload: CreateTaskPayload): Promise<Task> {
    const now = new Date().toISOString();

    const result = await this.db.executeSql(
      `INSERT INTO ${SqliteTableName.tasks} (title, description, priority, due_date, status, category_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        payload.title,
        payload.description ?? null,
        payload.priority,
        payload.due_date ?? null,
        payload.status,
        payload.category_id ?? null,
        now,
      ]
    );

    return {
      ...payload,
      id: result.insertId,
      created_at: now,
    };
  }

  async update(id: number, changes: UpdateTaskPayload): Promise<void> {
    const fields = Object.keys(changes) as (keyof UpdateTaskPayload)[];
    if (fields.length === 0) return;

    const setClauses = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => (changes as Record<string, unknown>)[f]);

    await this.db.executeSql(
      `UPDATE ${SqliteTableName.tasks} SET ${setClauses} WHERE id = ?;`,
      [...values, id]
    );
  }

  async delete(id: number): Promise<void> {
    await this.db.executeSql(
      `DELETE FROM ${SqliteTableName.tasks} WHERE id = ?;`,
      [id]
    );
  }
}
