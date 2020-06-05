import typeSystem from '../clypse.js';

const { num, str } = typeSystem.primitives;

const Two = typeSystem.createType({
  id: num,
  occupation: str,
  position: num
}, 'Two');

export default Two;
