"use strict";
function calculateBollingerBands(data, period = 20, multiplier = 2) {
    // Calculate the simple moving average (SMA)
    const sma = [];
    for (let i = period - 1; i < data.length; i++) {
        const sum = data.slice(i - period + 1, i + 1).reduce((acc, value) => acc + value, 0);
        sma.push(sum / period);
    }

    // Calculate standard deviation
    const standardDeviation = [];
    for (let i = period - 1; i < data.length; i++) {
        const slice = data.slice(i - period + 1, i + 1);
        const mean = sma[i - period + 1];
        const squaredDifferences = slice.map(value => Math.pow(value - mean, 2));
        const variance = squaredDifferences.reduce((acc, value) => acc + value, 0) / period;
        standardDeviation.push(Math.sqrt(variance));
    }

    // Calculate upper and lower bands
    const upperBand = sma.map((value, i) => value + multiplier * standardDeviation[i]);
    const lowerBand = sma.map((value, i) => value - multiplier * standardDeviation[i]);

    return { sma, upperBand, lowerBand };
}

function applyBands(bars, period = 14, multiplier = 0.7, stop_pct = 0.9) {
    const bandsClose = calculateBollingerBands(bars.map((b) => b.c), period, multiplier);
    // const bandsClose = calculateBollingerBands(entry.bars.map((b) => b.c), 30, 1.7);
    // const bandsClose = calculateBollingerBands(entry.bars.map((b) => b.c), 7, 1);
    // const bandsClose = calculateBollingerBands(entry.bars.map((b) => b.c), 20, 2);
    const end = bandsClose.sma.length - 1;
    for (let i = end; i >= 0; i--) {
        const index = (bars.length - 1) - (end - i);  /** offset the bollinger bar null values */
        if (bars[index]) {
            bars[index].bands_c = {
                sma: bandsClose.sma[i],
                lowerBand: bandsClose.lowerBand[i],
                upperBand: bandsClose.upperBand[i],
                delta: bandsClose.upperBand[i] - bandsClose.sma[i],
                stop: bandsClose.lowerBand[i] * stop_pct,
            };
        } else {
            bars[i].bands_c = {
                sma: 0,
                lowerBand: 0,
                upperBand: 0,
                delta: 0,
                stop: 0,
            };
        }
    }
}