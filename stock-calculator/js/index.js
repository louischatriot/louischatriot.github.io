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

  var gains = calculateGain(optionExercisePrice, stockMarketValue, yearsBeforeLiquidity, cutoffCAGR, shareOfGains, numberOptions)
    , buyerGainPercent = (gains.buyerGain / optionExercisePrice) - 1
    , buyerGainPercentAnnual = Math.pow(1 + buyerGainPercent, 1 / yearsBeforeLiquidity) - 1
    ;

  if (isNaN(gains.buyerGain)) {
    $('#output').css('display', 'none');
    $('svg').css('display', 'none');
  } else {
    $('#output').css('display', 'block');
    $('svg').css('display', 'block');

    $('#buyer-paid').html(formatAmount(optionExercisePrice));
    $('#buyer-gain').html(formatAmount(gains.buyerGain));
    $('#buyer-net-gain').html(formatAmount(gains.buyerGain - optionExercisePrice));
    $('#buyer-total-growth').html(formatPercent(buyerGainPercent));
    $('#buyer-annual-growth').html(formatPercent(buyerGainPercentAnnual));
    $('#buyer-total-net-gain').html(formatAmount((gains.buyerGain - optionExercisePrice) * numberOptions));
    $('#seller-gain').html(formatAmount(gains.sellerGain));

    // Graph
    var buyer = [], seller = []
      , buyerRoi = [], sellerRoi = []
      ;
    for (var i = 0; i < 10; i += 0.1) {
      gains = calculateGain(optionExercisePrice, i, yearsBeforeLiquidity, cutoffCAGR, shareOfGains, numberOptions);
      buyer.push({ stockPrice: i, gain: gains.buyerGain });
      seller.push({ stockPrice: i, gain: gains.sellerGain });

      buyerRoi.push({ stockPrice: i, gain: 100 * (Math.pow(gains.buyerGain / optionExercisePrice, 1 / yearsBeforeLiquidity) - 1) });
    }

    graph('#gain', [ { id: 'buyer', values: buyer }, { id: 'seller', values: seller } ], 'Unit gain ($)');
    graph('#roi', [ { id: 'buyer', values: buyerRoi } ], 'Annual CAGR (%)');
  }
}

function graph (elementId, cities, yAxisTitle) {
  $(elementId).attr('width', $(elementId).width());
  $(elementId).attr('height', $(elementId).height());
  $(elementId).html('');
  var svg = d3.select(elementId),
      margin = {top: 20, right: 80, bottom: 30, left: 50},
      width = svg.attr("width") - margin.left - margin.right,
      height = svg.attr("height") - margin.top - margin.bottom,
      g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scaleLinear().range([0, width]),
      y = d3.scaleLinear().range([height, 0]),
      z = d3.scaleOrdinal(d3.schemeCategory10);

  var line = d3.line()
      .x(function(d) { return x(d.stockPrice); })
      .y(function(d) { return y(d.gain); });

  var data = cities[0].values;   // We don't care which as long as we got the full width of the x axis

  x.domain(d3.extent(data, function(d) { return d.stockPrice; }));

  y.domain([
    d3.min(cities, function(c) { return d3.min(c.values, function(d) { return d.gain; }); }),
    d3.max(cities, function(c) { return d3.max(c.values, function(d) { return d.gain; }); })
  ]);

  z.domain(cities.map(function(c) { return c.id; }));

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
      .text(yAxisTitle);

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
      .attr("transform", function(d) { return "translate(" + x(d.value.stockPrice) + "," + y(d.value.gain) + ")"; })
      .attr("x", 3)
      .attr("dy", "0.35em")
      .style("font", "10px sans-serif")
      .text(function(d) { return d.id; });

  // Grid
  function make_x_gridlines() { return d3.axisBottom(x).ticks(5); }
  function make_y_gridlines() { return d3.axisLeft(y).ticks(5); }

  g.append("g")
      .attr("class", "grid")
      .attr("transform", "translate(0," + height + ")")
      .call(make_x_gridlines()
          .tickSize(-height)
          .tickFormat("")
      );

  g.append("g")
      .attr("class", "grid")
      .call(make_y_gridlines()
          .tickSize(-width)
          .tickFormat("")
      );
}

function formatAmount (amount) {
  return '$ ' + (Math.round(amount * 100) / 100);
}

function formatPercent (amount) {
  return '' + (Math.round(amount * 1000) / 10) + ' %';
}


$('#data input').on('change keyup', calculate);
calculate();
