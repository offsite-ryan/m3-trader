function exponentialTrendline(data) {
    const n = data.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    // Transform y-values and calculate sums
    const transformedData = data.map(([x, y]) => [x, Math.log(y)]);
    for (const [x, transformedY] of transformedData) {
        sumX += x;
        sumY += transformedY;
        sumXY += x * transformedY;
        sumX2 += x * x;
    }

    // Calculate slope (b) and y-intercept (ln(a))
    const b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const lnA = (sumY - b * sumX) / n;
    const a = Math.exp(lnA);

    return {
        calculateY: function (x) {
            return a * Math.exp(b * x);
        }
    };
    
    // Return the trendline function
    // return function (x) {
    //     return a * Math.exp(b * x);
    // };
}