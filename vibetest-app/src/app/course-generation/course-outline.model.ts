import type { z } from 'zod';

import type { CourseOutlineSchema } from './generated/course-outline.zod';

/** Course plan for staged generation (Zod-inferred, aligned with `course-outline.schema.json`). */
export type CourseOutline = z.infer<typeof CourseOutlineSchema>;

export type CourseOutlineModule = CourseOutline['modules'][number];
export type CourseOutlineStep = CourseOutlineModule['steps'][number];
