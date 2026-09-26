type JsonSchema = Record<string, unknown>;

export function buildModuleImportSchemaFromCourseImport(src: JsonSchema): JsonSchema {
  const defs = { ...(src['$defs'] as Record<string, JsonSchema>) };
  const moduleDef = defs['module'];
  if (!moduleDef) {
    throw new Error('course-import.schema.json missing $defs/module');
  }
  delete defs['module'];

  const moduleProps = moduleDef['properties'] as Record<string, JsonSchema>;

  return {
    $schema: src['$schema'],
    $id: 'https://vibetest.app/schemas/module-import.schema.json',
    title: 'VibeTest Module Import',
    description:
      'Import-DTO одного модуля для добавления в конец существующего курса: без moduleId и stepId (их назначает приложение). schemaVersion всегда 1. Смысл полей шагов — в description у свойств и $defs; не выдумывай семантику вне схемы.',
    type: 'object',
    required: ['schemaVersion', 'title', 'steps'],
    additionalProperties: false,
    properties: {
      schemaVersion: {
        const: 1,
        description: 'Версия формата документа. Для текущих модулей всегда 1.',
      },
      title: {
        ...(moduleProps['title'] as JsonSchema),
        description: 'Название модуля (отображается в списке модулей курса).',
      },
      steps: moduleProps['steps'],
    },
    $defs: defs,
  };
}
