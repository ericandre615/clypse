// TODO: temp
/* eslint-disable no-unused-vars */
import One from '../test-utils/one.js';
import Two from '../test-utils/two.js';
import Nested from '../test-utils/nested.js';
import typeSystem from '../clypse.js';

const {
  primitives,
  types,
  typeOf,
  isTypeOf,
  createType,
  getDefinition,
  getTypeMeta,
  getTypeName,
  registerHandler,
  isObject,
  isArray,
  isString,
  isNumber,
  isBoolean,
  isFunction,
  isBuffer,
  isDate,
  isSymbol,
  isRegex,
  isFloat32Array,
  validate
} = typeSystem;
const {
  num,
  str,
  date
} = primitives;

describe('TypeSystem', () => {
  // describe('Primitives', () => {
  //  it('should export a set of js primitive types', () => {
  //    const expectedPrimitives = {
  //      arr: '[object Array]',
  //      bool: '[object Boolean]',
  //      buffer: '[object Uint8Array]',
  //      date: '[object Date]',
  //      func: '[object Function]',
  //      num: '[object Number]',
  //      obj: '[object Object]',
  //      str: '[object String]',
  //      symb: '[object Symbol]',
  //      regex: '[object RegExp]',
  //      f32: '[object Float32Array]',
  //    };

  //    expect(primitives).toEqual(expectedPrimitives);
  //  });
  // });

  describe('createType', () => {
    it('should create and register a new type', () => {

    });
  });

  describe('type validation', () => {
    it('should validate nested types', () => {

    });
  });

  describe('getTypeName', () => {
    it('should return a types name', () => {

    });
  });

  describe('validator', () => {
    it('should return false if value is not strictly equal to type', () => {
      const validateOne = validate(One);
      const [actualValidation, failed] = validateOne({
        firstName: 'Jeremy',
        lastName: 'Pivens'
      });

      expect(actualValidation).toBe(false);
    });

    it('should return a list of failed validations if value is not strictly equal to type', () => {
      const validateOne = validate(One);
      const expectedFailures = [
        { id: { actual: '[object Undefined]', expected: '[object Number]' } },
        { created_on: { actual: '[object String]', expected: '[object Date]' } }
      ];
      const [_, actualFailures] = validateOne({
        firstName: 'Jeremy',
        lastName: 'Pivens',
        created_on: '2020-05-15T18:18:45.660Z'
      });

      expect(actualFailures).toEqual(expectedFailures);
    });

    it('should return turn true if value is strictly of type', () => {
      const validateOne = validate(One);
      const validateTwo = validate(Two);
      const testValue = {
        id: 1,
        firstName: 'Jeremy',
        lastName: 'Pivens',
        created_on: new Date('12-12-2012')
      };
      const [actualValidationOne, failed] = validateOne(testValue);
      const [actualValidationTwo] = validateTwo(testValue);

      expect(actualValidationTwo).toBe(false);
      expect(actualValidationOne).toBe(true);
    });
  });

  describe('getTypeMeta', () => {
    it('should return full type information including [definition, name, type]', () => {
      const expectedDefinition = {
        id: num,
        firstName: str,
        lastName: str,
        created_on: date
      };
      const { type, name, definition } = getTypeMeta(One);

      expect(type).toBe('[object One]');
      expect(name).toBe('One');
      expect(definition).toEqual(expectedDefinition);
    });
  });

  // describe('Primitive type checkers', () => {
  //  const testTypes = {
  //    isArray: [],
  //    isBoolean: true,
  //    isBuffer: new Uint8Array(1),
  //    isDate: new Date(),
  //    isFunction: () => ({}),
  //    isNumber: 1,
  //    isObject: {},
  //    isString: 'string',
  //    isSymbol: Symbol('Test Symbol'),
  //    isRegex: /[a-zA-Z0-9]/g,
  //    isFloat32Array: new Float32Array(),
  //  };
  //  const typeCheckers = {
  //    isObject,
  //    isArray,
  //    isString,
  //    isNumber,
  //    isBoolean,
  //    isFunction,
  //    isBuffer,
  //    isDate,
  //    isSymbol,
  //    isRegex,
  //    isFloat32Array,
  //  };

  //  Object.keys(typeCheckers).forEach(key => {
  //    const checker = typeCheckers[key];
  //    const { name } = checker;
  //    const { [name]: validType, ...otherTypes } = testTypes;

  //    describe(`${name}`, () => {
  //      it(`should return true if type ${name}`, () => {
  //        const actualValue = checker(validType);

  //        expect(actualValue).toBe(true);
  //      });

  //      it('should return false for any other types', () => {
  //        Object.keys(otherTypes).forEach(typeKey => {
  //          const actualValue = checker(otherTypes[typeKey]);

  //          expect(actualValue).toBe(false);
  //        });
  //      });
  //    });
  //  });

  // });
});
