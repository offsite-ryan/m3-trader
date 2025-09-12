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

