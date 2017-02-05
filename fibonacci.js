// n >= 0
// On my laptop, n=41 takes 3s
function fibRec (n) {
  if (n === 0) { return 0; }
  if (n === 1) { return 1; }

  return fibRec(n - 1) + fibRec(n - 2)
}


// No way to reach a point where calculation slows
function fibLinear (n) {
  if (n === 0) { return 0; }
  if (n === 1) { return 1; }

  var a = 0, b = 1, temp;
  for (var i = 2; i <= n ; i += 1) {
    a = a + b;
    temp = a;
    a = b;
    b = temp;
  }
  return b;
}


// Using Binet's formula
// In theory logarithmic using Binet's formula but loses precision because of floating point errors
// n = 15 yields an integer
// n = 40 does not
// n = 60 neither, with higher error
function fibBinet (n) {
  var phi = (1 + Math.sqrt(5)) / 2
    , phip = (1 - Math.sqrt(5)) / 2
    , res = (Math.pow(phi, n) - Math.pow(phip, n)) / Math.sqrt(5)
    ;

  return res;
}


// Truly logarithmic and precise except when integers become too large (due to substraction)
function figLog (n) {
  if (n === 0) { return 0; }
  if (n === 1) { return 1; }
  if (n === 2) { return 1; }

  return Math.pow(figLog(Math.floor(n / 2) + 1), 2) - Math.pow(-1, n) * Math.pow(figLog(Math.floor((n - 1) / 2)), 2)
}
