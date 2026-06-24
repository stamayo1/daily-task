import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonButton, IonInput, IonItem, IonLabel,
  ModalController
} from '@ionic/angular/standalone';
import { Category } from '../../../core/domain/models/category.model';

@Component({
  selector: 'app-category-modal',
  templateUrl: './category-modal.component.html',
  styleUrls: ['./category-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonButton, IonInput, IonItem, IonLabel
  ]
})
export class CategoryModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private modalController = inject(ModalController);

  @Input() category?: Category;

  categoryForm: FormGroup;

  constructor() {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit() {
    if (this.category) {
      this.categoryForm.patchValue({ name: this.category.name });
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }

  save() {
    if (this.categoryForm.valid) {
      this.modalController.dismiss(this.categoryForm.value, 'confirm');
    } else {
      this.categoryForm.markAllAsTouched();
    }
  }

  deleteCategory() {
    this.modalController.dismiss(this.category, 'delete');
  }
}
