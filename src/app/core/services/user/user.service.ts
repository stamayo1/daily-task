import { inject, Injectable, signal } from '@angular/core';
import { UserRepository } from '../../domain/repositories/user.repository';
import { LoggerServices } from '../loggerServices/logger-services';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly _repo = inject(UserRepository);
  private readonly _logger = inject(LoggerServices);

  readonly onboardingCompleted = signal<boolean>(false);

  async checkOnboarding(): Promise<void> {
    try {
      const user = await this._repo.findFirst();
      this.onboardingCompleted.set(user?.onboarding_check === 1);
      this._logger.info(`[UserService] onboarding_check = ${user?.onboarding_check}`);
    } catch (error) {
      this._logger.error('[UserService] Error checking onboarding status', error);
    }
  }

  async completeOnboarding(): Promise<void> {
    try {
      await this._repo.completeOnboarding();
      this.onboardingCompleted.set(true);
      this._logger.info('[UserService] Onboarding completed');
    } catch (error) {
      this._logger.error('[UserService] Error completing onboarding', error);
    }
  }
}
