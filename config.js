const CONFIG = {
    // get_reset_window: (t) => { return getWeekName(new Date(t)); },
    // get_reset_window: (t) => { return getMonthName(new Date(t)); },
    // get_reset_window: (t) => { return getQuarterName(new Date(t)); },
    // get_reset_window: (t) => { return getYMD(new Date(t)) === '2025-10-20' ? true : getMonthName(new Date(t)) ; },
    // stop_pct: 0.80,
    algo_name: 'algo', // algo | algo1 | algo2 | algo3 | algo4
    algo: { /* F w/o RESET */
        //# VERY BASIC BUY AND HOLD w/ STOP_LOSS [ 141 % | 165 % ]
        crypto: 'X',
        stocks: 'X',
        stop_pct: 0.85,
        get_reset_window: (t) => { return getWeekName(new Date(t)); },
        // get_reset_window: (t) => { return getMonthName(new Date(t)); },
        summary_window: 'months', // days | weeks | months | quarters
    },
    algo1: { /* STANDARD */
        crypto: 'X',
        stocks: 'F',
        // get_reset_window: (t) => { return getWeekName(new Date(t)); },
        get_reset_window: (t) => { return getMonthName(new Date(t)); },
        summary_window: 'months', // days | weeks | months | quarters
    },
    algo2: { /* WEEKS */
        crypto: 'F',
        stocks: 'Z',
        get_reset_window: (t) => { return getWeekName(new Date(t)); },
        summary_window: 'months', // days | weeks | months | quarters
    },
    algo3: { /* MONTHS */
        crypto: 'F',
        stocks: 'X',
        get_reset_window: (t) => { return getMonthName(new Date(t)); },
        summary_window: 'months', // days | weeks | months | quarters
    },
    algo4: { /* BUY AND HOLD w/ STOP_LOSS && MONTH RESET */
        crypto: 'X',
        stocks: 'X',
        stop_pct: 0.95,
        get_reset_window: (t) => { return getMonthName(new Date(t)); },
        summary_window: 'months', // days | weeks | months | quarters
    },
    algo5: { /* BUY AND HOLD w/ QUARTER RESET */
        crypto: 'X',
        stocks: 'X',
        // stop_pct: 0.95,
        get_reset_window: (t) => { return getQuarterName(new Date(t)); },
        summary_window: 'months', // days | weeks | months | quarters
    },
    algo6: { /* STANDARD */
        crypto: 'X',
        stocks: 'F',
        get_reset_window: (t) => { return getWeekName(new Date(t)); },
        // get_reset_window: (t) => { return (new Date(t).getDate() <= 15).toString(); },
        summary_window: 'weeks', // days | weeks | months | quarters
    },
    // initial_seed: 1000, // per symbol

    // symbol_overrides: {
    //     // 'AAPL': { seed: 5000 },
    //     // 'TSLA': { seed: 2000 },
    // },
}