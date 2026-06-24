import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent, IonButton, IonIcon,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, trashOutline } from 'ionicons/icons';

import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { TaskFormComponent, TaskFormValue } from 'src/app/shared/components/task-form/task-form.component';
import { ConfirmationModalComponent } from 'src/app/shared/components/confirmation-modal/confirmation-modal.component';
import { TaskFacade } from 'src/app/core/application/facades/task.facade';
import { Task } from 'src/app/core/models/task.model';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.page.html',
  styleUrls: ['./task-detail.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonButton, IonIcon,
    HeaderComponent, TaskFormComponent
  ]
})
export class TaskDetailPage implements OnInit {
  private readonly taskFacade = inject(TaskFacade);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly modalController = inject(ModalController);

  taskId!: number;
  task: Task | undefined;

  constructor() {
    addIcons({ checkmarkCircleOutline, trashOutline });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.taskId = parseInt(id, 10);
        this.task = this.taskFacade.getById(this.taskId);
        if (!this.task) {
          this.router.navigate(['/tabs/tab1']);
        }
      }
    });
  }

  get initialValues(): Partial<TaskFormValue> {
    if (!this.task) return {};
    return {
      title: this.task.title,
      description: this.task.description ?? '',
      due_date: this.task.due_date ?? new Date().toISOString(),
      priority: this.task.priority,
      category_id: this.task.category_id ?? null,
    };
  }

  async onSubmit(value: TaskFormValue): Promise<void> {
    await this.taskFacade.update(this.taskId, {
      title: value.title,
      description: value.description,
      priority: value.priority,
      due_date: value.due_date,
      category_id: value.category_id
    });
    this.router.navigate(['/tabs/tab1']);
  }

  async promptDelete(): Promise<void> {
    const modal = await this.modalController.create({
      component: ConfirmationModalComponent,
      cssClass: 'auto-height-modal',
      initialBreakpoint: 0.5,
      breakpoints: [0, 0.5],
      componentProps: {
        title: 'Eliminar Tarea',
        message: '¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    await modal.present();
    const { data: confirmed } = await modal.onWillDismiss();

    if (confirmed) {
      await this.taskFacade.delete(this.taskId);
      this.router.navigate(['/tabs/tab1']);
    }
  }
}
