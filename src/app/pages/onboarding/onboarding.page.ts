import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, trendingUpOutline, arrowForward, checkmark } from 'ionicons/icons';
import { UserService } from 'src/app/core/services/user/user.service';


@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, IonIcon]
})
export class OnboardingPage {
  private router = inject(Router);
  private userService = inject(UserService);

  constructor() {
    addIcons({ checkmarkCircleOutline, trendingUpOutline, arrowForward, checkmark });
  }

  /**
   * Completes the onboarding process, marks the user in the database
   * as onboarding_check = 1, and redirects to the main screen.
   */
  async getStarted() {
    await this.userService.completeOnboarding();
    // Replace the URL so they can't go back using the device back button
    this.router.navigate(['/'], { replaceUrl: true });
  }
}
