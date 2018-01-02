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



  console.log("======================");
  console.log(cutoffCAGR_totalGrowth);
  console.log(cutoffCAGR_unitPrice);
  console.log(shareOfGains_totalGrowth);
  console.log(shareOfGains_unitPrice);


  console.log("=======");
  console.log(buyerGain);
  console.log(sellerGain);

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

  console.log('--------------------------------');
  console.log(optionExercisePrice);
  console.log(stockMarketValue);
  console.log(yearsBeforeLiquidity);
  console.log(cutoffCAGR);
  console.log(shareOfGains);
  console.log(numberOptions);

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




}

function formatAmount (amount) {
  return '$ ' + (Math.round(amount * 100) / 100);
}

function formatPercent (amount) {
  return '' + (Math.round(amount * 1000) / 10) + ' %';
}


$('#data input').on('change keyup', calculate);
calculate();
