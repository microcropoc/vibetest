import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AppShell } from './app-shell';

@Component({ template: '' })
class StubPage {}

describe('AppShell', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShell],
      providers: [
        provideRouter([
          {
            path: '',
            component: AppShell,
            children: [
              { path: 'courses', component: StubPage },
              { path: 'import', component: StubPage },
            ],
          },
        ]),
      ],
    }).compileComponents();
  });

  it('renders primary navigation tabs', async () => {
    const fixture = TestBed.createComponent(AppShell);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Курсы');
    expect(compiled.textContent).toContain('Статистика');
    expect(compiled.textContent).toContain('Импорт');
    expect(compiled.textContent).toContain('Инфо');
  });

  it('navigates when a tab link is clicked', async () => {
    const fixture = TestBed.createComponent(AppShell);
    await fixture.whenStable();
    const router = TestBed.inject(Router);
    const importLink = fixture.nativeElement.querySelector(
      'a[href="/import"]',
    ) as HTMLAnchorElement | null;
    importLink?.click();
    await fixture.whenStable();
    expect(router.url).toContain('/import');
  });
});
