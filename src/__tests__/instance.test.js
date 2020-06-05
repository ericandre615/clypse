import One from '../test-utils/one.js';
import Two from '../test-utils/two.js';
import Three from '../test-utils/three.js';
import typeSystem from '../clypse.js';

const {
  primitives: {
    num, str, date
  },
  getTypeMeta,
} = typeSystem;

describe('Type system instance', () => {
  it('should only ever produce one instance of all the registered types', () => {
    const expectedTypes = {
      '[object One]': getTypeMeta(One),
      '[object Two]': getTypeMeta(Two),
      '[object Three]': getTypeMeta(Three)
    };
    const { user: _user, ...actualTypes } = typeSystem.types;

    expect(actualTypes).toEqual(expectedTypes);
  });

  it('should throw a TypeError if trying to register an existing Type', () => {
    const registerDuplicateType = () => typeSystem.createType({
      id: num,
      firstName: str,
      lastName: str,
      created_on: date
    }, 'One');

    expect(registerDuplicateType).toThrow();
  });

  it('should have proper TypeError message', () => {
    const registerDuplicateType = () => typeSystem.createType({
      id: num,
      firstName: str,
      lastName: str,
      created_on: date
    }, 'One');
    const expectedErrorMessage = 'Type [object One] already exists';

    try {
      registerDuplicateType();
    } catch (e) {
      expect(e.message).toBe(expectedErrorMessage);
    }
  });
});
