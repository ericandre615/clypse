import typeSystem from '../clypse.js';
import One from './one.js';
import Two from './two.js';

const { num, str } = typeSystem.primitives;

const Nested = typeSystem.createType({
  id: num,
  title: str,
  one: One,
  two: Two,
});

export default Nested;
