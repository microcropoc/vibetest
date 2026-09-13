# vt-1 — Пустой шаблонный проект Angular

## Контекст

Репозиторий содержит спецификацию и правила разработки, но нет приложения. Нужна база для последующих задач (PWA, курсы, Dexie, player).

## Цель

В репозитории появляется сгенерированный через Angular CLI проект, который локально собирается и запускается: `ng serve`, `ng build`, `ng test` — без ошибок на дефолтном шаблоне.

## Требования

- Создать приложение командой из rule: `ng new vibetest-app --routing --style=scss` (CLI 22.x, LTS Node)
- Только standalone-комponentы (дефолт CLI для Angular 22); NgModules не добавлять
- Проект лежит в каталоге `vibetest-app/` в корне репозитория (рядом с `docs/`)
- Оставить стандартный welcome/routing scaffold без доменных фич vibetest
- Убедиться, что корневой `.gitignore` покрывает артефакты приложения (`node_modules/`, `dist/`, `.angular/` в `vibetest-app/` или через общие паттерны)
- README в корне репозитория не обязателен; при необходимости краткая заметка в `REPORT.md` задачи — как запустить (`cd vibetest-app && ng serve`)

## Технические заметки

- Читать `docs/SPECIFICATION.md` и `.cursor/rules/angular-cli.mdc` (раздел «Инициализация»)
- Не править `angular.json` / `tsconfig*.json` без необходимости
- Доменные папки (`courses/`, `player/`, …) — **не** создавать в этой задаче
- PWA (`ng add @angular/pwa`), Dexie, Workers — отдельные задачи

## TDD-план

- [ ] Для scaffold достаточно дефолтных тестов CLI; при добавлении своего кода — тесты по rule
- [ ] После генерации: `ng test` — зелёный (headless/CI-режим по возможности локально)
- [ ] `ng build` — успешная production-сборка

## Критерии готовности (Definition of Done)

- [ ] `vibetest-app/` создан через `ng new`, зависимости установлены
- [ ] `ng serve` открывает приложение без ошибок в консоли
- [ ] `ng build` и `ng test` проходят
- [ ] В репозитории нет секретов; `node_modules/` не коммитится
- [ ] `REPORT.md` заполнен по итогам (ветка `feature/vt-1-angular-scaffold`)

## Вне рамок задачи

- `@angular/pwa`, Service Worker, manifest
- Импорт курсов, IndexedDB / Dexie
- Доменная структура и экраны из спецификации
- Backend, auth, синхронизация
