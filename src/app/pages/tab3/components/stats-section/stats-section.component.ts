import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircle, ellipsisHorizontalCircle, rocket } from 'ionicons/icons';

@Component({
  selector: 'app-stats-section',
  templateUrl: './stats-section.component.html',
  styleUrls: ['./stats-section.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon],
})
export class StatsSectionComponent {
  @Input() completedToday: number = 0;
  @Input() pendingToday: number = 0;
  @Input() completedEarly: number = 0;

  constructor() {
    addIcons({ checkmarkCircle, ellipsisHorizontalCircle, rocket });
  }
}
