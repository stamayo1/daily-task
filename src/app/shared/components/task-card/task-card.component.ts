import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { ellipsisVertical, timeOutline, calendarOutline, locationOutline } from 'ionicons/icons';
import { Task, PRIORITY_LABELS, PRIORITY_COLORS } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon, DatePipe]
})
export class TaskCardComponent {
  @Input() task!: Task;
  @Input() categoryName?: string;
  
  @Output() completeTask = new EventEmitter<Task>();
  @Output() optionsClicked = new EventEmitter<Task>();

  constructor() {
    addIcons({ ellipsisVertical, timeOutline, calendarOutline, locationOutline });
  }

  get priorityLabel(): string {
    return PRIORITY_LABELS[this.task.priority] || 'N/A';
  }

  get priorityColor(): string {
    return PRIORITY_COLORS[this.task.priority] || 'medium';
  }

  onCompleteTask(event: Event) {
    event.stopPropagation();
    this.completeTask.emit(this.task);
  }

  onOptions(event: Event) {
    event.stopPropagation();
    this.optionsClicked.emit(this.task);
  }
}
