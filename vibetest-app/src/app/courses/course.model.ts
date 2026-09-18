import type { z } from 'zod';

import { CourseSchema } from './course-zod-schema';

/** Domain course document (Zod-inferred, aligned with `course.schema.json`). */
export type Course = z.infer<typeof CourseSchema>;

export type Module = Course['modules'][number];
export type Step = Module['steps'][number];
