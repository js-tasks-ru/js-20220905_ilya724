/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {

  const newObj = Object.fromEntries(
    Object.entries(obj).filter(
      ([key, value]) => !fields.includes(key)
    )
  );

  return newObj;
};
