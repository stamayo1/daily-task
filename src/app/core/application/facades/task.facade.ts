import { computed, inject, Injectable, signal } from '@angular/core';
import { Task, CreateTaskPayload, UpdateTaskPayload, TaskStatus } from '../../domain/models/task.model';
import { TaskRepository } from '../../domain/repositories/task.repository';
import { AnalyticsPort } from '../../domain/repositories/analytics.port';
import { LoggerServices } from '../../services/loggerServices/logger-services';
import { computeTaskMetrics } from '../../domain/use-cases/compute-task-metrics';
import { toggleTaskStatus } from '../../domain/use-cases/toggle-task-status';

@Injectable({ providedIn: 'root' })
export class TaskFacade {
  private readonly _repo = inject(TaskRepository);
  private readonly _analytics = inject(AnalyticsPort);
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

  readonly metrics = computed(() => computeTaskMetrics(this.tasks()));

  async loadAll(): Promise<void> {
    try {
      const items = await this._repo.findAll();
      this.tasks.set(items);
      this._logger.info(`[TaskFacade] Loaded ${items.length} tasks`);
    } catch (error) {
      this._logger.error('[TaskFacade] Error loading tasks', error);
    }
  }

  getById(id: number): Task | undefined {
    return this.tasks().find(t => t.id === id);
  }

  async create(payload: CreateTaskPayload): Promise<number> {
    const newTask = await this._repo.create(payload);
    this.tasks.update(current => [newTask, ...current]);
    this._logger.info(`[TaskFacade] Task created with ID ${newTask.id}`);

    await this._analytics.track('task_created', {
      title: payload.title,
      priority: payload.priority,
      category_id: payload.category_id ?? null
    });

    return newTask.id!;
  }

  async update(id: number, changes: UpdateTaskPayload): Promise<void> {
    if (Object.keys(changes).length === 0) return;

    await this._repo.update(id, changes);
    this.tasks.update(current =>
      current.map(t => t.id === id ? { ...t, ...changes } : t)
    );
    this._logger.info(`[TaskFacade] Task ID ${id} updated`);

    await this._analytics.track('task_updated', { task_id: id });
  }

  async toggleStatus(id: number): Promise<void> {
    const task = this.getById(id);
    if (!task) return;

    const { status, completed_at } = toggleTaskStatus(task);
    await this.update(id, { status, completed_at });
  }

  async delete(id: number): Promise<void> {
    await this._repo.delete(id);
    this.tasks.update(current => current.filter(t => t.id !== id));
    this._logger.info(`[TaskFacade] Task ID ${id} deleted`);

    await this._analytics.track('task_deleted', { task_id: id });
  }
}
