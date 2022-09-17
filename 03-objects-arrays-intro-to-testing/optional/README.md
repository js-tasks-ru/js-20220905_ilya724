Необходимо передать в функцию такие параметры, при вызове с которыми
функция возвращает булевское значение "true"

```javascript
function returnTrue0(a) {
  return a;
}
// returnTrue0(true)

function returnTrue1(a) {
  return typeof a !== "object" && !Array.isArray(a) && a.length === 4;
}
// returnTrue1('qwer')

function returnTrue2(a) {
  return a !== a;
}
// returnTrue2(NaN)

function returnTrue3(a, b, c) {
  return a && a == b && b == c && a != c;
}
// returnTrue3([3], '3', [3])

function returnTrue4(a) {
  return a++ !== a && a++ === a;
}
// returnTrue4(9007199254740991)

function returnTrue5(a) {
  return a in a;
}
// const obj = {}
// obj[obj] = obj
// returnTrue5(obj)

function returnTrue6(a) {
  return a[a] == a;
}
// const obj = {}
// obj[obj] = obj
// returnTrue6(obj)

function returnTrue7(a, b) {
  return a === b && 1 / a < 1 / b;
}
// returnTrue7(-0, 0)
```
