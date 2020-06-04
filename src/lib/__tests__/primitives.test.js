import {
  primitives,
  typeCheckers
} from '../primitives.js';

describe('primitives', () => {
  describe('types', () => {
    it('should export the expected primitive types', () => {
      const expectedPrimitives = {
        undef: '[object Undefined]',
        nul: '[object Null]',
        obj: '[object Object]',
        arr: '[object Array]',
        str: '[object String]',
        num: '[object Number]',
        bool: '[object Boolean]',
        func: '[object Function]',
        buffer: '[object Uint8Array]',
        date: '[object Date]',
        symb: '[object Symbol]',
        regex: '[object RegExp]',
        i8: '[object Int8Array]',
        u8: '[object Uint8Array]',
        u8Clamped: '[object Uint8ClampedArray]',
        i16: '[object Int16Array]',
        u16: '[object Uint16Array]',
        i32: '[object Int32Array]',
        u32: '[object Uint32Array]',
        f32: '[object Float32Array]',
        f64: '[object Float64Array]'
      };

      expect(primitives).toEqual(expectedPrimitives);
    });
  });

  describe('isPrimitive', () => {
    const { isPrimitive } = typeCheckers;
    const testTrueValues = [
      '[object Number]',
      '[object Object]',
      '[object Array]',
      ...Object.values(primitives)
    ];
    const testFalseValues = [
      '[object CustomType]',
      'some random string',
      2,
      [],
      {},
      new Float32Array()
    ];

    testTrueValues.forEach(testValue => {
      it(`${testValue} should be considered primitive type`, () => {
        const actualType = isPrimitive(testValue);

        expect(actualType).toBe(true);
      });
    });

    testFalseValues.forEach(testValue => {
      it(`${testValue} should not be considered primitive type`, () => {
        const actualType = isPrimitive(testValue);

        expect(actualType).toBe(false);
      });
    });
  });

  describe('isBuffer', () => {
    // isBuffer was basically just an alias for a uint8 array
    // I think nodejs may use the uint8Array for it's Buffer objects as well
    const { isBuffer } = typeCheckers;

    it('should return true if a type could be a buffer', () => {
      const customBuffer = new Uint8Array(10);
      const actualCustomBuffer = isBuffer(customBuffer);
      const nodeBuffer = Buffer.alloc(10);
      const actualNodeBuffer = isBuffer(nodeBuffer);

      expect(actualCustomBuffer).toBe(true);
      expect(actualNodeBuffer).toBe(true);
    });
  });

  describe('checkers', () => {
    const {
      isPrimitive: _isPrimitive,
      isBuffer: _isBuffer,
      ...checkers
    } = typeCheckers;
    const testTypes = {
      isUndefined: undefined,
      isNull: null,
      isArray: [],
      isBoolean: true,
      isDate: new Date(),
      isFunction: () => ({}),
      isNumber: 1,
      isObject: {},
      isString: 'some string',
      isSymbol: Symbol('Test Symbol'),
      isRegex: /[a-zA-Z0-9]/g,
      isInt8Array: new Int8Array(),
      isUint8Array: new Uint8Array(),
      isUint8ClampedArray: new Uint8ClampedArray(),
      isInt16Array: new Int16Array(),
      isUint16Array: new Uint16Array(),
      isInt32Array: new Int32Array(),
      isUint32Array: new Uint32Array(),
      isFloat32Array: new Float32Array(),
      isFloat64Array: new Float64Array()
    };

    Object.keys(checkers).forEach(key => {
      const checker = checkers[key];
      const { name } = checker;
      const { [name]: validType, ...otherTypes } = testTypes;

      describe(`${name}`, () => {
        it(`should return true if type ${name}`, () => {
          const actualValue = checker(validType);

          expect(actualValue).toBe(true);
        });

        it('should return false for any other types', () => {
          Object.keys(otherTypes).forEach(typeKey => {
            const actualValue = checker(otherTypes[typeKey]);

            expect(actualValue).toBe(false);
          });
        });
      });
    });
  });
});
