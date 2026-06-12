import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonInput, IonTextarea, IonLabel,
  IonButton, IonIcon, IonChip, IonDatetime, IonDatetimeButton, IonModal,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, add, checkmarkCircleOutline, pencil } from 'ionicons/icons';

import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { TaskService } from 'src/app/core/services/task/task.service';
import { CategoryService } from 'src/app/core/services/category/category.service';
import { CommonModule } from '@angular/common';
import { CategoryModalComponent } from 'src/app/shared/components/category-modal/category-modal.component';
import { Category } from 'src/app/core/models/category.model';
import { RemoteConfigService } from 'src/app/core/services/remoteConfig/remote-config.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonContent, IonInput, IonTextarea, IonLabel,
    IonButton, IonIcon, IonChip, IonDatetime, IonDatetimeButton, IonModal,
    HeaderComponent
  ]
})
export class Tab2Page implements OnInit {
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  public categoryService = inject(CategoryService);
  public remoteConfigService = inject(RemoteConfigService);
  private router = inject(Router);
  private modalController = inject(ModalController);

  taskForm!: FormGroup;

  // Icons array specifically for some typical categories if we have them by name, 
  // but usually we just use the icon if it comes from DB. For now, simple fallback.
  constructor() {
    addIcons({
      calendarOutline, add, checkmarkCircleOutline, pencil
    });
    this.initForm();
  }

  ngOnInit() {
    this.categoryService.loadAll();
  }

  private initForm() {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      due_date: [new Date().toISOString()],
      priority: [2, Validators.required], // 1=High, 2=Medium, 3=Low
      category_id: [null] // Not required
    });
  }

  setPriority(level: number) {
    this.taskForm.patchValue({ priority: level });
  }

  toggleCategory(id: number) {
    const current = this.taskForm.get('category_id')?.value;
    this.taskForm.patchValue({ category_id: current === id ? null : id });
  }

  async createTask() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const formValue = this.taskForm.value;

    await this.taskService.create({
      title: formValue.title,
      description: formValue.description,
      priority: formValue.priority,
      due_date: formValue.due_date,
      status: 'pending',
      category_id: formValue.category_id
    });

    this.taskForm.reset({
      priority: 2,
      due_date: new Date().toISOString()
    });

    // Go back to tasks list
    this.router.navigate(['/tabs/tab1']);
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
      await this.taskService.loadAll(); // Reload tasks so any affected task clears its category
      if (this.taskForm.get('category_id')?.value === category.id) {
        this.taskForm.patchValue({ category_id: null });
      }
    }
  }
}
