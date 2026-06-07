import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-circular-progress',
  templateUrl: './circular-progress.component.html',
  styleUrls: ['./circular-progress.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class CircularProgressComponent {
  @Input() progress: number = 0;
  @Input() completed: number = 0;
  @Input() total: number = 0;
}
