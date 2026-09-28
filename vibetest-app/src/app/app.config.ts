import {
  APP_INITIALIZER,
  ApplicationConfig,
  inject,
  Injector,
  provideBrowserGlobalErrorListeners,
  isDevMode,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';

import { ThemeService } from './settings/theme.service';

function initializeTheme(themeService: ThemeService): () => Promise<void> {
  return () => themeService.initialize();
}

function initializeBundledCourses(): () => Promise<void> {
  const injector = inject(Injector);
  return async () => {
    try {
      const { BundledCoursesService } = await import(
        './courses/bundled/bundled-courses.service'
      );
      await injector.get(BundledCoursesService).syncOnStartup();
    } catch {
      /* startup must not fail if bundled sync fails or times out */
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: initializeTheme,
      deps: [ThemeService],
    },
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: initializeBundledCourses,
    },
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
