import typeSystem from '../clypse.js';

const { num, str } = typeSystem.primitives;

const Three = typeSystem.createType({
  id: num,
  address: str,
  apt: num,
  zip: num
}, 'Three');

export default Three;
