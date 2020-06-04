export const duckType = obj => Object.prototype.toString.call(obj);
export const checkType = (obj, type) => (duckType(obj) === type);

export default {
  duckType,
  checkType
};
