import { checkType, duckType } from './checkers.js';
import { primitives, typeCheckers } from './primitives.js';

const { isPrimitive } = typeCheckers;
const partition = data => predicate => data.reduce(([pass, fail], curr) => (
  predicate(curr)
    ? [[...pass, curr], fail]
    : [pass, [...fail, curr]]
), [[], []]);
const flatten = data => data.reduce((acc, curr) => (acc.concat(curr)), []);

const createPrimitiveDefinitions = () => Object.keys(primitives)
  .reduce((acc, curr) => ({
    ...acc,
    [primitives[curr]]: { definition: primitives[curr] },
  }), {});

const createValidatorTypes = types => ({
  ...types,
  ...createPrimitiveDefinitions(),
});

const isCustomDefinition = ftype => {
  const expectedType = Object.keys(ftype)[0];
  const { expected } = ftype[expectedType];

  return !isPrimitive(expected);
};

const createValidator = types => type => (val, failed = [], parentLabel = '') => {
  const validTypes = createValidatorTypes(types || {});
  const { definition } = validTypes[type];
  const hasArrayDefinition = checkType(definition, primitives.arr);
  const hasDefinition = checkType(definition, primitives.obj);
  const failedDefinitions = hasDefinition && Object.keys(definition).reduce((acc, curr) => (
    checkType(val[curr], definition[curr])
      ? acc
      : [...acc, {
        [`${parentLabel}${curr}`]: {
          actual: duckType(val[curr]),
          expected: definition[curr],
        },
      }]
  ), []);
  const isValidPrimitive = checkType(val, definition);
  const failedPrimitive = !isValidPrimitive && [{
    [val]: {
      actual: duckType(val),
      expected: definition,
    }
  }];

  const failedValidations = failedDefinitions || failedPrimitive;
  const totalFailures = [...failedValidations || [], ...failed];
  const isValid = !totalFailures.length;

  if (hasArrayDefinition) {
    const isValueArray = checkType(val, primitives.arr);

    if (!isValueArray) {
      return [false, [...totalFailures, { [val]: { actual: duckType(val), expected: primitives.arr } }]];
    }

    const isEveryValueValid = val.every(v => definition.some(d => checkType(v, d)));

    if (isEveryValueValid) {
      return [isEveryValueValid, []];
    }

    return [isValid, totalFailures];
  }

  if (failedDefinitions.length) {
    const [customs, stillFails] = partition(failedDefinitions)(def => isCustomDefinition(def));

    if (customs.length) {
      const collected = [];
      customs.forEach(custom => {
        const expectedType = Object.keys(custom)[0];
        const { expected } = custom[expectedType];
        const parentProp = `${expectedType}.`;
        const [_, failing] = createValidator(types)(expected)(val[expectedType], stillFails, parentProp);

        return collected.push(failing);
      });
      const flatCollected = [...new Set(flatten(collected))];

      return [!flatCollected.length, flatCollected];
    }

    return [!totalFailures.length, totalFailures];
  }

  return [isValid, totalFailures];
};

export default createValidator;
