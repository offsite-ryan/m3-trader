"use strict";

// // Store a reference to the original console.log function
// const originalConsoleLog = console.log;

// // Override console.log with your custom function
// console.log = function () {
//     // Add your custom logic here
//     // For example, you could add a timestamp or send logs to a different service
//     const timestamp = new Date().toISOString();
//     const args = Array.from(arguments); // Convert arguments object to an array

//     // Call the original console.log with the modified arguments
//     originalConsoleLog.apply(console, [`[${timestamp}]`, ...args]);
// };

let writeToConsole = true;
// writeToConsole = false;
function group(...args) {
    if (writeToConsole) {
        console.group(...args);
    }
}
function groupEnd() {
    if (writeToConsole) {
        console.groupEnd();
    }
}
function debug(...args) {
    if (writeToConsole) {
        console.debug(...args);
    }
}
function log(...args) {
    if (writeToConsole) {
        console.log(...args);
    }
}
function info(...args) {
    if (writeToConsole) {
        console.info(...args);
    }
}
function warn(...args) {
    if (writeToConsole) {
        console.warn(...args);
    }
}
function error(...args) {
    if (writeToConsole) {
        console.error(...args);
    }
}
function table(...args) {
    if (writeToConsole) {
        console.table(...args);
    }
}

function reduceArray(arr, defaultValue = 0) {
    if (arr.length === 0) return defaultValue;
    return arr.reduce((p, c) => p + c, 0);
}
/**
 * get number of months between 2 dates
 * Ensure date1 is the earlier date and date2 is the later date for consistent calculation
 * @returns number of months between date1 and date2
 */
function getMonthDifference(date1, date2) {
    // Ensure date1 is the earlier date and date2 is the later date for consistent calculation
    const startDate = date1 < date2 ? date1 : date2;
    const endDate = date1 < date2 ? date2 : date1;

    let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
    months -= startDate.getMonth();
    months += endDate.getMonth();

    return months;
}

// /** download data file */
async function download(filename, obj) {
    const contents = JSON.stringify(obj, null, 2);
    const blob = new Blob([contents], { type: 'text/plain' });
    const fileURL = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = fileURL;
    downloadLink.download = `${filename}.json`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    await sleep(2000); // Sleep for 1 second to avoid rate limiting
};
// =================================================
// ITERATE DAYS
// =================================================
async function iterate_days(start = getDateString(START_OF_YEAR).s, sleep_time = 3000, callback_day = async (d) => { }, callback_done = async () => { }) {
    auto_refresh = false;
    days_total = 0;
    days = 1;
    let t = getYMD(start);

    while (true) {

        await callback_day(t);
        await sleep(sleep_time);

        t = new Date(new Date(t).getTime() + (days * 24 * 60 * 60 * 1000)).toISOString().substring(0, 10);
        if (new Date(getDateString(t).s).getTime() >= new Date(getDateString(getTodayLocal()).e).getTime()) {
            break;
        }
    }
    callback_done();
    auto_refresh = true;
    console.log('iterate_days: DONE');
}

// =================================================
// SLEEP
// =================================================
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// =================================================
// GET HOUR MINUTE AS NUMBER (8:32 -> 832)
// =================================================
function getHMM(date) {
    const d = new Date(date);
    let v = d.getHours() * 100;
    v += d.getMinutes();
    return v;
}

// =================================================
// GET YEAR-MONTH-DAY
// =================================================
function getYMD(date, includeYear = true) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    // return '2025-06-04'
    return (includeYear ? [year, month, day] : [month, day]).join('-');
}

// =================================================
// GET YEAR-MONTH-DAY
// =================================================
function isToday(date) {
    return getYMD(new Date()) === getYMD(date);

}

// =================================================
// GET TODAY LOCAL
// =================================================
function getTodayLocal() {
    const d = new Date();
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    // return '2025-06-04'
    return [year, month, day].join('-');
}
console.log('today local:', getTodayLocal());

// =================================================
// GET DATE STRING
// =================================================
function getDateString(d) {
    const tzOffset = new Date(d).getTimezoneOffset() / 60; // Get timezone offset in hours
    let s = `${d}T00:00:00-0${tzOffset}:00`; // get start of day in local time
    let e = `${d}T23:59:59-0${tzOffset}:00`; // get end of day in local time
    return { s, e };
}


// =================================================
// REPLACE ALL
// =================================================
const replaceAll = (text, search, replace) => {
    while (text.indexOf(search) >= 0) {
        text = text.replace(search, replace);
    }
    return text;
}

// =================================================
// DEEP CLONE
// =================================================
function deepClone(obj) {
    if (typeof obj !== "object" || obj === null) {
        return obj;
    }

    const clonedObj = Array.isArray(obj) ? [] : {};

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            clonedObj[key] = deepClone(obj[key]);
        }
    }

    return clonedObj;
}

// =================================================
// DAY HOUR AS NUMBER
// =================================================
function dayHour(date) {
    const d = new Date(date);
    const h = d.getHours();
    const m = d.getMinutes();

    return `${(h * 100) + m}`;
}

