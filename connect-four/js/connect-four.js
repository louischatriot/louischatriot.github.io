// Barebones Connect Four

var rows = 6, columns = 7
  , topRows = 2   // Number of virtual rows on top of the grid that will be used for animation
  , board   // 0 is empty, -1 is red and 1 is yellow
  , currentPlayer
  , width, height
  , cellSize   // Cells are square
  , container
  , margin = 0.025   // In percent of cell size, on all directions
  , marginLeft, marginTop
  ;


function init () {
  console.log("INITIALIZATION");

  // Empty board
  board = [];
  for (var i = 0; i < columns; i += 1) {
    board[i] = [];
    for (var j = 0; j < rows; j += 1) {
      board[i][j] = 0;
    }
  }

  currentPlayer = 1;   // Yellow starts

  // Calculate dimensions for drawing (use the largest viewport that can accomodate full grid and top rows)
  var wWidth = $(window).width(), wHeight = $(window).height();
  cellSize = Math.min(wWidth / columns, wHeight / (rows + topRows))
  var containerWidth = cellSize * columns
    , containerHeight = cellSize * (rows + topRows)
    ;
  cellSize *= (1 - 2 * margin);
  marginLeft = containerWidth * margin;
  marginTop = containerHeight * margin;

  // Draw grid
  container = d3.select("#container")
                .attr("width", containerWidth)
                .attr("height", containerHeight)
                .append("g")
                .attr("transform", "translate(" + marginLeft + "," + marginTop + ")")
                ;
  for (var i = 0; i <= rows; i += 1) {
    container.append("line")
             .attr("class", "grid-line")
             .attr("x1", 0)
             .attr("y1", (topRows + i) * cellSize)
             .attr("x2", columns * cellSize)
             .attr("y2", (topRows + i) * cellSize)
             ;
  }
  for (i = 0; i <= columns; i += 1) {
    container.append("line")
             .attr("class", "grid-line")
             .attr("x1", i * cellSize)
             .attr("y1", topRows * cellSize)
             .attr("x2", i * cellSize)
             .attr("y2", (topRows + rows) * cellSize)
             ;
  }
}

// If chip is supplied, use it as next chip
function play(c, chip) {
  for (var r = 0; r < rows; r += 1) {
    if (board[c][r] === 0) {
      board[c][r] = currentPlayer;

      if (!chip) {
        removeShadow();
        container.append("circle")
                 .attr("class", "chip-" + color(currentPlayer))
                 .attr("cx", (c + 0.5) * cellSize)
                 .attr("cy", (topRows + rows - r - 0.5) * cellSize)
                 .attr("r", cellSize / 2.25)
      } else {
        chip.style("opacity", 1)
            .attr("class", "chip-" + color(currentPlayer))
            ;

        chip.attr("cy", (topRows + rows -r - 0.5) * cellSize);
      }
      currentPlayer *= -1;
      break;
    }
  }

  // Do nothing is play is illegal (i.e. column is full)
  //displayBoard();   // debug
}



// Return -1 if out of bounds
function colFromEvent (e) {
  //alert(e);
  //alert(e.touches);
  //alert(e.touches[0]);
  //alert(e.touches[0].pageX);


  var parentOffset = $(e.srcElement).parent().offset()
    , relativeX = (e.pageX !== undefined ? e.pageX : e.page.x) - parentOffset.left - marginLeft
    , c = Math.floor(relativeX / cellSize)
    ;

  if (c < 0 || c >= columns) { c = -1; }
  return c;
}

function color (player) {
  return player === 1 ? "yellow" : "red";
}


// ============================================================
// <UI - mouse click version>

var selectedColumn, mobileEvent;

function drawShadow (c) {
  container.append("circle")
           .attr("class", "shadow chip-" + color(currentPlayer))
           .attr("cx", (c + 0.5) * cellSize)
           .attr("cy", (topRows / 2) * cellSize)
           .attr("r", cellSize / 2.25)
  currentShadowCol = c;
}

function removeShadow () {
  container.selectAll(".shadow").remove();
  currentShadowCol = undefined;
}

function clicked (e) {
  var c = colFromEvent(e);
  if (c === -1) {
    removeShadow();
    selectedColumn = undefined;
    return;
  }

  if (selectedColumn !== undefined && selectedColumn === c) {
    play(c, d3.select(".shadow"));
    console.log("------------------");
    return;
    removeShadow();
    selectedColumn = undefined;
  } else {
    selectedColumn = c;
    removeShadow();
    drawShadow(c);
  }
}

$("svg#container").on("click", clicked);

// Prevent scrolling on mobile
$(document.body).on("touchmove", function(event) {
    event.preventDefault();
    event.stopPropagation();
});

// </UI - mouse click version>


// ============================================================
// <UI - mouse hover version, not too good actually>

//var currentShadowCol;

//function redrawShadow (c) {
  //if (currentShadowCol === c) { return; }
  //removeShadow();
  //drawShadow(c);
//}

//function drawShadow (c) {
  //container.append("circle")
           //.attr("class", "shadow chip-" + color(currentPlayer))
           //.attr("cx", (c + 0.5) * cellSize)
           //.attr("cy", (topRows / 2) * cellSize)
           //.attr("r", cellSize / 2.25)
  //currentShadowCol = c;
//}

//function removeShadow () {
  //container.selectAll(".shadow").remove();
  //currentShadowCol = undefined;
//}

//$("svg#container").on("mousemove", function (e) {
  //redrawShadow(colFromEvent(e));
//});

//$("svg#container").on("mouseout", function (e) {
  //// Not sure why hasClass() doesn't work, not interested
  //var classes = $(e.toElement).attr("class");
  //classes = classes ? classes.split(" ") : [];
  //for (var i = 0; i < classes.length; i += 1) {
    //if (classes[i] === "shadow") { return; }
  //}
  //removeShadow(colFromEvent(e));
//});

//$("svg#container").on("click", function (e) {
  //play(colFromEvent(e));
  //redrawShadow(colFromEvent(e));
//});

// </UI - mouse hover version, not too good actually>
// ============================================================





// Debug
function displayBoard () {
  var line;

  for (var i = rows - 1; i >= 0; i -= 1) {
    line = "";
    for (var j = 0; j < columns; j += 1) {
      line += (board[j][i] === 0 ? "." : (board[j][i] === 1 ? "Y" : "R")) + "  ";
    }
    line += "                    " + Math.random();   // Quick hack to avoid line collapsing in Chrome console :)
    console.log(line);
  }
}


// Initialization
init();
