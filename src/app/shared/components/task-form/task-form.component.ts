import { Component, inject, input, OnInit, output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  IonInput, IonTextarea, IonLabel,
  IonButton, IonIcon, IonChip, IonDatetime, IonDatetimeButton, IonModal,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, add, pencil } from 'ionicons/icons';

import { CategoryFacade } from 'src/app/core/application/facades/category.facade';
import { CategoryModalComponent } from '../category-modal/category-modal.component';
import { RemoteConfigService } from 'src/app/core/services/remoteConfig/remote-config.service';
import { Category } from 'src/app/core/domain/models/category.model';
import { TaskPriority } from 'src/app/core/domain/models/task.model';

export interface TaskFormValue {
  title: string;
  description: string;
  due_date: string;
  priority: TaskPriority;
  category_id: number | null;
}

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonInput, IonTextarea, IonLabel,
    IonButton, IonIcon, IonChip, IonDatetime, IonDatetimeButton, IonModal,
  ]
})
export class TaskFormComponent implements OnInit {

  initialValues = input<Partial<TaskFormValue>>({});
  submitLabel = input<string>('Guardar');
  datetimeId = input<string>('task-form-datetime');
  submitted = output<TaskFormValue>();

  readonly categoryFacade = inject(CategoryFacade);
  readonly remoteConfigService = inject(RemoteConfigService);
  private readonly _fb = inject(FormBuilder);
  private readonly _modalController = inject(ModalController);

  taskForm!: FormGroup;

  constructor() {
    addIcons({ calendarOutline, add, pencil });
  }

  ngOnInit(): void {
    this.categoryFacade.loadAll();
    this.initForm();
  }

  private initForm(): void {
    const init = this.initialValues();
    this.taskForm = this._fb.group({
      title: [init.title ?? '', Validators.required],
      description: [init.description ?? ''],
      due_date: [init.due_date ?? new Date().toISOString()],
      priority: [init.priority ?? 2, Validators.required],
      category_id: [init.category_id ?? null],
    });
  }

  setPriority(level: TaskPriority): void {
    this.taskForm.patchValue({ priority: level });
  }

  toggleCategory(id: number): void {
    const current = this.taskForm.get('category_id')?.value;
    this.taskForm.patchValue({ category_id: current === id ? null : id });
  }

  submit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }
    this.submitted.emit(this.taskForm.value as TaskFormValue);
  }

  async openCategoryModal(category?: Category): Promise<void> {
    const modal = await this._modalController.create({
      component: CategoryModalComponent,
      componentProps: { category }
    });

    await modal.present();
    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data?.name) {
      if (category) {
        await this.categoryFacade.update(category.id, data.name);
      } else {
        const id = await this.categoryFacade.create(data.name);
        this.taskForm.patchValue({ category_id: id });
      }
    } else if (role === 'delete' && category) {
      await this.categoryFacade.delete(category.id);
      if (this.taskForm.get('category_id')?.value === category.id) {
        this.taskForm.patchValue({ category_id: null });
      }
    }
  }
}
