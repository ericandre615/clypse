import { primitives, typeCheckers } from './lib/primitives.js';
import { checkType } from './lib/checkers.js';
import createValidator from './lib/create-validator.js';

const {
  isPrimitive,
  isFunction
} = typeCheckers;

const defaultOptions = {
  name: '',
  deep: false
};

const types = {};

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

const getDefinition = type => types[type].definition;

const getTypeMeta = type => types[type];
// const validateType = types => type => {
//   const failedChecks = Object.keys(type.definition)
//     .reduce((acc, curr) => (
//       !checkType(convert, actual)
//     ));
//
//   return failedChecks;
// };

const createTypeOf = (registeredTypes, defaultHandler) => (
  type,
  defaultValue = undefined,
  userHandler
) => {
  // use this as default func value
  const typeMessage = `expected type ${type} got ${defaultValue}`;
  const regMessage = `Type ${type} not registered`;
  const primitiveCheck = isPrimitive(type);
  const registeredCheck = isRegisteredType(type, registeredTypes);
  const message = ((!registeredCheck && !primitiveCheck) ? regMessage : typeMessage);
  const handler = (handleMessage, handleType, handleDefaultValue) => (
    userHandler
      ? userHandler(handleMessage, handleType, handleDefaultValue)
      : defaultHandler(handleMessage, handleType, handleDefaultValue)
  );

  if (primitiveCheck) {
    const typeCheck = checkType(defaultValue, type);

    if (typeCheck) {
      return defaultValue;
    }

    return handler(message, type, defaultValue);
  }

  if (registeredCheck) {
    const registeredType = getRegisteredType(type, registeredTypes);
    const typeDefinition = registeredType.definition;
    const failedChecks = Object.keys(typeDefinition).filter(prop => (
      !checkType(defaultValue[prop], typeDefinition[prop])
    ));

    if (failedChecks && failedChecks.length > 0) {
      return handler(message, type, defaultValue);
    }

    return defaultValue;
  }

  return defaultValue;
};

const createIsTypeOf = registeredTypes => type => value => (
  typeof value === registeredTypes[type].definition // eslint-disable-line valid-typeof
);
const createInternalType = (userType, options = defaultOptions) => {
  const type = userType;
  const { name } = options;
  const internalType = {
    type,
    name,
    custom: true,
    toString() {
      return isPrimitive(type) ? type : `[object ${name}]`;
    }
  };

  return internalType;
};

// const isCustomType = ({ custom }) => !!custom;

const createType = (type, options = defaultOptions) => {
  const _type = createInternalType(type, options);
  const typeId = _type.toString();
  // const isCustom = isCustomType(_type);
  if (types[typeId]) {
    throw new TypeError(`Type ${_type.toString()} already exists`);
  }

  types[typeId] = {
    type: typeId,
    definition: _type.type,
    name: _type.name
  };

  return types[typeId].type;
};

let onFailure;
const registerHandler = handler => {
  onFailure = handler;
};

const handleFailure = (message, type, value) => {
  if (isFunction(onFailure)) {
    return onFailure(message, type, value);
  }

  throw new TypeError(message);
};

const typeOf = createTypeOf(types, handleFailure);
const isTypeOf = createIsTypeOf(types);

// TODO: should I remove? is it used? or try to make name prop configure writable
// typeOf.name = 'typeOf';
// isTypeOf.name = 'isTypeOf';

const returnTypes = {
  primitives,
  types,
  typeOf,
  isTypeOf,
  createType,
  getDefinition,
  getTypeMeta,
  getTypeName,
  registerHandler,
  ...typeCheckers,
  validate: createValidator(types)
};

export default returnTypes;
