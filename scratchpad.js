



  function fahrenheitToCelsius (f) {
    var result;

    result = f - 32;
    result = result * 5;
    result = result / 9;

    return result;
  }


  console.log(fahrenheitToCelsius(70));   // Outputs 21.111





  function getMax (a) {
    if (a.length === 0) { return undefined; }

    var result = a[0];

    for (var i = 1; i < a.length; i += 1) {
      if (a[i] > result) {
        result = a[i];
      }
    }

    return result;
  }


  var a = [1, 45, 32, 100, 33, 98, 5];
  console.log(getMax(a));   // Outputs 100





  function gcd (a, b) {
    // Ensure a >= b
    if (a < b) { var t = b; b = a; a = t; }

    var r = a - b;

    if (r === 0) {
      return b;
    } else {
      return gcd(b, r);
    }
  }


  console.log(gcd(48, 32));   // Outputs 16







