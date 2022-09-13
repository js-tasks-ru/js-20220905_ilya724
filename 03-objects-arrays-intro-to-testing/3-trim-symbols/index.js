/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  
  if (size === undefined) return string;

  let result = '';
  let counter = 0;
  let currentSymbol = string[0];

  for (let symbol of string) {
    if (symbol === currentSymbol) {
      counter++;
      counter <= size ? result += symbol : result;
    } else {
      currentSymbol = symbol;
      counter = 1;
      counter <= size ? result += symbol : result;
    }
  }

  return result;
}
