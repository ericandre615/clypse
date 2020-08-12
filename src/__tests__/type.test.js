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
  describe('createType', () => {
    it('should require second argument name/id', () => {
      const createTestType = () => typeSystem.createType({
        name: str,
        id: num,
      });
      const expectedErrorMessage = 'Second argument TypeName must be a string, received [object Undefined]';

      expect(createTestType).toThrow();
      try {
        createTestType();
      } catch ({ message }) {
        expect(message).toBe(expectedErrorMessage);
      }
    });

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

  describe('typeOf', () => {
    it('should return data as-is if valid of type', () => {
      const userType = typeSystem.createType({
        name: str,
        id: num,
        other: { data: str },
      }, 'TestUserTypeOf');
      const userValue = {
        name: 'dude',
        id: 10,
        other: {
          data: '2021',
        },
      };
      const validationError = new Error('Test failed Validation');
      const handleFailure = () => validationError;
      const User = typeOf(userType, handleFailure);
      const someUser = User(userValue);

      expect(someUser).not.toBe(validationError);
      expect(someUser).toEqual(userValue);
    });

    it('[default] it should throw error if data is not valid', () => {
      const userType = typeSystem.createType({
        name: str,
        id: num,
        other: { data: str },
      }, 'TestUserTypeOfDefaultFail');
      const userValue = {
        name: 'dude',
        id: 10,
        other: {
          data: 2021,
        },
      };
      const validationError = new Error('Test failed Validation');
      const handleFailure = () => validationError;
      const User = typeOf(userType, handleFailure);
      const someUser = User(userValue);

      expect(someUser).toBe(validationError);
      expect(someUser).not.toEqual(userValue);
    });

    it('should allow a user to handle failures', () => {
      const userType = typeSystem.createType({
        name: str,
        id: num,
        data: num,
      }, 'TestUserTypeOfHandleFail');
      const userValue = {
        name: 'dude-fail',
        id: '10',
        data: 'not parsed'
      };
      const expectedUserValue = {
        name: 'dude-fail',
        id: 10,
        data: 0
      };
      const handleFailure = ({ value, failures }) => {
        const convertedFailures = failures.reduce((acc, failure) => {
          const prop = Object.keys(failure)[0];
          const { actual, expected } = failure[prop];
          const propValue = value[prop];

          if (actual === '[object String]' && expected === '[object Number]') {
            const parsedValue = parseInt(propValue, 10);
            return {
              ...acc,
              [prop]: Number.isNaN(parsedValue) ? 0 : parsedValue,
            };
          }

          return {
            ...acc,
            [prop]: propValue,
          };
        }, {});

        return {
          ...value,
          ...convertedFailures,
        };
      };
      const User = typeOf(userType, handleFailure);
      const someUser = User(userValue);
      const [_, userFailures] = validate(userType)(userValue);

      expect(someUser).toEqual(expectedUserValue);
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

    it('should return true if value is strictly of type', () => {
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

    it('should validate nested types ', () => {
      const validatorTestDataNested = createType({
        name: str,
        id: num,
        start: date,
        nesting: {
          level: num,
          desc: str,
        },
      }, 'ValidatorTestDataNested');

      const testData = {
        name: 'dude',
        id: '12',
        start: new Date(),
        nesting: {
          level: '1',
        }
      };
      const expectedFailures = [
        {
          'nesting.level': {
            actual: '[object String]',
            expected: '[object Number]',
          },
        },
        {
          'nesting.desc': {
            actual: '[object Undefined]',
            expected: '[object String]',
          },
        },
        {
          id: {
            actual: '[object String]',
            expected: '[object Number]',
          },
        },
      ];
      const validateTestDataNested = validate(validatorTestDataNested);
      const [isValid, failures] = validateTestDataNested(testData);

      expect(isValid).toBe(false);
      expect(failures).toEqual(expectedFailures);
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
});
