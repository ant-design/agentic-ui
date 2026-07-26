import { beforeEach, describe, expect, it } from 'vitest';
import { SchemaValidator } from '../validator';

/**
 * Real Ajv + schema.definition.json semantics.
 * validator.test.ts mocks Ajv for plumbing; these cases lock LowCodeSchema contracts.
 */
describe('SchemaValidator - LowCodeSchema semantics', () => {
  let validator: SchemaValidator;

  const minimalValidSchema = {
    version: '1.0.0',
    name: 'TestComponent',
    description: '测试组件',
    component: {
      type: 'html' as const,
      schema: '<div>姓名: {{name}}</div>',
      properties: {
        name: {
          type: 'string' as const,
          title: '姓名',
        },
      },
    },
  };

  beforeEach(() => {
    validator = new SchemaValidator();
  });

  it('接受符合规范的最小有效 schema', () => {
    const result = validator.validate(minimalValidSchema);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('接受 mustache 类型的 component', () => {
    const result = validator.validate({
      ...minimalValidSchema,
      component: {
        ...minimalValidSchema.component,
        type: 'mustache',
      },
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('allErrors 时收集多个缺失必填字段', () => {
    const result = validator.validate({});

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(4);

    const messages = result.errors.map((error) => error.message);
    expect(messages).toEqual(
      expect.arrayContaining([
        "must have required property 'version'",
        "must have required property 'name'",
        "must have required property 'description'",
        "must have required property 'component'",
      ]),
    );
  });

  it.each([
    [
      'version 不符合 semver 三段式',
      { ...minimalValidSchema, version: '1.0' },
      '/version',
      'must match pattern',
    ],
    [
      'component.type 不在枚举内',
      {
        ...minimalValidSchema,
        component: {
          ...minimalValidSchema.component,
          type: 'react',
        },
      },
      '/component/type',
      'must be equal to one of the allowed values',
    ],
    [
      'restAPI.baseURL 非 uri',
      {
        ...minimalValidSchema,
        dataSources: {
          restAPI: {
            baseURL: 'not-a-url',
          },
        },
      },
      '/dataSources/restAPI/baseURL',
      'must match format "uri"',
    ],
    [
      'theme.colorPalette.primary 非 #RRGGBB',
      {
        ...minimalValidSchema,
        theme: {
          colorPalette: {
            primary: '#fff',
          },
        },
      },
      '/theme/colorPalette/primary',
      'must match pattern',
    ],
    [
      'createTime 非 date-time',
      {
        ...minimalValidSchema,
        createTime: 'yesterday',
      },
      '/createTime',
      'must match format "date-time"',
    ],
  ] as const)('%s', (_title, data, expectedPath, messagePart) => {
    const result = validator.validate(data);

    expect(result.valid).toBe(false);
    expect(
      result.errors.some(
        (error) =>
          error.path === expectedPath && error.message.includes(messagePart),
      ),
    ).toBe(true);
  });

  it('接受合法 uri / 色值 / date-time 可选字段', () => {
    const result = validator.validate({
      ...minimalValidSchema,
      createTime: '2026-07-25T10:00:00.000Z',
      dataSources: {
        restAPI: {
          baseURL: 'https://api.example.com/v1',
        },
      },
      theme: {
        colorPalette: {
          primary: '#1677ff',
        },
      },
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
