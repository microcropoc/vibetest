import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shared/ui/app-shell/app-shell').then((m) => m.AppShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'courses' },
      {
        path: 'courses',
        loadComponent: () =>
          import('./courses/pages/courses-page/courses-page').then((m) => m.CoursesPage),
      },
      {
        path: 'courses/:courseId/modules/:moduleId',
        loadComponent: () =>
          import('./player/pages/player-page/player-page').then((m) => m.PlayerPage),
      },
      {
        path: 'courses/:courseId',
        loadComponent: () =>
          import('./courses/pages/course-modules-page/course-modules-page').then(
            (m) => m.CourseModulesPage,
          ),
      },
      {
        path: 'statistics',
        loadComponent: () =>
          import('./statistics/pages/statistics-page/statistics-page').then(
            (m) => m.StatisticsPage,
          ),
      },
      {
        path: 'import',
        loadComponent: () =>
          import('./import/pages/import-page/import-page').then((m) => m.ImportPage),
      },
      {
        path: 'info',
        loadComponent: () =>
          import('./info/pages/info-page/info-page').then((m) => m.InfoPage),
      },
      {
        path: 'prompt-generation',
        loadComponent: () =>
          import('./prompt-generation/pages/prompt-generation-page/prompt-generation-page').then(
            (m) => m.PromptGenerationPage,
          ),
      },
    ],
  },
];
