import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonButton, ModalController, IonText 
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonButtons, IonButton, IonText
  ]
})
export class ConfirmationModalComponent {
  @Input() title: string = 'Confirmar';
  @Input() message: string = '¿Estás seguro de que deseas realizar esta acción?';
  @Input() confirmText: string = 'Confirmar';
  @Input() cancelText: string = 'Cancelar';

  private modalController = inject(ModalController);

  dismiss(confirmed: boolean) {
    this.modalController.dismiss(confirmed);
  }
}
