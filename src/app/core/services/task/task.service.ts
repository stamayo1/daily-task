import { computed, inject, Injectable, signal } from '@angular/core';
import { Task, CreateTaskPayload, UpdateTaskPayload, TaskStatus } from '../../models/task.model';
import { SqliteServices } from '../sqliteServices/sqlite-services';
import { LoggerServices } from '../loggerServices/logger-services';
import { SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { SqliteTableName } from '../sqliteServices/sqlite.migrations';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly _sqlite = inject(SqliteServices);
  private readonly _logger = inject(LoggerServices);

  readonly tasks = signal<Task[]>([]);
  readonly searchQuery = signal<string>('');
  readonly selectedCategoryId = signal<number | null>(null);
  readonly selectedStatus = signal<TaskStatus | null>(null);

  readonly filteredTasks = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const categoryId = this.selectedCategoryId();
    const status = this.selectedStatus();

    return this.tasks().filter(task => {
      const matchesQuery = !query || task.title.toLowerCase().includes(query)
        || (task.description ?? '').toLowerCase().includes(query);
      const matchesCategory = categoryId === null || task.category_id === categoryId;
      const matchesStatus = status === null || task.status === status;
      return matchesQuery && matchesCategory && matchesStatus;
    });
  });

  readonly totalCount = computed(() => this.tasks().length);

  readonly completedCount = computed(() =>
    this.tasks().filter(t => t.status === 'done').length
  );

  readonly pendingCount = computed(() =>
    this.tasks().filter(t => t.status === 'pending').length
  );

  readonly completionPercentage = computed(() => {
    const total = this.totalCount();
    return total === 0 ? 0 : Math.round((this.completedCount() / total) * 100);
  });

  readonly recentlyCompleted = computed(() =>
    this.tasks()
      .filter(t => t.status === 'done' && t.completed_at)
      .sort((a, b) => (b.completed_at ?? '').localeCompare(a.completed_at ?? ''))
      .slice(0, 5)
  );

  private get db(): SQLiteObject {
    const db = this._sqlite.getDb();
    if (!db) throw new Error('[TaskService] DB not available');
    return db;
  }

  async loadAll(): Promise<void> {
    try {
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

      this.tasks.set(items);
      this._logger.info(`[TaskService] Loaded ${items.length} tasks`);
    } catch (error) {
      this._logger.error('[TaskService] Error loading tasks', error);
    }
  }

  getById(id: number): Task | undefined {
    return this.tasks().find(t => t.id === id);
  }

  async create(payload: CreateTaskPayload): Promise<number> {
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

    const newTask: Task = {
      ...payload,
      id: result.insertId,
      created_at: now,
    };

    this.tasks.update(current => [newTask, ...current]);
    this._logger.info(`[TaskService] Task created with ID ${result.insertId}`);

    return result.insertId;
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

    this.tasks.update(current =>
      current.map(t => t.id === id ? { ...t, ...changes } : t)
    );

    this._logger.info(`[TaskService] Task ID ${id} updated`);
  }

  async toggleStatus(id: number): Promise<void> {
    const task = this.getById(id);
    if (!task) return;

    const newStatus: TaskStatus = task.status === 'pending' ? 'done' : 'pending';
    const completedAt = newStatus === 'done' ? new Date().toISOString() : null;

    await this.update(id, {
      status: newStatus,
      completed_at: completedAt ?? undefined,
    });
  }

  async delete(id: number): Promise<void> {
    await this.db.executeSql(`DELETE FROM ${SqliteTableName.tasks} WHERE id = ?;`, [id]);

    this.tasks.update(current => current.filter(t => t.id !== id));
    this._logger.info(`[TaskService] Task ID ${id} deleted`);
  }
}
