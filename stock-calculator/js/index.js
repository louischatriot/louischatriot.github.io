function calculateGain(optionExercisePrice, stockMarketValue, yearsBeforeLiquidity, cutoffCAGR, shareOfGains, numberOptions) {
  var priceDelta = Math.max(0, stockMarketValue - optionExercisePrice)
    , cutoffCAGR_totalGrowth = Math.pow(1 + cutoffCAGR, yearsBeforeLiquidity) - 1
    , cutoffCAGR_unitPrice = optionExercisePrice * (1 + cutoffCAGR_totalGrowth)
    , shareOfGains_unitPrice = optionExercisePrice + shareOfGains * priceDelta
    , shareOfGains_totalGrowth = (shareOfGains_unitPrice / optionExercisePrice) - 1
    , buyerGuaranteedGain = Math.min(stockMarketValue, cutoffCAGR_unitPrice)
    , buyerGain = stockMarketValue > optionExercisePrice ? Math.max(buyerGuaranteedGain, shareOfGains_unitPrice) : stockMarketValue
    , sellerGain = stockMarketValue - buyerGain
    ;

  //if (shareOfGains_unitPrice > buyerGuaranteedGain) {
    //buyerGain = shareOfGains_unitPrice;
    //sellerGain = stockMarketValue - buyerGain;
  //}



  //console.log("======================");
  //console.log(cutoffCAGR_totalGrowth);
  //console.log(cutoffCAGR_unitPrice);
  //console.log(shareOfGains_totalGrowth);
  //console.log(shareOfGains_unitPrice);


  //console.log("=======");
  //console.log(buyerGain);
  //console.log(sellerGain);

  return { buyerGain: buyerGain, sellerGain: sellerGain };
}


function calculate () {
  var optionExercisePrice = $('#option-exercise-price').val()
    , stockMarketValue = $('#stock-market-value').val()
    , yearsBeforeLiquidity = $('#years-before-liquidity').val()
    , cutoffCAGR = $('#cutoff-cagr').val()
    , shareOfGains = $('#share-of-gains').val()
    , numberOptions = $('#number-options').val()
    ;

  optionExercisePrice = parseFloat(optionExercisePrice);
  stockMarketValue = parseFloat(stockMarketValue);
  yearsBeforeLiquidity = parseFloat(yearsBeforeLiquidity);
  cutoffCAGR = parseFloat(cutoffCAGR.replace(/\%/,'')) / 100;
  shareOfGains = parseFloat(shareOfGains.replace(/\%/,'')) / 100;
  numberOptions = parseFloat(numberOptions);

  //console.log('--------------------------------');
  //console.log(optionExercisePrice);
  //console.log(stockMarketValue);
  //console.log(yearsBeforeLiquidity);
  //console.log(cutoffCAGR);
  //console.log(shareOfGains);
  //console.log(numberOptions);

  var gains = calculateGain(optionExercisePrice, stockMarketValue, yearsBeforeLiquidity, cutoffCAGR, shareOfGains, numberOptions)
    , buyerGainPercent = (gains.buyerGain / optionExercisePrice) - 1
    , buyerGainPercentAnnual = Math.pow(1 + buyerGainPercent, 1 / yearsBeforeLiquidity) - 1
    ;

  if (isNaN(gains.buyerGain)) {
    $('#output').css('display', 'none');
  } else {
    $('#output').css('display', 'block');

    $('#buyer-paid').html(formatAmount(optionExercisePrice));
    $('#buyer-gain').html(formatAmount(gains.buyerGain));
    $('#buyer-net-gain').html(formatAmount(gains.buyerGain - optionExercisePrice));
    $('#buyer-total-growth').html(formatPercent(buyerGainPercent));
    $('#buyer-annual-growth').html(formatPercent(buyerGainPercentAnnual));

    $('#seller-gain').html(formatAmount(gains.sellerGain));
  }


  // GRAPH
$('#graph').attr('width', $('#graph').width());
$('#graph').attr('height', $('#graph').height());
var svg = d3.select("svg#graph"),
    margin = {top: 20, right: 80, bottom: 30, left: 50},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  console.log(width);
  console.log(height);

var parseTime = d3.timeParse("%Y%m%d");

var x = d3.scaleLinear().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);

var line = d3.line()
    //.curve(d3.curveBasis)
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.gain); });


var buyer = [
    { date: 1, gain: 1 }
  , { date: 2, gain: 2 }
  , { date: 3, gain: 5 }
  , { date: 4, gain: 10 }
  , { date: 5, gain: 16 }
  ];

var seller = [
    { date: 1, gain: 0 }
  , { date: 2, gain: 0 }
  , { date: 3, gain: 0 }
  , { date: 4, gain: 20 }
  , { date: 5, gain: 25 }
  ];

  var data = buyer;   // We don't care which as long as we got the full width of the x axis
  var cities = [ { id: 'buyer', values: buyer }, { id: 'seller', values: seller } ];

  //var cities = data.columns.slice(1).map(function(id) {
    //return {
      //id: id,
      //values: data.map(function(d) {
        //return {date: d.date, gain: d[id]};
      //})
    //};
  //});

  //console.log(d3.extent(data, function(d) { return d.date; }));
  //console.log( d3.min(cities, function(c) { return d3.min(c.values, function(d) { return d.gain; }); }) );

  x.domain(d3.extent(data, function(d) { return d.date; }));

  y.domain([
    d3.min(cities, function(c) { return d3.min(c.values, function(d) { return d.gain; }); }),
    d3.max(cities, function(c) { return d3.max(c.values, function(d) { return d.gain; }); })
  ]);

  z.domain(cities.map(function(c) { return c.id; }));
  //console.log(cities.map(function(c) { return c.id; }));

  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
    .append("text")
      .attr("x", width)
      .attr("dy", "-0.71em")
      .attr("fill", "#000")
      .text("Stock price ($)");

  g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("fill", "#000")
      .text("Unit gain ($)");

  var city = g.selectAll(".city")
    .data(cities)
    .enter().append("g")
      .attr("class", "city");

  city.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return z(d.id); });

  city.append("text")
      .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.gain) + ")"; })
      .attr("x", 3)
      .attr("dy", "0.35em")
      .style("font", "10px sans-serif")
      .text(function(d) { return d.id; });

  // /GRAPH



}

function formatAmount (amount) {
  return '$ ' + (Math.round(amount * 100) / 100);
}

function formatPercent (amount) {
  return '' + (Math.round(amount * 1000) / 10) + ' %';
}


$('#data input').on('change keyup', calculate);
calculate();
