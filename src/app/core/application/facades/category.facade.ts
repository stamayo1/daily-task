import { inject, Injectable, signal } from '@angular/core';
import { Category } from '../../models/category.model';
import { CategoryRepository } from '../../domain/repositories/category.repository';
import { AnalyticsPort } from '../../domain/repositories/analytics.port';
import { LoggerServices } from '../../services/loggerServices/logger-services';

@Injectable({ providedIn: 'root' })
export class CategoryFacade {
  private readonly _repo = inject(CategoryRepository);
  private readonly _analytics = inject(AnalyticsPort);
  private readonly _logger = inject(LoggerServices);

  readonly categories = signal<Category[]>([]);

  getById(id: number): Category | undefined {
    return this.categories().find(c => c.id === id);
  }

  async loadAll(): Promise<void> {
    try {
      const items = await this._repo.findAll();
      this.categories.set(items);
      this._logger.info(`[CategoryFacade] Loaded ${items.length} categories`);
    } catch (error) {
      this._logger.error('[CategoryFacade] Error loading categories', error);
    }
  }

  async create(name: string): Promise<number> {
    const newCategory = await this._repo.create(name);
    this.categories.update(current =>
      [...current, newCategory].sort((a, b) => a.name.localeCompare(b.name))
    );
    this._logger.info(`[CategoryFacade] Category created with ID ${newCategory.id}`);

    await this._analytics.track('category_created', { name });

    return newCategory.id;
  }

  async update(id: number, name: string): Promise<void> {
    await this._repo.update(id, name);

    const now = new Date().toISOString();
    this.categories.update(current =>
      current
        .map(c => c.id === id ? { ...c, name, updatedDate: now } : c)
        .sort((a, b) => a.name.localeCompare(b.name))
    );
    this._logger.info(`[CategoryFacade] Category ID ${id} updated`);
  }

  async delete(id: number): Promise<void> {
    try {
      await this._repo.delete(id);
      this.categories.update(current => current.filter(c => c.id !== id));
      this._logger.info(`[CategoryFacade] Category ID ${id} deleted`);

      await this._analytics.track('category_deleted', { id });
    } catch (error) {
      this._logger.error(`[CategoryFacade] Error deleting Category ID ${id}`, error);
      throw error;
    }
  }
}
