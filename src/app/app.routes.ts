import { Routes } from '@angular/router';
import { onboardingGuard } from './guards/onboarding.guard';
import { skipOnboardingGuard } from './guards/skip-onboarding.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
    canActivate: [onboardingGuard]
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./onboarding/onboarding.page').then(m => m.OnboardingPage),
    canActivate: [skipOnboardingGuard]
  }
];
