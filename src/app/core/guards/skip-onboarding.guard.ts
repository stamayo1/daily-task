import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { UserService } from 'src/app/core/services/user/user.service';

/**
 * Guard that prevents access to the onboarding page if the user has already completed it.
 */
export const skipOnboardingGuard: CanActivateFn = () => {
  const router = inject(Router);
  const userService = inject(UserService);

  const isCompleted = userService.onboardingCompleted();

  if (isCompleted) {
    return router.parseUrl('/'); // If already completed, go to home/tabs
  }

  return true; // Allow access to onboarding
};
