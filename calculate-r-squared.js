function calculateRSquared(x, y) {
    const n = x.length;

    if (n !== y.length || n < 2) {
        throw new Error("Input arrays must have the same length and contain at least two points.");
    }

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;
    let sumY2 = 0;

    for (let i = 0; i < n; i++) {
        sumX += x[i];
        sumY += y[i];
        sumXY += x[i] * y[i];
        sumX2 += x[i] * x[i];
        sumY2 += y[i] * y[i];
    }

    const ssxx = sumX2 - (sumX * sumX) / n;
    const ssyy = sumY2 - (sumY * sumY) / n;
    const ssxy = sumXY - (sumX * sumY) / n;

    const r = ssxy / Math.sqrt(ssxx * ssyy);
    const rSquared = r * r;

    return rSquared;
}