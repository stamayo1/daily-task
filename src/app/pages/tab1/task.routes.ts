import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./tab1.page').then((m) => m.Tab1Page),
    },
    {
        path: ':id',
        loadComponent: () =>
            import('../task-detail/task-detail.page').then((m) => m.TaskDetailPage),
    }
];
