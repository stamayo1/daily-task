import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { UserService } from 'src/app/core/services/user/user.service';

/**
 * Route guard that redirects to /onboarding if the user hasn't completed it.
 * Protects main routes (e.g., tabs).
 */
export const onboardingGuard: CanActivateFn = () => {
  const router = inject(Router);
  const userService = inject(UserService);

  // Get the current value from the signal that indicates if onboarding is completed
  const isCompleted = userService.onboardingCompleted();

  if (isCompleted) {
    return true; // Allow access
  }

  // Redirect to onboarding if not completed
  return router.parseUrl('/onboarding');
};
