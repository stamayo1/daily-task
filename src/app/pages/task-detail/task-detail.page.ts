import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent, IonInput, IonTextarea, IonLabel,
  IonButton, IonIcon, IonChip, IonDatetime, IonDatetimeButton, IonModal,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, add, checkmarkCircleOutline, pencil, trashOutline } from 'ionicons/icons';
import { CommonModule } from '@angular/common';

import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { TaskService } from 'src/app/core/services/task/task.service';
import { CategoryService } from 'src/app/core/services/category/category.service';
import { CategoryModalComponent } from 'src/app/shared/components/category-modal/category-modal.component';
import { Category } from 'src/app/core/models/category.model';
import { ConfirmationModalComponent } from 'src/app/shared/components/confirmation-modal/confirmation-modal.component';
import { RemoteConfigService } from 'src/app/core/services/remoteConfig/remote-config.service';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.page.html',
  styleUrls: ['./task-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonContent, IonInput, IonTextarea, IonLabel,
    IonButton, IonIcon, IonChip, IonDatetime, IonDatetimeButton, IonModal,
    HeaderComponent
  ]
})
export class TaskDetailPage implements OnInit {
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  public categoryService = inject(CategoryService);
  public remoteConfigService = inject(RemoteConfigService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private modalController = inject(ModalController);

  taskForm!: FormGroup;
  taskId!: number;

  constructor() {
    addIcons({
      calendarOutline, add, checkmarkCircleOutline, pencil, trashOutline
    });
    this.initForm();
  }

  ngOnInit() {
    this.categoryService.loadAll();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.taskId = parseInt(id, 10);
        this.loadTaskData();
      }
    });
  }

  private initForm() {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      due_date: [new Date().toISOString()],
      priority: [2, Validators.required],
      category_id: [null]
    });
  }

  private loadTaskData() {
    const task = this.taskService.getById(this.taskId);
    if (task) {
      this.taskForm.patchValue({
        title: task.title,
        description: task.description || '',
        due_date: task.due_date || new Date().toISOString(),
        priority: task.priority,
        category_id: task.category_id || null
      });
    } else {
      // If task not found, go back
      this.router.navigate(['/tabs/tab1']);
    }
  }

  setPriority(level: number) {
    this.taskForm.patchValue({ priority: level });
  }

  toggleCategory(id: number) {
    const current = this.taskForm.get('category_id')?.value;
    this.taskForm.patchValue({ category_id: current === id ? null : id });
  }

  async updateTask() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const formValue = this.taskForm.value;

    await this.taskService.update(this.taskId, {
      title: formValue.title,
      description: formValue.description,
      priority: formValue.priority,
      due_date: formValue.due_date,
      category_id: formValue.category_id
    });

    this.router.navigate(['/tabs/tab1']);
  }

  async promptDelete() {
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
      await this.taskService.delete(this.taskId);
      this.router.navigate(['/tabs/tab1']);
    }
  }

  async openCategoryModal(category?: Category) {
    const modal = await this.modalController.create({
      component: CategoryModalComponent,
      componentProps: { category }
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data?.name) {
      if (category) {
        await this.categoryService.update(category.id, data.name);
      } else {
        const id = await this.categoryService.create(data.name);
        this.taskForm.patchValue({ category_id: id });
      }
    } else if (role === 'delete' && category) {
      await this.categoryService.delete(category.id);
      await this.taskService.loadAll();
      if (this.taskForm.get('category_id')?.value === category.id) {
        this.taskForm.patchValue({ category_id: null });
      }
    }
  }
}
