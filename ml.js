var xdims = ['Visa', 'MasterCard']
  , ydims = ['FR', 'ES', 'IT']   // y axis within every x axis element
  , world1 = [[0, 1, 0], [0, 0, 1]]   // ES Visa and IT MasterCard is always fraudulent
  , world2 = [[0.7, 0, 0.8], [0, 0, 0]]
  , world3 = [[0, 0, 0], [0.9, 0.8, 0.8]]
  , algoView = []
  , stepTime = 2000   // In ms
  , currentWorld
  ;

// Initialize the algorithm's view of the world
// Let's say optimistic but not fine grained
for (var i = 0; i < xdims.length; i += 1) {
  algoView.push([]);
  for (var j = 0; j < ydims.length; j += 1) {
    algoView[i].push({ nf: 10, f: 2 });
  }
}


function simulateOneEvent () {
  var i = Math.floor(2 * Math.random())
    , j = Math.floor(3 * Math.random())
    , isFraud = (currentWorld[i][j] >= Math.random())
    ;

  if (isFraud) { algoView[i][j].f += 1; } else { algoView[i][j].nf += 1; }
}

// Simulate n events with a nice visual transition
// When calling this function, only use the first parameter
function simulateMultipleEvents (n, nDone, lastTimestamp, startTimestamp) {
  if (lastTimestamp === undefined) {
    lastTimestamp = Date.now();
    startTimestamp = Date.now();
    nDone = 0;
  }

  var newTimestamp = Date.now()
    , steps = Math.floor(n * (newTimestamp - lastTimestamp) / stepTime);

  steps = Math.min(steps, n - nDone);
  nDone = steps + nDone;

  for (var i = 0; i < steps; i += 1) { simulateOneEvent(); }
  drawAlgo();

  // Means we can have a bit more than n steps actually
  // The +1000 is a buffer to absorb time taken during calls of the function
  if (nDone === n || newTimestamp - startTimestamp < stepTime + 1000) {
    setTimeout(function () {
      simulateMultipleEvents(n, nDone, newTimestamp, startTimestamp);
    }, 20);   // Max 10 fps
  }
}





// Drawing functions, very dirty ...
function drawTable (table, id) {
  var tableHtml = '<table>';

  tableHtml += "<tr>";
  tableHtml += "<td>";
  tableHtml += "</td>";
  for (var j = 0; j < ydims.length; j += 1) {
    tableHtml += "<td>";
    tableHtml += ydims[j];
    tableHtml += "</td>";
  }
  tableHtml += "</tr>";


  for (var i = 0; i < table.length; i += 1) {
    tableHtml += "<tr>";
    tableHtml += "<td>";
    tableHtml += xdims[i];
    tableHtml += "</td>";
    for (var j = 0; j < table[i].length; j += 1) {
      tableHtml += "<td>";
      tableHtml += Math.floor(100 * table[i][j]) + "%";
      tableHtml += "</td>";
    }
    tableHtml += "</tr>";
  }
  tableHtml += "<table>";

  document.getElementById(id).innerHTML = tableHtml;
}

function getFraudPercentageTable () {
  var res = [];

  for (var i = 0 ; i < algoView.length; i += 1) {
    res.push([]);
    for (var j = 0 ; j < algoView[i].length; j += 1) {
      res[i].push(algoView[i][j].f / (algoView[i][j].f + algoView[i][j].nf));
    }
  }

  return res;
}

function drawWorld (world) {
  drawTable(world, "world-table");
}

function drawAlgo () {
  drawTable(getFraudPercentageTable(), "algo-table");
}

function changeWorld (world) {
  currentWorld = world;
  drawWorld(world);
}

document.getElementById("select-world").addEventListener("change", function () {
  var world = document.getElementById("select-world").value;
  if (world === "world1") { changeWorld(world1); }
  if (world === "world2") { changeWorld(world2); }
  if (world === "world3") { changeWorld(world3); }
});

function goPressed () {
  var events = document.getElementById("events").value;
  events = parseInt(events, 10);
  if (isNaN(events)) { return; }
  simulateMultipleEvents(events);
}

document.getElementById("go").addEventListener("click", goPressed);
document.getElementById("events").addEventListener("keypress", function (e) {
  if (e.keyCode === 13) { goPressed(); }
});


// INIT
changeWorld(world1);
drawAlgo();
