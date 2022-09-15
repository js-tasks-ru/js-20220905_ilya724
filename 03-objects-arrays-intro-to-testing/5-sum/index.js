/**
 * Sum - returns sum of arguments if they can be converted to a number
 * @param {number} n value
 * @returns {number | function}
 */
export function sum(n) {
  let sum = 0;

  if (n) sum += n;

  function countSum(x) {
    if (x) sum += x;
    
    return countSum;
  }

  countSum.toString = () => {
    return sum;
  }

  return countSum;
}