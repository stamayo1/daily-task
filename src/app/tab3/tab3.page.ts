import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from '../shared/components/header/header.component';
import { TaskService } from '../core/services/task/task.service';
import { CircularProgressComponent } from './components/circular-progress/circular-progress.component';
import { StatsSectionComponent } from './components/stats-section/stats-section.component';
import { WeeklyChartComponent } from './components/weekly-chart/weekly-chart.component';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    CommonModule, 
    IonContent, 
    HeaderComponent,
    CircularProgressComponent,
    StatsSectionComponent,
    WeeklyChartComponent
  ],
})
export class Tab3Page implements OnInit {
  private taskService = inject(TaskService);
  
  metrics = this.taskService.metrics;

  constructor() {}

  ngOnInit() {
    this.taskService.loadAll();
  }
}
