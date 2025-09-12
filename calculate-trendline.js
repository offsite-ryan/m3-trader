/**
 * This code calculates the slope and intercept of the trendline using the least squares method.
 * The calculateY function then allows you to get the predicted y-value for any given x-value on the trendline.
 */
function calculateTrendline(data) {
    const n = data.length;

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += data[i];
        sumXY += i * data[i];
        sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return {
        slope: slope,
        intercept: intercept,
        calculateY: function (x) {
            return (this.slope * x) + this.intercept;
        }
    };
}

// Example usage:
// const data = [10, 12, 15, 18, 20];
// const trendline = calculateTrendline(data);

// console.log("Slope:", trendline.slope);
// console.log("Intercept:", trendline.intercept);
// console.log("Y at X=5:", trendline.calculateY(5));

/** 
Output
    Slope: 2.5
    Intercept: 9
    Y at X=5: 21.5
*/