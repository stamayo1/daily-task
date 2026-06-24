import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';

import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { TaskFormComponent, TaskFormValue } from 'src/app/shared/components/task-form/task-form.component';
import { TaskFacade } from 'src/app/core/application/facades/task.facade';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, IonIcon, HeaderComponent, TaskFormComponent]
})
export class Tab2Page {
  private readonly taskFacade = inject(TaskFacade);
  private readonly router = inject(Router);

  constructor() {
    addIcons({ checkmarkCircleOutline });
  }

  async onSubmit(value: TaskFormValue): Promise<void> {
    await this.taskFacade.create({
      title: value.title,
      description: value.description,
      priority: value.priority,
      due_date: value.due_date,
      status: 'pending',
      category_id: value.category_id
    });
    this.router.navigate(['/tabs/tab1']);
  }
}
