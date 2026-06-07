import { Component, Input } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton]
})
export class HeaderComponent {
  @Input() title: string = 'Daily task';
  @Input() defaultGoBack: boolean = false;

}
