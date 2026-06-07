import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronDown } from 'ionicons/icons';

@Component({
  selector: 'app-weekly-chart',
  templateUrl: './weekly-chart.component.html',
  styleUrls: ['./weekly-chart.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon],
})
export class WeeklyChartComponent {
  @Input() weeklyData: { completed: number, total: number }[] = [];
  @Input() last7DaysLabels: string[] = [];

  constructor() {
    addIcons({ chevronDown });
  }
}
