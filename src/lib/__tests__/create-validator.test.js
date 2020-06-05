import { duckType } from '../checkers.js';
import createValidator from '../create-validator.js';

const mockTypes = {
  '[object TypeOne]': {
    type: '[object TypeOne]',
    definition: {
      id: '[object Number]',
      name: '[object String]',
      data: '[object Object]',
    },
  },
  '[object TypeTwo]': {
    type: '[object TypeTwo]',
    definition: {
      id: '[object Number]',
      name: '[object String]',
      data: '[object Array]',
    },
  },
};

describe('createValidator', () => {
  it('should create a validator function based on a collection of registered types', () => {
    const validator = createValidator(mockTypes);
    const typeOne = '[object TypeOne]';
    const typeTwo = '[object TypeTwo]';
    const typeOneVal = { id: 1, name: 'one', data: {} };
    const typeTwoVal = { id: 2, name: 'two', data: [] };
    const expectedFailed = [];
    const validateTypeOne = validator(typeOne);
    const validateTypeTwo = validator(typeTwo);
    const [validatedTypeOne, failedOne] = validateTypeOne(typeOneVal);
    const [validatedTypeTwo, failedTwo] = validateTypeTwo(typeTwoVal);

    expect(validatedTypeOne).toBe(true);
    expect(validatedTypeTwo).toBe(true);
    expect(failedOne).toEqual(expectedFailed);
    expect(failedTwo).toEqual(expectedFailed);
  });

  describe('validator', () => {
    describe('primitive types', () => {
      const primitiveTypes = {
        '[object Number]': { passValue: 2, failValue: '2' },
        '[object String]': { passValue: '2', failValue: 2 },
        '[object Date]': { passValue: new Date(), failValue: '2012-12-12' },
        '[object Array]': { passValue: [1, 2], failValue: {} },
        '[object Boolean]': { passValue: true, failValue: 'false' },
        '[object Null]': { passValue: null, failValue: undefined },
        '[object Function]': { passValue: () => ({}), failValue: `${() => ({})}` },
        '[object Object]': { passValue: { any: 'thing' }, failValue: [] },
      };
      const primitiveValidator = createValidator();

      Object.keys(primitiveTypes).forEach(primitive => {
        const validatePrimitive = primitiveValidator(primitive);
        const { passValue, failValue } = primitiveTypes[primitive];

        it(`${primitive} should validate ${passValue}`, () => {
          const [actual] = validatePrimitive(passValue);

          expect(actual).toBe(true);
        });

        it(`${primitive} should not validate ${failValue}`, () => {
          const [actual, failed] = validatePrimitive(failValue);
          const expectedFailure = [{
            [failValue]: {
              actual: duckType(failValue),
              expected: primitive,
            }
          }];

          expect(actual).toBe(false);
          expect(failed).toEqual(expectedFailure);
        });
      });
    });
  });

  // TODO: still need [object Array[object String]]
  // or something like that
  describe('Nested custom object types', () => {
    it('should validate failures for custom types within custom types', () => {
      const nestedType = {
        '[object Nested]': {
          type: '[object Nested]',
          definition: {
            id: '[object Number]',
            name: '[object String]',
            one: '[object TypeOne]',
            two: '[object TypeTwo]',
          },
        },
      };
      const nestedData = {
        id: '4',
        name: 'nester',
        one: {
          id: '1',
          name: 'nameone',
          data: [],
        },
        two: {
          id: 2,
          name: 'nametwo',
          data: {}
        },
      };
      const expectedFailures = [
        { 'one.id': { actual: '[object String]', expected: '[object Number]' } },
        { 'one.data': { actual: '[object Array]', expected: '[object Object]' } },
        { id: { actual: '[object String]', expected: '[object Number]' } },
        { 'two.data': { actual: '[object Object]', expected: '[object Array]' } },
      ];
      const validator = createValidator({ ...mockTypes, ...nestedType });
      const validateNested = validator('[object Nested]');
      const [actual, failed] = validateNested(nestedData);

      expect(actual).toBe(false);
      expect(failed.length).toBe(expectedFailures.length);
      expect(failed).toEqual(expectedFailures);
    });

    it('should validate (pass) for custom types within custom types', () => {
      const nestedType = {
        '[object Nested]': {
          type: '[object Nested]',
          definition: {
            id: '[object Number]',
            name: '[object String]',
            one: '[object TypeOne]',
            two: '[object TypeTwo]',
          },
        },
      };
      const nestedData = {
        id: 4,
        name: 'nester',
        one: {
          id: 1,
          name: 'nameone',
          data: {},
        },
        two: {
          id: 2,
          name: 'nametwo',
          data: []
        },
      };
      const expectedFailures = [];
      const validator = createValidator({ ...mockTypes, ...nestedType });
      const validateNested = validator('[object Nested]');
      const [actual, failed] = validateNested(nestedData);

      expect(actual).toBe(true);
      expect(failed.length).toBe(expectedFailures.length);
      expect(failed).toEqual(expectedFailures);
    });
  });
});
