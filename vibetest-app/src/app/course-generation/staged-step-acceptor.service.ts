import { Injectable, inject } from '@angular/core';

import { CourseImportService } from '../courses/course-import.service';
import { parseImportCourseDtoText } from '../courses/import-parse';

import { prepareLlmImportText } from './prepare-llm-import-text';
import type { AttemptInvalid, AttemptOutcome } from './run-with-retry';

export type ModelText = { readonly kind: 'text'; readonly text: string; readonly rawResponse: string };

export function invalidJson(message: string, rawResponse?: string): AttemptInvalid {
  return { kind: 'invalid', stage: 'json', issues: [{ path: 'json', message }], rawResponse };
}

/**
 * JSON text of a model answer (raw object or ```json fence).
 * `contextHint` is appended to "no JSON" / "truncated" problems; `null` for answers from an external chat.
 */
export function extractModelJson(
  rawResponse: string,
  contextHint?: string | null,
): ModelText | AttemptInvalid {
  try {
    return { kind: 'text', text: prepareLlmImportText(rawResponse, contextHint), rawResponse };
  } catch (err: unknown) {
    return invalidJson(
      err instanceof Error ? err.message : 'Не удалось извлечь JSON из ответа.',
      rawResponse,
    );
  }
}

/** Checks and saves the answer of a staged step; shared by LM Studio generation and the manual wizard. */
@Injectable({ providedIn: 'root' })
export class StagedStepAcceptor {
  private readonly importService = inject(CourseImportService);

  /** Stage 2: a course with exactly the first outline module; saved with new ids. Value: course id. */
  async acceptFirstModule(text: string, rawResponse: string): Promise<AttemptOutcome<string>> {
    const dto = parseImportCourseDtoText(text);
    if (!dto.ok) {
      return { kind: 'invalid', stage: dto.stage, issues: dto.issues, rawResponse };
    }
    if (dto.dto.modules.length !== 1) {
      return {
        kind: 'invalid',
        stage: 'semantic',
        issues: [
          {
            path: 'modules',
            message: `Нужен ровно один модуль (первый из плана), получено ${dto.dto.modules.length}.`,
          },
        ],
        rawResponse,
      };
    }

    try {
      const imported = await this.importService.importCourseWithNewIds(text, {
        validatePracticeSteps: false,
      });
      if (!imported.ok) {
        return { kind: 'invalid', stage: imported.stage, issues: imported.issues, rawResponse };
      }
      return { kind: 'ok', value: imported.courseId };
    } catch {
      return { kind: 'fatal', message: 'Не удалось сохранить курс.', rawResponse };
    }
  }

  /** Stage 3: one module appended to the end of `courseId`. Value: module id. */
  async acceptModule(
    text: string,
    courseId: string,
    rawResponse: string,
  ): Promise<AttemptOutcome<string>> {
    try {
      const imported = await this.importService.importModule(text, {
        courseId,
        validatePracticeSteps: false,
      });
      if (imported.ok) {
        return { kind: 'ok', value: imported.moduleId };
      }
      if (imported.stage === 'target') {
        return {
          kind: 'fatal',
          message: 'Курс не найден — возможно, он удалён. Начните генерацию заново.',
          rawResponse,
        };
      }
      return { kind: 'invalid', stage: imported.stage, issues: imported.issues, rawResponse };
    } catch {
      return { kind: 'fatal', message: 'Не удалось сохранить модуль.', rawResponse };
    }
  }
}
