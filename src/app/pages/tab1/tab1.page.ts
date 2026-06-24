import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonContent, IonChip, IonLabel } from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { TaskCardComponent } from 'src/app/shared/components/task-card/task-card.component';
import { TaskFacade } from 'src/app/core/application/facades/task.facade';
import { CategoryFacade } from 'src/app/core/application/facades/category.facade';
import { Task } from 'src/app/core/domain/models/task.model';
import { getLocalDateString, toLocalDateString } from 'src/app/core/utils/date.utils';
import { RemoteConfigService } from 'src/app/core/services/remoteConfig/remote-config.service';
import { FormattedDatePipe } from 'src/app/shared/pipes/formatted-date.pipe';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonContent, HeaderComponent, TaskCardComponent, CommonModule, IonChip, IonLabel, FormattedDatePipe],
})
export class Tab1Page {
  taskFacade = inject(TaskFacade);
  categoryFacade = inject(CategoryFacade);
  remoteConfigService = inject(RemoteConfigService);
  private router = inject(Router);

  todayDate = new Date();

  statusFilter = signal<'all' | 'today' | 'pending' | 'completed'>('all');
  categoryFilter = signal<number | null>(null);

  filteredTasks = computed(() => {
    let tasks = this.taskFacade.tasks();
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

  pendingCount = this.taskFacade.pendingCount;


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
    return this.categoryFacade.getById(categoryId)?.name;
  }

  async onCompleteTask(task: Task) {
    await this.taskFacade.toggleStatus(task.id!);
  }

  goToDetail(task: Task) {
    this.router.navigate(['/tabs/tab1/', task.id]);
  }
}
