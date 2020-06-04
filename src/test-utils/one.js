import typeSystem from '../clypse.js';

const { num, str, date } = typeSystem.primitives;

const One = typeSystem.createType({
  id: num,
  firstName: str,
  lastName: str,
  created_on: date
}, { name: 'One' });

export default One;
