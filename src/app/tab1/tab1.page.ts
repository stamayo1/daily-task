import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonContent, IonChip, IonLabel } from '@ionic/angular/standalone';
import { HeaderComponent } from '../shared/components/header/header.component';
import { TaskService } from '../core/services/task/task.service';
import { CategoryService } from '../core/services/category/category.service';
import { TaskCardComponent } from '../shared/components/task-card/task-card.component';
import { Task } from '../core/models/task.model';
import { getLocalDateString, toLocalDateString } from '../core/utils/date.utils';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonContent, HeaderComponent, TaskCardComponent, CommonModule, IonChip, IonLabel],
})
export class Tab1Page {
  taskService = inject(TaskService);
  categoryService = inject(CategoryService);
  private router = inject(Router);

  todayDate = new Date();

  statusFilter = signal<'all' | 'today' | 'pending' | 'completed'>('all');
  categoryFilter = signal<number | null>(null);

  filteredTasks = computed(() => {
    let tasks = this.taskService.tasks();
    const sFilter = this.statusFilter();
    const cFilter = this.categoryFilter();

    // 1. Filter by status/date
    if (sFilter === 'completed') {
      tasks = tasks.filter(t => t.status === 'done');
    } else if (sFilter === 'pending') {
      tasks = tasks.filter(t => t.status === 'pending');
    } else if (sFilter === 'today') {
      const todayStr = getLocalDateString();
      tasks = tasks.filter(t => t.due_date && toLocalDateString(t.due_date) === todayStr);
    }

    // 2. Filter by category
    if (cFilter !== null) {
      tasks = tasks.filter(t => t.category_id === cFilter);
    }

    return tasks;
  });

  pendingCount = computed(() => {
    return this.taskService.tasks().filter(t => t.status === 'pending').length;
  });

  get formattedDate(): string {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const str = this.todayDate.toLocaleDateString('es-ES', options);
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  setStatusFilter(filter: 'all' | 'today' | 'pending' | 'completed') {
    this.statusFilter.set(filter);
  }

  toggleCategoryFilter(categoryId: number) {
    if (this.categoryFilter() === categoryId) {
      this.categoryFilter.set(null); // deselect
    } else {
      this.categoryFilter.set(categoryId);
    }
  }

  getCategoryName(categoryId?: number | null): string | undefined {
    if (!categoryId) return undefined;
    const cat = this.categoryService.categories().find(c => c.id === categoryId);
    return cat?.name;
  }

  async onCompleteTask(task: Task) {
    await this.taskService.toggleStatus(task.id!);
  }

  goToDetail(task: Task) {
    this.router.navigate(['/tabs/tab1/', task.id]);
  }
}