const round = (v) => { return Math.round(v * 1) / 1; }
const round1 = (v) => { return Math.round(v * 10) / 10; }
const round2 = (v) => { return Math.round(v * 100) / 100; }
const round3 = (v) => { return Math.round(v * 1000) / 1000; }
const round4 = (v) => { return Math.round(v * 10000) / 10000; }
const round5 = (v) => { return Math.round(v * 100000) / 100000; }
const round6 = (v) => { return Math.round(v * 1000000) / 1000000; }

// =================================================
// DATE EXTENSIONS
// =================================================
// This script is released to the public domain and may be used, modified and
// distributed without restrictions. Attribution not necessary but appreciated.
// Source: https://weeknumber.com/how-to/javascript

// Returns the ISO week of the date.
Date.prototype.getWeek = function () {
    var date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    var week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
        - 3 + (week1.getDay() + 6) % 7) / 7);
}

// Returns the four-digit year corresponding to the ISO week of the date.
Date.prototype.getWeekYear = function () {
    var date = new Date(this.getTime());
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    return date.getFullYear();
}
function reduceArray(arr, defaultValue = 0) {
    if (arr.length === 0) return defaultValue;
    return arr.reduce((p, c) => p + c, 0);
}
function getMonthName(d) {
    const getMonthName = (month) => {
        return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month];
    }
    return d.getFullYear() + '_' + (d.getMonth() + 1).toString().padStart(2, '0') + '_' + getMonthName(d.getMonth());
}
function getWeekName(d) {
    return d.getFullYear() + '_' + d.getWeek().toString().padStart(2, '0');
}
function getQuarterName(d) {
    let q = d.getMonth() + 1;
    q = q < 4 ? 1 : (q < 7 ? 2 : (q < 10 ? 3 : 4));
    let quarter = d.getFullYear() + '_' + (q).toString().padStart(2, '0');
    return quarter;
}
/**
 * Displays a simple vertical bar chart in the console using the provided data array.
 * Each value in the data array is represented as a column of bars.
 * @param {number[]} data - Array of numbers (0- 10) to visualize as a chart.
 */
console.chart = function (data, group = '-') {
    // const cols = data.map((v, i)=>i+1)
    // console.log(data);
    cumulativeSumArray(data);

    const max = Math.max(...data);
    const min = Math.min(...data);
    // data = data.map((v) => v / max * 100 / 10);
    data = data.map((v) => round(v / (max + Math.abs(min)) * 100 / 10));
    let msg = '%c';
    msg += [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        .filter((v) => v <= Math.max(...data) - 0)
        .map((v, i) => data.map((v2, i2) => v2 >= (i + 1) ? ' █' : '  ')
            .join(''))
        .reverse()
        .join('\n');
    msg += '%c\n' + '─'.repeat(data.length * 2) + '\n%c';
    msg += [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        .filter((v) => (v) <= Math.abs(Math.min(...data) - 0))
        .map((v, i) => data.map((v2, i2) => v2 < 0 && Math.abs(v2) >= (i + 1) ? ' █' : '  ')
            .join(''))
        .join('\n');
    console.log(msg, 'color:lime; font-size:8px; line-height:8px;', 'color:white; font-size:8px; line-height:8px;', 'color:red; font-size:8px; line-height:8px;');
    // console.log(data);
    // cumulativeSumArray(data);

    // const consoleMessage = "This is a multiline\nconsole message that\nwe want to convert to HTML.";


    // Create a <pre> element and set its text content
    const preElement = document.createElement('pre');
    // msg = replaceAll(msg, ' █ ', '█');
    msg = replaceAll(msg, '_', '&#9472;');
    let split = msg.split('%c');
    split[0] = `<span style="font-size:24px;">${group}<hr/></span>`;
    split[1] = `<span style="color:lime;">${split[1]}</span>`;
    split[3] = `<span style="color:red;">${split[3]}</span>`;
    // const htmlContent = replaceAll(msg,'%c',''); //.replace(/\n/g, '<br>');
    preElement.innerHTML = `<span class="w3-padding w3-center w3-col ${group.startsWith('OPEN POSITIONS') ? 's12' : 's12 m4'}">${split.join('')}</span>`;
    // preElement.innerHTML = split.join('');

    // Assuming you have an HTML element with id="output"
    const outputContainer = document.getElementById('output');
    if (outputContainer) {
        // outputContainer.innerHTML = ''; // Clear previous content
        outputContainer.appendChild(preElement);
    }
}
function reduceObjectValues(obj, defaultValue = 0) {
    const values = Object.values(obj);
    if (values.length === 0) {
        return defaultValue;
    }
    return values.reduce((p, c) => p + c, 0);
}
function cumulativeSumArray(arr = [1, 3, 5, 7, 9, 11]) {
    const cumulativeSumArray = arr.reduce((accumulator, currentValue) => {
        const lastSum = accumulator.length > 0 ? accumulator[accumulator.length - 1] : 0;
        accumulator.push(lastSum + currentValue);
        return accumulator;
    }, []); // Initialize accumulator as an empty array

    // console.log(cumulativeSumArray);
}
