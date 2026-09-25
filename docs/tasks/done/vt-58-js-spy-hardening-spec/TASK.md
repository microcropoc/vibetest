# vt-58 — spy hardening + SPEC caveats

## Цель

Hardening `registerSpy` (validate name/fn, non-writable `__vibetestGetCount`); уточнить SPEC (watchdog terminate, wall-clock checker, bag/reset/spy).

## DoD

- `javascript-practice-global.ts` + specs; SPEC точечно; `ng test --watch=false` зелёный.
