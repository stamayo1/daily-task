import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./tab1.page').then((m) => m.Tab1Page),
    }
];
