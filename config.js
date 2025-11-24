const FILTER = [
    // 'AAPL'
    //# 'XERS', 'PLTR', 'PRCH', 'RKLB', 'OKLO', 'SOFI', 'CRDO', 'HOOD', 'KOPN', 'SHOP',
    'XERS', 'CIFR', 'PLTR', /*PRCH',*/ 'RKLB', 'OKLO', 'SOFI', 'CRDO', 'HOOD', 'ABCL',
    // TMC', 'LEU','ABCL','SNDK','CIFR', 
];
const CONFIG = {
    // get_reset_window: (t) => { return getWeekName(new Date(t)); },
    // get_reset_window: (t) => { return getMonthName(new Date(t)); },
    // get_reset_window: (t) => { return getQuarterName(new Date(t)); },
    // get_reset_window: (t) => { return getYMD(new Date(t)) === '2025-10-20' ? true : getMonthName(new Date(t)) ; },
    // stop_pct: 0.80,
    algo_name: 'algo', // algo | algo1 | algo2 | algo3 | algo4
    algo: { /* F w/o RESET */
        crypto: 'X2',

        stocks: 'X',
        stop_pct: 1.0,

        // stocks: 'W',
        // stop_pct: 0.9,

        get_reset_window: (t) => { return getWeekName(new Date(t)); },
        // get_reset_window: (t) => { return getMonthName(new Date(t)); },
        // get_reset_window: (t) => { return getQuarterName(new Date(t)); },
        // get_reset_window: (t) => { return getYMD(new Date(t)); },

        //* BAR CHART WINDOW SIZE
        summary_window: 'months', //* days | weeks | months | quarters

        //* USE SETTING TO NORMALIZE INFO PAGE DATA TO THE SAME INVESTMENT
        // seed: 30,

        //* START OF DAY SELL, BUY WILL OCCUR ON SAME DAY BASED ON ALGO LOGIC
        sell_dates: ['2025-11-24'],
        // // sell_dates: [/*'2025-11-11',*/ '2025-11-13', '2025-11-14', '2025-11-17', '2025-11-18'],
        // // start: new Date(`2024-12-15T00:00:00`),

        start: new Date(`2025-03-15T00:00:00`),
        // start: new Date(`2024-12-15T00:00:00`),
        // end: new Date(`2025-10-10T23:59:59`),
        // end: new Date(`${getYMD(new Date())}T23:59:59`),
        // timeframe: '1D',
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
    symbol_groups: [
        {
            name: 'WEEK 48',
            include: true,
            symbols: [
                // 'WALD','TYRA','ZJK','NNOX','PACB','INV','ADPT','TNGX','JYD','GRI','PSNL','BCAX','AZTA','FEMY','QDEL','TRDA','NRIX','TXG','TXMD','OLMA','GNLN','TNDM','MYGN','REFR','QTRX',
                // 'SQQQ','WALD','EXAS','ANNX','TYRA','NRIX','ALGS','NNOX','SGML','KLRS','PSNL','TNGX','ZJK','ALMS','PACB','QTRX','TXMD','GCT','DMAC','BCAX','NAUT','QCLS','TRDA','ADPT','CBLL'
                'WALD','TYRA','ZJK','NNOX','PACB','INV','ADPT','TNGX','JYD','GRI','PSNL','BCAX','AZTA','FEMY','QDEL','TRDA','NRIX','TXG','TXMD','OLMA','GNLN','TNDM','MYGN','REFR','QTRX'

            ]//.sort(),
        },
        // {
        //     name: 'TOP 10',
        //     include: true,
        //     symbols: [
        //         ...FILTER.sort(),
        //         // 'MA',

        //     ].filter((v) => !['PLTR','SOFI','HOOD','CRDO',].includes(v)).sort(),
        // },
        {
            //# R & D
            name: 'R & D', //@ TOP SCORES
            // seed: 7.5,
            include: true,
            symbols: [
                // 'IXUS','TQQQ','VXUS','VUG','VTV','VOO','VTI','SPY','QQQ','DIA',
                ...scores
                    .filter((v) => v.score >= 4 && v.pct > 50)
                    .sort((a, b) => b.pct > a.pct ? 1 : -1)
                    .map((v) => v.symbol)
                    .slice(0, 19)
                    .filter((v) => !['RGTI','INDV','TTMI','PRCH',].includes(v))
                    .filter((v) => !FILTER.includes(v))
                    .sort(),
                // .filter((v) => !['APP', 'RGTI', 'EYE', 'GILT',].includes(v)),

                //* MAG 7
                // ...['GOOG','AMZN','AAPL','META','MSFT','NVDA','TSLA',].sort(),

                // * CRYPTO
                // 'AVAX/USD', 'BCH/USD', 'BTC/USD', 'DOGE/USD', 'ETH/USD', 'XRP/USD', 'SUSHI/USD',
            ]//.sort()
        },
        {
            //# STOCKS - MANUALLY CURATED
            name: 'STOCKS',
            include: true,
            // seed: 7.5,
            symbols: [
                ...['RING', 'IREN', 'CIFR', 'HUT', 'TMC', 'DDOG', 'GE', 'GEV', /*'IBM',*/ /*'NFLX',*/ 'OKLO', 'PSIX',
                'HOOD', /*'FGM',*/ 'AMD', 'AVGO', 'COIN', 'LEU', 'OPEN',
                'QUBT', 'RKLB', 'SMCI', 'SNDK', 'SNOW', 'TPB', 'TSEM', 'UUUU', 'SHOP', //'VIXY',
                'APH', /*'VTR',*/ 'LLY', 'GOOGL', ].filter((v) => !FILTER.includes(v)),
                'PLTR','SOFI','HOOD','CRDO','INDV','TTMI',

                // 'SNDK' //# testing

                // 'RING', 'IREN', 'CIFR', 'HUT', 'TMC', 'DDOG', 'GE', 'GEV', 'OKLO', 'PSIX',
                // 'HOOD', 'AMD', 'AVGO', 'COIN', 'LEU', 'OPEN',
                // 'QUBT', 'RKLB', 'SMCI', 'SNDK', 'SNOW', 'TPB', 'TSEM', 'UUUU', 'SHOP', 'APH', 
                // // 'VIXY',
                // // 'VTR', 'LLY', 'FGM', 'NFLX', 'IBM',  //# REMOVED: TOO LITTLE APY
                // // 'SNDK' //# testing
            ].sort(),
        },
        // {
        //     //# STOCKS - MANUALLY CURATED
        // {
        //     name: 'TOP',
        //     include: true,
        //     seed: 10,
        //     symbols: [
        //         // 'HOOD','GE','PLTR','LEU','OKLO',
        //         'PLTR', 'KOPN', 'RKLB', 'SHOP','GSIB',
        //     ].sort(),
        // },
        // { name: 'TOP_SCORES', include: false, symbols: scores.filter((v) => v.score >= 4).map((v) => v.symbol).sort() },
        // { name: 'ETF', symbols: ['ONEQ', 'AVDV', 'SPY', 'VOO', 'VTI', /*'IVES', NEEDS START DATE*/ ].sort() },
        // { name: 'TECH', symbols: [
        //     'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'FB', 'TSLA', 'NVDA', /*'ADBE',*/ 'INTC', 'CSCO', //# TECH
        //     'NVDA', 'AMD', 'INTC', /*'TXN',*/ 'QCOM', 'AVGO', 'MU', 'ASML', /*'LRCX',*/ 'KLAC', //# SEMICONDUCTORS
        // ].sort() },
        // { name: 'FOOD & BEV', symbols: ['KO', 'PEP', 'MCD', 'SBUX', 'CMG', 'YUM', 'MDLZ', 'GIS', 'KHC', 'TSN'].sort() },
        //# TOP 90
        // {
        //     name: 'TOP 90 d',
        //     include: true,
        //     // seed: 15,
        //     symbols: [
        //         'FLUX',
        //         'TNYA', 'FOSL', 'GEOS', 'GSIB', 'IBG', 'MFH',
        //         'PLUG', 'NBTX', 'NTLA', 'MU', 'CAMT',
        //         'BLNK', 'AXTI', 'BTDR', 'BTSG', 'CVRX',//'CTXR',
        //         'GLUE',//'FTRE',

        //         //# ALL
        //         // 'RING', 'IREN', 'CIFR', 'HUT', 'TMC', 'DDOG', 'GE', 'GEV', 'IBM', 'NFLX', 'OKLO', 'PSIX',
        //         // 'HOOD', 'FGM', 'AMD', 'AVGO', 'COIN', 'LEU', 'NIO', 'OPEN',
        //         // 'QUBT', 'RKLB', 'SMCI', 'SNDK', 'SNOW', 'TPB', 'TSEM', 'UUUU','SHOP', //'VIXY',

        //         // ...scores
        //         //     .filter((v) => v.score >= 4 && v.pct > 50)
        //         //     .sort((a, b) => b.pct > a.pct ? 1 : -1)
        //         //     .map((v) => v.symbol)
        //         //     .slice(0, 19)
        //         //     .filter((v) => !['RGTI',].includes(v)),


        //     ].sort()
        // },
        {
            name: 'CRYPTO',
            include: false,
            symbols: [
                // 'AAPL',
                'AVAX/USD', 'BCH/USD', 'BTC/USD', 'DOGE/USD', 'ETH/USD', 'XRP/USD', 'SUSHI/USD',

                // 'BAT/USD', 'PEPE/USD', 'XTC/USD', 'DOT/USD',  
                // 'TRUMP/USD', /* 'SHIB/USD', */ /* 'YFI/USD', */ 'SUSHI/USD',
                // 'AVAX/USD', 

                // 'BCH/USD', 'BTC/USD', 'DOGE/USD', 'ETH/USD', /* 'XRP/USD', */

                // 'GRT/USD', 'SOL/USD', 'UNI/USD',
            ].sort()
        },
        { name: 'AERO', symbols: ['BA', 'LMT', 'NOC', 'RTX', 'GD', 'HII', 'TXT', 'CW', 'AJRD', 'HEI'].sort() },
        { name: 'AIRLINES', symbols: ['AAL', 'DAL', 'UAL', 'LUV', 'ALK', 'JBLU', 'SAVE', 'CPA', 'FFT', 'HA'].sort() },
        { name: 'AUTOS', symbols: ['F', 'GM', 'HMC', 'TM', 'NIO', 'LI', 'RIVN', 'XPEV', 'LCID'].sort() },
        { name: 'BANKS', symbols: ['JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'AXP', 'BK', 'PNC', 'USB'].sort() },
        { name: 'CANNABIS', symbols: ['CGC', 'CRON', 'TLRY', 'APHA', 'NCBD', 'ACB', 'SLNG', 'VFF', 'HEXO', 'MJ'].sort() },
        { name: 'CLEAN ENERGY', symbols: ['TSLA', 'NEE', 'ENPH', 'SEDG', 'FSLR', 'BE', 'RUN', 'SPWR', 'PLUG', 'BLDP'].sort() },
        { name: 'ENERGY', symbols: ['XOM', 'CVX', 'COP', 'SLB', 'EOG', 'PSX', 'VLO', 'MPC', 'KMI', 'OXY'].sort() },
        { name: 'ETF', symbols: ['SPY', 'QQQ', 'DIA', 'IWM', 'VTI', 'VOO', 'EEM', 'GLD', 'SLV', 'TLT'].sort() },
        { name: 'FINANCE', symbols: ['JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'AXP', 'BK', 'PNC', 'USB'].sort() },
        { name: 'FOOD & BEV', symbols: ['KO', 'PEP', 'MCD', 'SBUX', 'CMG', 'YUM', 'MDLZ', 'GIS', 'KHC', 'TSN'].sort() },
        { name: 'GAMING', symbols: ['ATVI', 'EA', 'TTWO', 'ZNGA', 'UBSFY', 'NCVAF', 'CDR', 'GME', 'PLTK', 'RBLX'].sort() },
        { name: 'HEALTHCARE', symbols: ['JNJ', 'PFE', 'MRK', 'ABBV', 'TMO', 'UNH', 'MDT', 'BMY', 'AMGN', 'GILD'].sort() },
        { name: 'HOTELS', symbols: ['MAR', 'HLT', 'HST', 'WYNN', 'NCLH', 'CCL', 'RCL', 'IHG', 'EXPE', 'BKNG'].sort() },
        { name: 'INDUSTRIALS', symbols: ['BA', 'CAT', 'DE', 'GE', 'LMT', 'MMM', 'UTX', 'HON', 'FDX', 'UPS'].sort() },
        { name: 'INSURANCE', symbols: ['AIG', 'ALL', 'MET', 'PRU', 'TRV', 'HIG', 'CINF', 'PGR', 'WRB', 'L'].sort() },
        { name: 'MATERIALS', symbols: ['LIN', 'APD', 'ECL', 'SHW', 'DD', 'NEM', 'FCX', 'MLM', 'VMC', 'PPG'].sort() },
        { name: 'MEDIA', symbols: ['DIS', 'NFLX', 'CMCSA', 'CHTR', 'VIAC', 'T', 'VZ', 'ATVI', 'EA', 'TTWO'].sort() },
        { name: 'MISC', symbols: ['DIS', 'NFLX', 'PYPL', 'SQ', 'ZM', 'UBER', 'LYFT', 'TWTR', 'SNAP', 'SHOP'].sort() },
        { name: 'PHARMA', symbols: ['PFE', 'MRK', 'ABBV', 'BMY', 'AMGN', 'GILD', 'LLY', 'AZN', 'JNJ', 'RHHBY'].sort() },
        { name: 'PHOTOVOLTAIC', symbols: ['ENPH', 'SEDG', 'FSLR', 'SPWR', 'RUN', 'CSIQ', 'JKS', 'DQ', 'VSLR', 'SUNE'].sort() },
        { name: 'REAL ESTATE', symbols: ['AMT', 'PLD', 'CCI', 'EQIX', 'PSA', 'SPG', 'DLR', 'O', 'VTR', 'AVB'].sort() },
        { name: 'RETAIL', symbols: ['WMT', 'TGT', 'COST', 'HD', 'LOW', 'M', 'KSS', 'TJX', 'ROST', 'BBY'].sort() },
        { name: 'SEMICONDUCTORS', symbols: ['NVDA', 'AMD', 'INTC', 'TXN', 'QCOM', 'AVGO', 'MU', 'ASML', 'LRCX', 'KLAC'].sort() },
        { name: 'SOCIAL MEDIA', symbols: ['FB', 'TWTR', 'SNAP', 'PINS', 'TTD', 'SPOT', 'UBER', 'LYFT', 'TME', 'BILI'].sort() },
        { name: 'TECH', symbols: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'FB', 'TSLA', 'NVDA', 'ADBE', 'INTC', 'CSCO'].sort() },
        { name: 'TELECOM', symbols: ['VZ', 'T', 'TMUS', 'S', 'CHTR', 'CMCSA', 'DISH', 'CCI', 'LUMN', 'CTL'].sort() },
        { name: 'TRANSPORT', symbols: ['UPS', 'FDX', 'CHRW', 'JBHT', 'EXPD', 'KEX', 'MATX', 'GWR', 'NSC', 'UNP'].sort() },
        { name: 'UTILITIES', symbols: ['NEE', 'DUK', 'SO', 'AEP', 'EXC', 'D', 'PEG', 'SRE', 'ES', 'XEL'].sort() },
    ],
}