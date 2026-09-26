import { importDtoToModule } from './import-dto-to-module';
import type { ImportModuleDocument } from './import-course-zod-schema';

describe('importDtoToModule', () => {
  it('assigns moduleId and stepIds', () => {
    const dto: ImportModuleDocument = {
      schemaVersion: 1,
      title: 'New module',
      steps: [
        {
          type: 'theory',
          title: 'T',
          content: 'Body',
        },
      ],
    };

    const ids = [
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    ];
    let index = 0;
    const module = importDtoToModule(dto, {
      randomUuid: () => {
        const id = ids[index];
        index += 1;
        return id ?? ids[0]!;
      },
    });

    expect(module.moduleId).toBe('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
    expect(module.title).toBe('New module');
    expect(module.steps[0]?.stepId).toBe('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
  });
});
