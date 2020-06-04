import { checkType } from './checkers.js';

export const primitives = {
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
  f64: '[object Float64Array]',
};

export const typeCheckers = {
  isPrimitive: obj => Object.keys(primitives).some(key => (obj === primitives[key])),
  isUndefined: obj => checkType(obj, primitives.undef),
  isNull: obj => checkType(obj, primitives.nul),
  isObject: obj => checkType(obj, primitives.obj),
  isArray: obj => checkType(obj, primitives.arr),
  isString: obj => checkType(obj, primitives.str),
  isNumber: obj => checkType(obj, primitives.num),
  isBoolean: obj => checkType(obj, primitives.bool),
  isFunction: obj => checkType(obj, primitives.func),
  isBuffer: obj => checkType(obj, primitives.buffer),
  isDate: obj => checkType(obj, primitives.date),
  isSymbol: obj => checkType(obj, primitives.symb),
  isRegex: obj => checkType(obj, primitives.regex),
  isInt8Array: obj => checkType(obj, primitives.i8),
  isUint8Array: obj => checkType(obj, primitives.u8),
  isUint8ClampedArray: obj => checkType(obj, primitives.u8Clamped),
  isInt16Array: obj => checkType(obj, primitives.i16),
  isUint16Array: obj => checkType(obj, primitives.u16),
  isInt32Array: obj => checkType(obj, primitives.i32),
  isUint32Array: obj => checkType(obj, primitives.u32),
  isFloat32Array: obj => checkType(obj, primitives.f32),
  isFloat64Array: obj => checkType(obj, primitives.f64),
};

export default {
  primitives,
  typeCheckers
};