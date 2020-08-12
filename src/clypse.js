import { primitives, typeCheckers } from './lib/primitives.js';
import { checkType, duckType } from './lib/checkers.js';
import createValidator from './lib/create-validator.js';

const {
  isPrimitive,
  isFunction,
  isString,
  isObject,
} = typeCheckers;

export const types = {}; // single instance map of custom types

const isRegisteredType = (type, regTypes) => Object.keys(regTypes)
  .some(key => (regTypes[key].type === type));
const getRegisteredType = (type, regTypes) => Object.keys(regTypes)
  .filter(key => (regTypes[key].type === type))
  .reduce((acc, curr) => regTypes[curr], {});
const getTypeName = type => Object.keys(types)
  .reduce((acc, key) => (
    (types[key].type === type)
      ? types[key].name
      : acc
  ), '');
const typeIdRegex = /\[object [a-zA-Z]{1,}\]/;
export const isTypeId = val => isString(val) && typeIdRegex.test(val);
export const getDefinition = type => types[type].definition;
export const getTypeMeta = type => types[type];
const createTypeOf = (registeredTypes, defaultHandler, validator) => (
  type,
  userHandler
) => defaultValue => {
  const typeMessage = `expected type ${type} got ${defaultValue}`;
  const regMessage = `Type ${type} not registered`;
  const primitiveCheck = isPrimitive(type);
  const registeredCheck = isRegisteredType(type, registeredTypes);
  const message = ((!registeredCheck && !primitiveCheck) ? regMessage : typeMessage);
  const handler = handlerProps => (
    userHandler
      ? userHandler(handlerProps)
      : defaultHandler(handlerProps)
  );
  const [isValid, failures] = validator(type)(defaultValue);
  const failureProps = {
    message,
    type,
    value: defaultValue,
    failures,
  };

  if (isValid) {
    return defaultValue;
  }

  if (failures.length) {
    return handler(failureProps);
  }

  if (primitiveCheck) {
    const typeCheck = checkType(defaultValue, type);

    if (typeCheck) {
      return defaultValue;
    }

    return handler(failureProps);
  }

  if (registeredCheck) {
    const registeredType = getRegisteredType(type, registeredTypes);
    const typeDefinition = registeredType.definition;
    const failedChecks = Object.keys(typeDefinition).filter(prop => (
      !checkType(defaultValue[prop], typeDefinition[prop])
    ));

    if (failedChecks && failedChecks.length > 0) {
      return handler(failureProps);
    }

    return defaultValue;
  }

  return defaultValue;
};

const createInternalType = (userType, typeName) => {
  if (!isString(typeName)) {
    throw new TypeError(`Second argument TypeName must be a string, received ${duckType(typeName)}`);
  }

  const internalType = {
    type: userType,
    name: typeName,
    custom: true,
    toString() {
      return isPrimitive(userType) ? userType : `[object ${typeName}]`;
    }
  };

  return internalType;
};

const properCase = str => str.split(' ')
  .map(chars => `${chars.slice(0, 1).toUpperCase()}${chars.slice(1, chars.length)}`).join(' ');

const _createType = (type, typeName, parentType, childName) => {
  const name = typeName ? `${typeName}${childName ? properCase(childName) : ''}` : undefined;
  const _type = createInternalType(type, name);
  const typeId = _type.toString();
  const registeredType = {
    type: typeId,
    definition: _type.type,
    name: _type.name,
  };

  if (types[typeId]) {
    throw new TypeError(`Type ${_type.toString()} already exists`);
  }

  const returnType = parentType || registeredType;

  const childObjects = Object.keys(_type.type).filter(child => isObject(_type.type[child]));
  const hasChildObjects = !!childObjects.length;

  // register to types
  types[typeId] = registeredType;

  if (!hasChildObjects) {
    return returnType.type;
  }

  childObjects.forEach(child => {
    const childType = returnType.definition[child];
    returnType.definition[child] = `[object ${name}${properCase(child)}]`;
    return _createType(childType, name, returnType, child);
  });

  return returnType.type;
};

export const createType = (typeDef, typeName) => _createType(typeDef, typeName);

let onFailure;
const registerHandler = handler => {
  onFailure = handler;
};

export const validate = createValidator(types);

const handleFailure = ({ message, type, value, failures }) => {
  if (isFunction(onFailure)) {
    return onFailure({ message, type, value, failures });
  }

  throw new TypeError(message);
};

export const typeOf = createTypeOf(types, handleFailure, validate);

export const variant = variants => {
  if (!checkType(variants, primitives.obj)) {
    throw new TypeError(`Expected ${primitives.obj} received ${duckType(variants)}`);
  }

  return Object.keys(variants).map(prop => variants[prop]);
};

const returnTypes = {
  primitives,
  types,
  typeOf,
  isTypeId,
  createType,
  getDefinition,
  getTypeMeta,
  getTypeName,
  registerHandler,
  ...typeCheckers,
  validate,
  variant,
};

export default returnTypes;
