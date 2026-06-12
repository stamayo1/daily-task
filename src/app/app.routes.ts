import { Routes } from '@angular/router';
import { onboardingGuard } from './core/guards/onboarding.guard';
import { skipOnboardingGuard } from './core/guards/skip-onboarding.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/tabs/tabs.routes').then((m) => m.routes),
    canActivate: [onboardingGuard]
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./pages/onboarding/onboarding.page').then(m => m.OnboardingPage),
    canActivate: [skipOnboardingGuard]
  }
];
