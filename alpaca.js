"use strict";
// =================================================
// ALPACA DATA BARS
// =================================================
class AlpacaData {
    baseUrl = `https://data.alpaca.markets`;
    ALPACA_KEY = null;
    ALPACA_SECRET = null;
    START_OF_YEAR = null;
    constructor(key, secret, start_of_year = '2024-12-29T00:00:00-05:00') {
        this.ALPACA_KEY = key;
        this.ALPACA_SECRET = secret;
        this.START_OF_YEAR = start_of_year;
    }

    // /** ADD MISSING DATA */
    addMissingData(data, symbol = '-', end = new Date(Date.now() - (1 * 60 * 1000))) {

        /** create empty array off HMM for the day (0 - 1440) */
        const data2 = [];
        for (let x = 0; x < 1440; x++) {
            const start = new Date(end.split('T')[0] + 'T00:00:00').getTime();
            const d = new Date(start + (x * 60 * 1000));
            const thm = getHMM(d);
            const e = d.getTime();
            data2.push({ thm, e, t: d.toISOString(), tl: d.toLocaleString() });
        }

        /** assign objects for API call to the empty array */
        data.forEach((v, i) => {
            const index = data2.findIndex((v2) => v.thm === v2.thm);
            Object.assign(data2[index], v);
        })

        // /** populate missing entries with the last value */
        const data3 = [];
        let last = data[0];
        data2.forEach((v, i) => {
            if (!v.c) {
                if (i === 0) {
                    /** handle empty at start */
                }
                const v2 = deepClone(v);
                v2.p = last.p;
                v2.c = last.c;
                v2.o = last.o;
                v2.h = last.h;
                v2.l = last.l;
                v2.n = last.n;
                v2.v = last.v;
                v2.vw = last.vw;
                // data2[i] = v2;
                v = v2;
            }
            data3.push(v);
            last = v;
        })
        return data3.filter((v) => v.e <= Date.now());
    }
    // /** ADD META DATA */
    addMetaData(data) {
        data.forEach((v, i) => {
            const d = new Date(v.t);
            v.e = d.getTime();
            v.tl = d.toLocaleString();
            v.thm = (d.getHours() * 100) + d.getMinutes();
            v.dow = d.getDay();
        })
        return data;
    }
    addBollingerBands(key = 'bands_c', data, period = 14, multiplier = 0.7, stop_pct = 0.9) {
        applyBands(data, period, multiplier, stop_pct);
        data.forEach((v) => {
            if (!v[key]) {
                v[key] = { sma: 0, lowerBand: 0, upperBand: 0, delta: 0, stop: 0 };
            }
        })
        return data;
    }
    addTrendlines(data) {
        data.forEach((v, i) => {
            if (i > 5) {
                const tl = calculateTrendline(data.slice(i - 5, i).map((v) => v.c));
                v.tl5 = tl.calculateY(6);
            } else {
                v.tl5 = v.c;
            }
        })
        return data;
    }
    refactor(symbol, data) {
        const obj = [];
        data.forEach((v) => {
            obj.push({
                s: symbol,
                tl: v.tl,
                thm: v.thm,
                c: v.c,
                o: v.o,
                h: v.h,
                l: v.l,
                t: v.t,
                e: v.e,
                n: v.n,
                v: v.v,
                vw: v.vw,
                sma: v.bands_c.sma,
                stop: v.bands_c.stop,
                lb: v.bands_c.lowerBand,
                ub: v.bands_c.upperBand,
                p5: v.tl5,
                dow: v.dow,
            });
        });
        return obj;
    }
    async analyze(symbol, bars, reset = true, seed = 1000) {
        return new Promise(async (resolve) => {
            // const invest_schedule = [
            //     { t: '2024-01-05', e: 1704499200000, amount: 1000 }
            // ];
            let was_below = true;
            let was_above = true;
            let own_at = -1;
            let g = 0;
            let g_dollars = 0;
            let g_dollars_fixed = 0;
            let trades = [];
            const algos = {
                //#region CALCS
                default_gain_pct: (i1, i2) => (bars[i2].c - bars[i1].o) / bars[i1].o * 100,
                default_gain_1K: (i1, i2) => (1000 / bars[i1].o) * (bars[i2].c - bars[i1].o),
                //#endregion

                //#region STOCKS
                A: { buy: (v, i) => v.o >= v.ub, sell: (v, i) => v.c <= v.ub, },
                B: { buy: (v, i) => v.o >= v.lb, sell: (v, i) => v.c <= v.ub },
                C: { buy: (v, i) => v.sma >= v.lb, sell: (v, i) => false },
                D: { buy: (v, i) => v.c >= v.sma, sell: (v, i) => v.c <= v.lb },
                E: { buy: (v, i) => v.o >= v.sma, sell: (v, i) => v.c < v.sma }, //# GOOD ONE */
                F: { buy: (v, i) => v.o >= v.lb, sell: (v, i) => v.c < v.lb, },
                G: { buy: (v, i) => v.c >= v.lb && v.p5 >= v.c, sell: (v, i) => v.c < v.lb },
                H: { buy: (v, i) => v.o >= v.lb, sell: (v, i) => true }, // buy/sell each day if above lower bound
                X: { buy: (v, i) => v.o >= v.lb, sell: (v) => v.c < v.stop }, //! stop loss
                Y: { buy: (v, i) => v.o >= v.lb, sell: (v) => false },
                Z: { buy: (v, i) => true, sell: (v) => false },
                //#endregion

                //#region CRYPTO
                C1: { buy: (v, i) => v.o >= v.sma, sell: (v) => v.c <= v.lb },
                C2: { buy: (v, i) => v.o >= v.lb, sell: (v) => v.c <= v.ub },
                C3: { buy: (v, i) => v.c >= v.o, sell: (v) => v.c <= v.o },
                //#endregion

                //#region IDEAS
                // C: { buy: (v, i) => v.sma >= v.lb, sell: (v, i) => v.c <= v.ub },
                // H: { buy: (v, i) => v.c >= v.p5, sell: (v, i) => v.c < v.p5 },
                // FC: {
                //     buy: (v, i) => v.c >= v.lb,
                //     sell: (v, i) => v.c < v.lb,
                //     gain: (v, i) => (bars[i].c - bars[own_at].c) / bars[own_at].c * 100,
                // },
                // FO: {
                //     buy: (v, i) => v.o >= v.lb,
                //     sell: (v, i) => v.o < v.lb,
                //     gain: (v, i) => (bars[i].o - bars[own_at].o) / bars[own_at].o * 100,
                // },
                FOC: {
                    buy: (v, i) => v.o >= v.lb,
                    sell: (v, i) => v.c < v.lb,
                    gain_pct: (v, i) => (bars[i].c - bars[own_at].o) / bars[own_at].o * 100,
                    gain_1K: (v, i) => (1000 / bars[own_at].o) * (bars[i].c - bars[own_at].o)
                },
                //#endregion
            };
            const isCrypto = symbol.endsWith('USD');
            // const algo = isCrypto ? 'A' : 'A';
            // const algo = isCrypto ? 'F' : 'F';
            const algo = isCrypto ? 'E' : 'X';
            // const algo = isCrypto ? 'X' : 'X';
            // const algo = 'F';

            if (bars) {
                /** ADD TRADE @param {*} v - bar object, @param {*} i1 - buy index @param {*} i2 - sell index*/
                const push_trade = (v, i1, i2) => {
                    trades.push({
                        s: symbol,
                        o: bars[i1].o,
                        c: bars[i2].c,
                        q: 1000 / bars[i1].o,
                        gain_pct: algos[algo].gain_pct ? algos[algo].gain_pct(v, i2) : algos.default_gain_pct(i1, i2),
                        gain_1K: algos[algo].gain_1K ? algos[algo].gain_1K(v, i2) : algos.default_gain_1K(i1, i2),
                        num_days: i2 - i1,
                        i1,
                        i2,
                        e1: bars[i1].e,
                        e2: bars[i2].e,
                        t1: getYMD(bars[i1].tl),
                        t2: getYMD(bars[i2].tl),
                    });
                }
                // const get_window = (t) => { return new Date(t).getDate() === 1; };
                // const get_window = (t) => { return new Date(t).getDay() === 5; };
                // const get_window = (t1, t2) => { return (new Date(t2).getTime() - new Date(t1).getTime()) > (7*24*60*60*1000); };
                const get_window = (t) => { return new Date(t).getMonth(); };
                // const get_window = (t) => { return getWeekName(new Date(t)); };
                // const get_window = (t) => { return getMonthName(new Date(t)); };
                let last = get_window(bars[0].t);
                bars.forEach((v, i) => {
                    if (v.sma) {
                        const current = get_window(v.t);
                        if (current !== last && own_at > - 0) {
                            if (reset) {
                                push_trade(v, own_at, i);
                                own_at = -1;
                            }
                            last = current;
                        }
                        // if (own_at >= 0 && get_window(bars[own_at].t, v.t)) {
                        //     push_trade(v, own_at, i);
                        //     own_at = -1;
                        //     // last = current;
                        // }
                        // if (own_at >= 0 && get_window(v.t)) {
                        //     push_trade(v, own_at, i);
                        //     own_at = -1;
                        // }

                        if (v.c >= v.ub) {
                            was_above = true;
                        }
                        if (v.c <= v.lb) {
                            was_below = true;
                        }
                        // * BUY * //
                        if (algos[algo].buy(v, i)) {
                            if (was_below === true && own_at === -1) {
                                // if (TRADE) {
                                //     buy(symbol, 5000); // TODO: change to INVVESTMENT_SEED
                                // }
                                own_at = i;
                            }
                            // own_at = i;
                        }
                        // * SELL * //
                        else if (algos[algo].sell(v, i)) {
                            if (own_at >= 0) {
                                // if (TRADE) {
                                //     sell(symbol);
                                // }
                                push_trade(v, own_at, i);
                                // trades.push({
                                //     s: symbol,
                                //     o: bars[own_at].o,
                                //     c: bars[i].c,
                                //     gain_1K: (1000 / bars[own_at].o) * (bars[i].c - bars[own_at].o),
                                //     // q: bars[own_at].o,
                                //     num_days: i - own_at,
                                //     1: own_at,
                                //     2: i,
                                //     gain: algos[algo].gain(v, i),
                                //     // gain: (bars[i].c - bars[own_at].c) / bars[own_at].c * 100,
                                //     // gain: (bars[i].c - bars[own_at].o) / bars[own_at].o * 100,
                                //     e1: bars[own_at].e,
                                //     e2: v.e,
                                //     t1: getYMD(bars[own_at].tl),
                                //     t2: getYMD(v.tl),
                                // });
                                own_at = -1;
                            }
                        }
                    }
                    if (i === bars.length - 1) {
                        if (own_at > -1) {
                            const gain = (bars[i].c - bars[own_at].o) / bars[own_at].o * 100
                            //*     ? (bars[i].c - bars[own_at].c) / bars[own_at].c * 100
                            //*     : (bars[i].c - bars[own_at].o) / bars[own_at].o * 100;
                            push_trade(v, own_at, i);
                            // trades.push({
                            //     s: symbol,
                            //     o: bars[own_at].o,
                            //     c: bars[i].c,
                            //     gain_1K: (1000 / bars[own_at].o) * (bars[i].c - bars[own_at].o),
                            //     // q: bars[own_at].o,
                            //     num_days: i - own_at,
                            //     1: own_at,
                            //     2: i, gain,
                            //     e1: bars[own_at].e,
                            //     e2: v.e,
                            //     t1: getYMD(bars[own_at].tl),
                            //     t2: getYMD(v.tl),
                            // });
                        }
                    }
                });
                let cumulative = 0;
                // let cumulative_dollars = seed;
                // let fixed_dollars = seed;
                trades.forEach((v) => {
                    cumulative += v.gain_1K;
                    v.cumulative = cumulative;
                    // v.g_cumulative_seed = cumulative_dollars;
                    // v.g_fixed_seed = seed;

                    // // /** FIXED INVESTMENT */
                    // fixed_dollars += seed * (v.gain / 100);
                    // // /** RE-INVEST GAINS (+/-) */
                    // cumulative_dollars += cumulative_dollars * (v.gain / 100);

                    // // v.gain_cumulative = cumulative;
                    // // v.gain_dollars = cumulative_dollars;
                    // v.g_fixed = fixed_dollars;
                    // v.g_fixed_pct = ((fixed_dollars / seed)) * 100; // remove the seed (-1)
                    // v.g_cumulative = cumulative_dollars;
                    // v.g_cumulative_pct = ((cumulative_dollars / seed)) * 100; // remove the seed (-1)

                    // v.g_cumulative_pct_diff = ((cumulative_dollars / fixed_dollars) - 1) * 100; // remove the seed (-1)
                });
                // g = reduceArray(trades.map((v) => v.gain));
                // g_dollars = cumulative_dollars;
                // g_dollars_fixed = fixed_dollars;
            };
            const last = bars[bars.length - 1];
            resolve({
                symbol,
                // gain_pct: g,
                // gain_dollars: g_dollars,
                // gain_dollars_fixed: g_dollars_fixed,
                own: own_at,
                buy: last.o >= last.lb,
                sell: last.c <= last.lb,
                bars,
                trades
            });
            bars = undefined;
            trades = undefined;
            // return data;
        });
    }
    async summarize(res) {
        return new Promise(async (resolve) => {
            /** MONTH SUMMARIES */
            let summary_months = {};
            let summary_weeks = {};
            let summary_quarters = {};
            let summary_month_total = 0;
            res.trades.forEach((v, i) => {
                // const getMonthName = (month) => {
                //     return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month];
                // }
                // const d = new Date(v.e2);
                // let month = d.getFullYear() + '_' + (d.getMonth() + 1).toString().padStart(2, '0') + '_' + getMonthName(d.getMonth());
                // let week = d.getFullYear() + '_' + d.getWeek().toString().padStart(2, '0');
                // let q = d.getMonth() + 1;
                // q = q < 4 ? 1 : (q < 7 ? 2 : (q < 10 ? 3 : 4));
                // let quarter = d.getFullYear() + '_' + (q).toString().padStart(2, '0');
                const d = new Date(v.e2);
                let month = getMonthName(d);
                let week = getWeekName(d);
                let quarter = getQuarterName(d);

                const gain = v.gain_1K;
                summary_month_total += gain;
                if (!summary_months[month]) {
                    summary_months[month] = gain;
                } else {
                    summary_months[month] += gain;
                }
                if (!summary_weeks[week]) {
                    summary_weeks[week] = gain;
                } else {
                    summary_weeks[week] += gain;
                }
                if (!summary_quarters[quarter]) {
                    summary_quarters[quarter] = gain;
                } else {
                    summary_quarters[quarter] += gain;
                }
            });
            res.summary = { months: summary_months, total: summary_month_total, weeks: summary_weeks, quarters: summary_quarters };
            resolve(res);
            summary_months = undefined;
        });
    }
    async levels(res) {
        return new Promise(async (resolve) => {
            resolve(res);
        });
    }
    async positions(symbol, positions, res) {
        return new Promise(async (resolve) => {
            // const p = positions.filter((v) => v.symbol === symbol)[0] || null;
            const p = positions.length > 0 ? positions[0] : null;
            res.position = p ? {
                cost_basis: p ? +p.cost_basis : 0,
                avg_entry_price: p ? +p.avg_entry_price : 0,
                market_value: p ? +p.market_value : 0,
                qty: p ? +p.qty : 0,
                gain: p ? +p.unrealized_pl : 0,
                pct: p ? round2(+p.unrealized_plpc * 100) : 0,
                t: p ? p.t : null,
                e: p ? new Date(p.t).getTime() : null,
            } : null;
            resolve(res);
            positions = undefined;
        });
    }
    async orders(symbol, orders, res) {
        return new Promise(async (resolve) => {
            // res.orders = orders.filter((v) => v.symbol === symbol);
            orders.forEach((v) => {
                v.c = v.side === 'buy' ? -(+(v.p) * (+(v.q))) : +(v.p) * (+(v.q));
                v.p = +(v.p);
                v.q = +(v.q);
                v.spend = +(v.spend);
            });
            res.orders = orders;
            resolve(res);
            orders = undefined;
        });
    }
    async get_next_page(symbol, url, delay, res, options) {
        return new Promise(async (resolve) => {
            let next_page_token = res.next_page_token;
            while (next_page_token) {
                await sleep(250)
                const url2 = url + `&page_token=${next_page_token}`;
                let res2 = await fetch(url2, options);
                res2 = await res2.json();
                res.bars[symbol].push(...res2.bars[symbol]);
                next_page_token = res2.next_page_token;
            }
            resolve(res);
        });
    }
    async bars(symbol, timeframe = '1D', start = this.START_OF_YEAR, end = new Date().toISOString(), open_positions, orders_list, reset = true, delay = 100) {
        return new Promise(async (resolve) => {

            await sleep(delay);

            // const s = symbol ? symbol.replace('/', '%2F') : symbols.map((s) => s.replace('/', '%2F')).join(',');
            const s = symbol.replace('/', '%2F');
            const feed = 'sip';
            // const feed = 'iex';

            let options = { method: 'GET', headers: { accept: 'application/json' } };
            let url = `${this.baseUrl}/v1beta3/crypto/us/bars?symbols=${s}&timeframe=${timeframe}&start=${start}&end=${end}&limit=5000&sort=asc`

            const isCrypto = s.endsWith('USD');
            if (isCrypto === false) {
                options = {
                    method: 'GET',
                    headers: {
                        accept: 'application/json',
                        'APCA-API-KEY-ID': this.ALPACA_KEY || KEY,
                        'APCA-API-SECRET-KEY': this.ALPACA_SECRET || SECRET
                    }
                };

                let isOpen = true; //market_calendar.findIndex((v) => v.date === start.substring(0, 10)) >= 0;
                const d = new Date();
                const hm = +((d.getHours() * 100) + +(d.getMinutes().toString().padStart(2, '0')));
                isOpen = isOpen ? (start.substring(0, 10) === getTodayLocal() ? hm > 930 : isOpen) : isOpen;
                url = isOpen ? `${this.baseUrl}/v2/stocks/bars?symbols=${s}&start=${start}&end=${end}&timeframe=${timeframe}&limit=5000&adjustment=raw&feed=${feed}&sort=asc` : null;
            }

            // symbol = symbol.replace('/', '-');
            // url = `http://localhost:3102/yahoo/${symbol.replace('/', '-')}/1d/${start}/${end}`
            open_positions = open_positions.filter((v) => v.symbol === symbol.replace('/', '')) || [];
            orders_list = orders_list.filter((v) => v.symbol === symbol) || [];
            if (open_positions.length > 0) {
                open_positions[0].t = orders_list[0].t;
            }
            if (url) {
                fetch(url, options)
                    .then(res => res.json())
                    .then((res) => {
                        // console.log(res); 
                        return res;
                    })
                    .then((res) => this.get_next_page(symbol, url, delay, res, options))
                    .then((res) => { res.symbol = symbol; return res; })
                    .then((res) => { if (!res.bars[symbol]) { throw new Error(res) } return res; })
                    .then((res) => res.bars[symbol] || [])
                    .then((res) => this.addMetaData(res))
                    .then((res) => timeframe === '1Min' ? this.addMissingData(res, s, end) : res)
                    // .then((res) => this.addBollingerBands('bands_c', res, isCrypto ? 50 : 28, isCrypto ? 1.0 : 0.7))
                    .then((res) => this.addBollingerBands('bands_c', res, isCrypto ? 10 : 28, isCrypto ? 0.7 : 0.7, 0.80))
                    .then((res) => this.addTrendlines(res))
                    .then((res) => this.refactor(symbol, res))
                    .then((res) => this.analyze(symbol, res, reset))
                    .then((res) => this.analyze(symbol, res, true))
                    // .then((res) => this.analyze(symbol, res, false))
                    .then((res) => this.summarize(res))
                    .then((res) => this.levels(res))
                    .then((res) => this.positions(symbol, open_positions, res))
                    .then((res) => this.orders(symbol, orders_list, res))
                    .then((res) => resolve(res));
            } else {
                resolve(null);
            }
        });
    }
}

// =================================================
// MAIN
// =================================================
let all_symbols_names = null;
let all_symbols = null;
let open_positions = null;
let all_orders = null;
const alpaca_data = new AlpacaData()
setInterval(() => {
    const second = new Date().getSeconds();
    // if (second % 15 === 0 && auto_refresh) {
    if (second === 1 && auto_refresh) {
        test4(bollinger_selected_symbol, second === 0);
    }
}, 1 * 1000);
let bollinger_selected_symbol = null;
let treemap_data = [];
let day_results = [];

// =================================================
// TEST 4
// =================================================
async function test4(symbol = 'OKLO', log = true) {

    //#region VARIABLES
    // * ------------------------
    // * VARIABLES
    // * ------------------------
    const INVESTMENT_SEED = 1000;
    const ALGORITHM = 'C1';
    const init = (bollinger_selected_symbol === null);
    bollinger_selected_symbol = symbol;
    //#endregion

    //#region SYMBOLS
    // * ------------------------
    // * SYMBOLS
    // * ------------------------
    const symbol_groups = {
        ETF: {
            name: 'ETF',
            seed_dollars: 0 * 1000,
            // 'BTQ', 'VXX', 'VIXY', 
            symbols: [
                // /* renmoved */ 'EFAS', 'FLN', 'SLVO', 'VXUS', 
                'ONEQ', 'QQQ', 'IXUS', 'RING', 'FGM', 'SMH', 'AIQ', 'FCA', 'PIE',
            ].sort()
            // symbols: ['ETSY', 'DKNG', 'TAC', 'ARBK', 'QCOM', 'ARM', 'MU', 'APP',].sort()
            // symbols: ['AAPL', 'AMZN', 'NVDA', 'GOOGL', 'MSFT',].sort()
            // symbols: ['VOO', 'SPY', 'BRK.A', 'BRK.B', 'IWV', 'VTHR',].sort()
        },
        // const favs = ['DDOG', 'FOX', 'GE', 'GEV', 'IBM', 'JPM', 'NFLX', 'OKLO', 'PLTR', 'PSIX',].sort();
        CRYPTO: {
            name: 'CRYPTO',
            seed_dollars: 50 * 1000,
            symbols: [
                // 'BAT/USD', 'PEPE/USD', 
                // 'TRUMP/USD', 'SHIB/USD', 'XTC/USD', 'YFI/USD', 'DOT/USD',  
                // 'AVAX/USD', 'SUSHI/USD',
                'BCH/USD', 'BTC/USD', 'DOGE/USD', 'ETH/USD', 'XRP/USD',
                // 'GRT/USD', 'SOL/USD', 'UNI/USD',
            ].sort()
        },
        // const research_crypto = {
        //     seed_dollars: 10 * 1000,
        //     symbols: [
        //         // 'BAT/USD', 'PEPE/USD', 'TRUMP/USD', 
        //         'AVAX/USD', 'BCH/USD', 'BTC/USD', 'CRV/USD', 'DOGE/USD', 'ETH/USD', 'LINK/USD', 'LTC/USD', 'SUSHI/USD',
        //         'DOT/USD', 'GRT/USD', 'SHIB/USD', 'SOL/USD', 'UNI/USD', /*'XTC/USD',*/ 'YFI/USD', 'XRP/USD',
        //     ].sort()
        // }
        STOCKS: {
            name: 'STOCKS',
            seed_dollars: 50 * 1000,
            symbols: [
                // /* renmoved */ 'FOX', 'CVS', 'INTL', 'NVDA', 'WMT', 'ORCL', 'MSFT', 'JPM', 'MDB', 'WMT', 'TSLA', 
                // 'GM', 'F', 'LULU', 'UBER', 'DKNG', 'VZ', 'WM', 'BP', 'T', 
                'NEGG', 'VRT',
                'IREN', 'CIFR', 'HUT', 'BETR', 'TMC',
                'DDOG', 'GE', 'GEV', 'IBM', 'NFLX', 'OKLO', 'PLTR', 'PSIX',
                // 'SMCI', 'F', 'GM', 'NEGG', 'BETZ', 'IBET', 
                // 'DKNG', 'VZ', 'WM', 'LULU', 'UBER', 'BP', 'SPY', 'JPM', 
                // 'Z', 'T', 'MP', 'CVX', 'PM', 
                // 'BETZ', 'BX', 'IBIT', 
                'HOOD', //'LAC', 
                'AMD', 'AVGO', 'COIN',
                'LEU', 'NIO',
                // 'ONEQ', 
                'OPEN',
                'QUBT', 'RKLB', 'SMCI', 'SNDK', 'SNOW', 'TPB', 'TSEM', 'UUUU',
            ].sort()
        }
    };
    //#endregion

    //#region ADD BUTTONS
    // * ------------------------
    // * ADD BUTTONS
    // * ------------------------
    const add_buttons = (symbols, id, title = 'Title', group = 'research') => {
        // const seed = symbol_groups[group].seed_dollars / 1000; //! TODO: change to INVESTMENT_SEED
        const SEED = 1000; //! TODO: change to INVESTMENT_SEED
        let sum = 0;
        let sum_all = 0;
        let sum_all_c = 0;
        try {
            sum = reduceArray(open_positions.filter((v) => symbols.map((v) => v.replace('/', '')).indexOf(v.symbol) >= 0).map((v) => +(v.unrealized_pl)));
            // sum_all = reduceArray(all_symbols
            //     .filter((v) => symbols.indexOf(v.symbol) >= 0)
            //     .filter((v, i, a) => a.indexOf(v) === i) // unique
            //     .map((v) => v.trades[v.trades.length - 1].g_fixed)
            // ) - (SEED / symbols.length * 1000);
            sum_all = reduceArray(all_symbols
                .filter((v) => symbols.indexOf(v.symbol) >= 0)
                .filter((v, i, a) => a.indexOf(v) === i) // unique
                // .map((v) => v.trades[v.trades.length - 1].gain_1K)
                .map((v) => v.summary.total)
            );

            // sum_all_c = all_symbols.filter((v) => symbols.indexOf(v.symbol) >= 0).map((v) => v.gain_dollars_fixed).reduce((p, c) => p + c) - (50 / symbols.length * 1000);

            // sum_all_c = reduceArray(all_symbols
            //     .filter((v) => symbols.indexOf(v.symbol) >= 0)
            //     .filter((v, i, a) => a.indexOf(v) === i) // unique
            //     .map((v) => v.trades[v.trades.length - 1].g_cumulative)
            // ) - (SEED / symbols.length * 1000);
        } catch (e) { console.error(e); }
        let html = `<div 
            id="title-${title}"
            class="w3-col s12 m12 l4 _w3-margin w3-padding"
            style="border:1px solid white;font-size:24px;">
            <b>${title}</b>
            <hr style="border-top:1px solid white"/>
            <b>$${round(sum).toLocaleString()} | $${round(sum_all).toLocaleString()} | ${round1(sum_all / (symbols.length * 1000) * 100).toLocaleString()}%</b>
            </div>`;

        symbols.forEach((s) => {
            const has_position = open_positions.findIndex((v) => v.symbol === s.replace('/', ''));
            // console.log(s, has_position);

            let status = all_symbols.find((v) => v.symbol === s);
            const g = status.summary.total / SEED * 100;
            let status_color = '';
            if (status) {
                if (g >= 0) {
                    status_color = `rgb(0, 128, 0, ${Math.abs(g / 100)})`;
                } else if (g < 0) {
                    status_color = `rgb(255, 0, 0, ${Math.abs(g / 100)})`;
                }
            }
            // const last = status.bars[status.bars.length-2];
            const current = status.bars[status.bars.length - 1];
            // const should_sell = status.own >= 0 && current.c <= last.lb;
            const should_buy = current.c >= current.lb;
            const should_sell = current.c <= current.lb;
            // console.log(s, should_sell);

            // up carot: &#9650;  &#9651;
            // down caret: &#9660;  &#9661;
            const icon = status.position ? (status.position.gain >= 0 ? '&#9650' : '&#9660') : '';
            const icon_color = status.position ? (status.position.gain >= 0 ? '#00b90a' : 'red') : '';
            // const icon = [
            //     'DDOG', 'FOX', 'GE', 'GEV', 'IBM', 'JPM', 'NFLX', 'OKLO', 'PLTR', 'PSIX',
            //     'LEU', 'MP', 'TPB', 'QUBT'
            // ].indexOf(s.split('/')[0]) >= 0 ? '<i class="fa fa-star w3-text-yellow" aria-hidden="true"></i>' : ''; //'<i class="fa fa-star-o w3-text-grey" aria-hidden="true"></i>';

            html += `<div 
            class="w3-col s4 m2 l1 _w3-margin w3-padding"
            style="cursor:pointer;font-size:20px;border:1px solid${symbol === s ? ' #02dcff' : ' grey'};${should_sell && has_position >= 0 ? 'color:red;' : (should_buy ? 'color:#1dcf93;' : '')}"
            onclick="test4('${s}')">
            ${s.split('/')[0]}
            ${has_position >= 0 ? `<div class="w3-right" style="margin-top:2px;background-color:${should_sell ? 'red' : 'aquamarine'};border-radius:15px;width:15px;height:15px;">&nbsp;</div>` : ''}
            <br/>
            <span style="color:${icon_color};font-size:20px;"><span style="color:${icon_color};font-size:20px;">${icon}</span> ${status.position ? '$' + round(status.position.gain) : '-'}</span>
            ${status ? `<br/><div class="" style="color:white;background-color:${status ? status_color : ''};">` + round1(g) + '%</div>' : ''}
            <div id="chart-days-${s.replace('/', '')}"></div>
            </div>
            `;
        });
        document.getElementById(id).innerHTML = html + '<br/>';
        symbols.forEach((s) => {
            let status = all_symbols.find((v) => v.symbol === s);
            s = s.replace('/', '');
            const o = deepClone(chart_bar_options);
            o.chart.height = 125;
            o.chart.animations = { enabled: false };
            o.chart.sparkline = { enabled: true };
            o.dataLabels.enabled = false;
            o.xaxis.labels.rotate = -45;
            o.series[0].data = Object.keys(status.summary.weeks).map((k) => {
                return { x: k, y: status.summary.weeks[k] };
            });
            o.annotations.points = [];
            o.yaxis.labels.formatter = function (val) {
                return '$' + round1(val);
            };
            // if (chart_bollinger) {
            // chart_bollinger.destroy();
            // chart_bollinger.updateOptions({
            //         title: o.title,
            //         series: o.series,
            //         annotations: o.annotations,
            // });
            let chart = new ApexCharts(document.querySelector(`#chart-days-${s}`), o);
            chart.render();
        });
    }
    //#endregion

    //#region LOAD DATA
    // * ------------------------
    // * LOAD DATA
    // * ------------------------

    open_positions = await positions();
    // .filter((v2)=>new Date(v2.t) >= new Date('2025-08-26'))
    all_orders = (await orders())
        .map((v2) => {
            return {
                symbol: v2.symbol,
                side: v2.side,
                t: new Date(v2.filled_at).toLocaleString(),
                spend: v2.notional,
                // id: v2.asset_id, 
                p: v2.filled_avg_price,
                q: v2.filled_qty
            }
        });
    //! console.log(open_positions, all_orders);

    let total_groups = 0;
    let total_groups_reinvest = 0;
    let chart_data_reivest = [];
    const tz = new Date().getTimezoneOffset() / 60;
    // const start = new Date(new Date(`2024-12-01T00:00:00-04:00`));
    const start = new Date(new Date(`2024-10-01T00:00:00-0${tz}:00`));
    const end = new Date(`${getYMD(new Date())}T23:59:59-0${tz}:00`);
    let index = 0;

    console.group('%c----------------------------------------------------', 'color:orange;');
    // const all_symbols_names = [...favs.symbols, ...crypto.symbols, ...research.symbols];
    all_symbols_names = [...symbol_groups.ETF.symbols, ...symbol_groups.CRYPTO.symbols, ...symbol_groups.STOCKS.symbols];
    // const all_symbols_names = ['GE', 'BTC/USD', 'QQQ'];

    const promises = all_symbols_names.map((s, i) => {
        // return analyze_days(ALGORITHM, s, '1D', 1000, start.toISOString(), end.toISOString(), 100);
        return alpaca_data.bars(s, '1D', start.toISOString(), end.toISOString(), open_positions, all_orders/*, i > 13 ? true : false*/);
    });
    all_symbols = await Promise.all(promises);
    console.log(all_symbols);

    // let data = await analyze_days('E', symbol, '1D', start.toISOString(), end.toISOString());
    let data = all_symbols.filter((v) => v.symbol === symbol)[0];
    let bars = data.bars;
    const chart_annotations = data.trades;
    const groups = {};
    //#endregion

    //#region calculate months - NEW
    // * -------------------------------------
    // * CALCULATE MONTHS - NEW
    // * -------------------------------------
    index = 0;
    document.getElementById('output').innerHTML = '';
    for await (const a of [
        symbol_groups.ETF,
        symbol_groups.STOCKS,
        symbol_groups.CRYPTO,
        // { symbols: [...symbol_groups.ETF.symbols, ...symbol_groups.STOCKS.symbols, ...symbol_groups.CRYPTO.symbols] }
        { symbols: [...symbol_groups.ETF.symbols, ...symbol_groups.STOCKS.symbols] }
        // { symbols: ['DOGE/USD'] },
        // { symbols: ['PLTR'] },
    ]) {
        //! --------------------------------------------------------------------
        let all = all_symbols.filter((v) => a.symbols.indexOf(v.symbol) >= 0);
        if (all.length > 0) {
            const group_name = index === 0 ? 'ETF' : (index === 1 ? 'STOCKS' : (index === 2 ? 'CRYPTO' : 'ALL'));
            let message = `%c${group_name} SUMMARY`;
            console.log(message, 'color:yellow;');
            const t = all.map((v) => v.summary.total).reduce((p, c) => p + c);
            console.log(`%cTRADES TOTAL | $${round2(t / 1000).toLocaleString()}K | 1K SEED | ${round1(t / 1000 / all.length * 100)}% | ${all.length} SYMBOLS | $${round1(t / 1000 / all.length * 10)}K @ 10K`, 'color:orange;');

            //! --------------------------------------------------------------------
            const field_name = 'months' // months | weeks | quarters
            let data = {};
            let temp_data = {};
            let count = 0;
            let investment = all.length * 1000;
            const keys = all.map((v) => Object.keys(v.summary[field_name])).reduce((p, c) => [...p, ...c]).filter((v, i, a) => a.indexOf(v) === i).sort();
            // console.log(keys);
            keys.forEach((k) => {
                let sum = 0;
                all.forEach((s) => {
                    count++;
                    if (s.summary[field_name][k]) {
                        sum += (s.summary[field_name][k]);
                    }
                });
                data[k] = round1(sum);
            });
            const num = Object.keys(data).length;
            const sum = round2(Object.values(data).reduce((p, c) => p + c))
            const avg = round2(sum / num);
            const pct = round(sum / (all.length * 1000) * 100);
            console.log(sum, avg, pct, num, data);
            //! console.chart(Object.values(data), `${group_name} | ${pct}%<br/>$${round(sum).toLocaleString()} | $${round(sum / Object.keys(data).length).toLocaleString()}`);
            //! --------------------------------------------------------------------
            // data['_TOTAL_'] = round2(Object.values(data).reduce((p, c) => p + c));
            groups[group_name] = data;
        }
        index++;
    }
    console.log(`%cOPEN POSITIONS | $${round2(open_positions.map((v) => +(v.unrealized_pl)).reduce((p, c) => p + c)).toLocaleString()} | $${round2(open_positions.map((v) => +(v.cost_basis)).reduce((p, c) => p + c)).toLocaleString()}`, 'color:yellow;');
    console.chart(open_positions.map((v) => v.unrealized_pl), `OPEN POSITIONS<br/>$${round2(open_positions.map((v) => +(v.unrealized_pl)).reduce((p, c) => p + c)).toLocaleString()}`);
    console.log('%cGROUPS', 'color:yellow;', groups)
    //#endregion

    //#region CHART YTD DAYS
    // * ------------------------
    // * CHART YTD DAYS
    // * ------------------------
    let o = deepClone(chart_area_spline_options);
    // let o = deepClone(chart_bar_options);
    o.chart.height = 500;
    o.chart.toolbar = { show: false };
    o.chart.sparkline = false;
    o.legend.show = false;
    o.xaxis.type = 'datetime';
    o.series = [];
    o.series.push({ name: 'Close', data: [] }); // , type: 'area', color: colors.blue + '10'
    o.series[0].data = bars.map((v) => { return { x: v.e, y: round2(v.c) } });
    o.series.push({ name: 'Trigger', color: colors.yellow, data: [] });
    // o.series[1].data = bars.map((v) => { return { x: v.e, y: v.sma ? round2(v.sma) : null } });
    o.series[1].data = bars.map((v) => { return { x: v.e, y: v.lb ? round2(v.lb) : null } });


    const tl = calculateTrendline(o.series[0].data.map((v) => v.y));
    o.series.push({ name: 'Trendline', type: 'line', color: '#89f100ff', data: o.series[0].data.map((v, i) => { return { x: v.x, y: round1(tl.calculateY(i)) } }) });

    // o.series.push({ name: 'SMA', hidden: mobile_view, data: [] });
    // o.series[1].data = bars.map((v) => { return { x: v.e, y: v.sma ? round2(v.sma) : null } });
    // o.series.push({ name: 'Lower', data: [] });
    // o.series[2].data = bars.map((v) => { return { x: v.e, y: v.lb ? round2(v.lb) : null } });
    // o.series.push({ name: 'Upper', hidden: mobile_view, data: [] });
    // o.series[3].data = bars.map((v) => { return { x: v.e, y: v.ub ? round2(v.ub) : null } });
    // o.series.push({ name: 'Open', hidden: mobile_view, data: [] }); // , type: 'area', color: colors.blue + '10'
    // o.series[4].data = bars.map((v) => { return { x: v.e, y: round2(v.o) } });
    // o.series.push({ name: 'Prediction 5', hidden: mobile_view, data: [] }); // , type: 'area', color: colors.blue + '10'
    // o.series[5].data = bars.map((v) => { return { x: v.e, y: round2(v.p5) } });

    o.annotations.xaxis = [];

    /** month indicators */
    let e = new Date(start).getTime();
    while (e <= bars[bars.length - 1].e) {
        if (new Date(e).getDate() === 1) {
            o.annotations.xaxis.push({
                x: e,
                strokeDashArray: 0,
            });
        }
        e += (24 * 60 * 60 * 1000);
    }

    /** trade gains */
    let seed = INVESTMENT_SEED;
    chart_annotations.forEach((a) => {
        // const g = round(seed * (a.gain_1K / 100));
        const g = round(a.gain_1K);
        o.annotations.xaxis.push({
            x: a.e1,
            x2: a.e2,
            borderColor: '#03fcfc10',
            fillColor: '#03fcfc20',
            strokeDashArray: 0,
            opacity: 1,
            label: {
                text: isMobile() && !isTablet() ? '' : `${g}`,
                _text: `${round(INVESTMENT_SEED * (g))}`,
                orientation: 'horizontal',
                style: {
                    background: g >= 0 ? colors.green : colors.red,
                    color: colors.white,
                    fontSize: '20px',
                }
            }
        });
        seed += g;
    });
    /** current position */
    if (data.position) {
        o.annotations.xaxis.push({
            x: data.position ? new Date(data.position.t.split(',')[0]).getTime() : null,
            x2: Date.now(),
            borderColor: '#fc038c80',
            fillColor: '#fc038c20',
            strokeDashArray: 0,
            opacity: 1,
            label: {
                text: isMobile() && !isTablet() ? '' : `${round(data.position.gain)}`,
                orientation: 'horizontal',
                position: 'bottom',
                style: {
                    background: '#fc038cff', //data.position.gain >= 0 ? colors.green : colors.red,
                    color: colors.white,
                    fontSize: '20px',
                }
            }
        });
    }

    const pct = round1(reduceArray(chart_annotations.map((v) => v.gain)));
    let g = round2(data.summary.total);
    const delta = round1((bars[bars.length - 1].c - bars[14].c) / bars[0].c * 100);
    // o.title.text = `${symbol} | SEED $${seed.toLocaleString()} | 1K $${g.toLocaleString()} | ${pct}% | ${delta}% | ${chart_annotations.length} | $${o.series[0].data[o.series[0].data.length - 1].y}`;
    o.title.text = `${symbol} | $${g.toLocaleString()} | ${round1(g / 1000 * 100).toLocaleString()}% | 1K`;
    o.title.style = { fontSize: '28px', color: colors.white };
    if (chart_bollinger) {
        chart_bollinger.destroy();
        // chart_bollinger.updateOptions({
        //         title: o.title,
        //         series: o.series,
        //         annotations: o.annotations,
        // });
    }
    chart_bollinger = new ApexCharts(document.querySelector(`#chart-bollinger-0`), o);
    chart_bollinger.render();
    //#endregion

    //#region CHART LAST N DAYS
    // ------------------------
    // /** CHART LAST N DAYS */
    // ------------------------
    o = deepClone(o);
    o.chart.height = 454;
    o.title.text = `${isMobile() ? symbol + ' | ' : ''}10d`;
    o.legend.show = false;
    o.chart.toolbar = { show: false };
    o.series.push({ name: 'Open', data: [] }); // , type: 'area', color: colors.blue + '10'
    o.series[2].name = 'Open';
    o.series[2].color = '#fc03ec';
    o.series[2].data = bars.map((v) => { return { x: v.e, y: round2(v.o) } });
    o.series.forEach((s) => {
        s.data = s.data.slice(-10);
    });
    // o.annotations.xaxis.forEach((v) => v.label.text = v.label._text);
    if (chart_bollinger_1) {
        chart_bollinger_1.destroy();
        // chart_bollinger_1.updateOptions({
        //         title: o.title,
        //         series: o.series,
        //         annotations: o.annotations,
        // });
    }
    chart_bollinger_1 = new ApexCharts(document.querySelector(`#chart-bollinger-2`), o);
    chart_bollinger_1.render();
    o = undefined;

    let cumulative = 0;
    const cumulative_data = [];
    const cumulative_data_2 = [];
    chart_annotations.forEach((v) => {
        cumulative += v.gain;
        cumulative_data.push({ x: v.e2, y: round(INVESTMENT_SEED * (cumulative / 100)) });
        cumulative_data_2.push({ x: v.e2, y: round(INVESTMENT_SEED * (v.gain / 100)) });
        // cumulative_data.push({ x: v.e2, y: round((INVESTMENT_SEED + cumulative) * (cumulative / 100)) });
        // cumulative_data_2.push({ x: v.e2, y: round((INVESTMENT_SEED + cumulative) * (v.gain / 100)) });
    })
    //#endregion

    //#region CHART CUMULATIVE
    // -------------------------------------
    // CHART CUMULATIVE
    // -------------------------------------
    o = deepClone(chart_area_spline_options);
    o.chart.height = 515;
    o.chart.animations.enabled = false;
    o.plotOptions = {
        bar: {
            colors: {
                ranges: [{
                    from: -100000,
                    to: 0,
                    color: '#F15B46'
                },
                    // {
                    //     from: -45,
                    //     to: 0,
                    //     color: '#FEB019'
                    // }
                ]
            },
            columnWidth: '80%',
        }
    };
    // o.chart.sparkline = false;
    o.legend.enabled = false;
    o.dataLabels = {
        enabled: false,
        offsetY: -16,
        enabledOnSeries: [0],
        style: {
            fontSize: '18px',
        }
    };
    o.xaxis.type = 'datetime';
    o.series = [];
    o.series.push({ name: 'Entries', type: 'bar', data: cumulative_data_2 });
    o.series.push({ name: 'Cumulative', type: 'area', color: '#03fcfc30', data: cumulative_data });
    if (chart_bollinger_2) {
        chart_bollinger_2.destroy();
        // chart_bollinger_2.updateOptions({
        //     title: o.title,
        //     series: o.series,
        //     annotations: o.annotations,
        // });
    }
    // chart_bollinger_2 = new ApexCharts(document.querySelector(`#chart-bollinger-1`), o);
    // chart_bollinger_2.render();
    o = undefined;
    // console.table(cumulative_data);
    //#endregion

    //#region CHART ACIVE POSITIONS
    // -------------------------------------
    // CHART ACIVE POSITIONS
    // -------------------------------------
    // orders().then((v)=>console.log(v.map((v)=>{return {s: v.symbol, side: v.side, c: round(v.filled_avg_price * v.filled_qty), d: new Date(v.filled_at).toLocaleString() };})));
    // orders().then((v)=>console.log(v.map((v)=>{return {s: v.symbol, side: v.side, c: (v.filled_avg_price * v.filled_qty), d: new Date(v.filled_at).toLocaleString(), e: new Date(v.filled_at).getTime() };}).filter((v)=>v.e > new Date('2025-08-25T23:59:59'))));

    o = deepClone(chart_bar_options);
    o.chart.animations = { enabled: false };
    // unrealized_plpc
    o.series[0].data = open_positions.map((v) => {
        return {
            x: [
                v.symbol.replace('USD', ''),
                // isMobile() ? '' : `${round1(v.unrealized_plpc * 100)}%`
            ],
            // x: v.symbol.replace('USD', ''),
            y: round(v.unrealized_pl)
        }
    });
    o.yaxis.labels.formatter = function (x) {
        return `$${x.toLocaleString()}`;
    }
    o.annotations.points = [];
    if (true || mobile_view) {
        o.chart.type = 'treemap';
        o.annotations.yaxis = [];
        o.dataLabels.enabled = true;
    }
    o.chart.height = isMobile() ? 250 : (isTablet() ? 200 : 200);
    o.dataLabels = {
        // offsetY: mobile_view ? 0 :  -24,
        style: {
            fontSize: '14px',
        },
        formatter: function (text, op) {
            return [text, op.value]
        },
    };
    if (chart_positions) {
        chart_positions.destroy();
        // chart_positions.updateOptions({
        //     title: o.title,
        //     series: o.series,
        //     annotations: o.annotations,
        // });
    }
    chart_positions = new ApexCharts(document.querySelector("#chart-positions"), o);
    chart_positions.render();
    o = undefined;
    //#endregion

    //#region TOTAL SUMMARY
    // * -------------------------------------
    // * TOTAL SUMMARY
    // * -------------------------------------
    const total = reduceArray(open_positions.map((v) => +(v.unrealized_pl)));
    const total_invested = reduceArray(open_positions.map((v) => +(v.cost_basis)));
    // const total_pct = open_positions.map((v) => +(v.unrealized_plpc) * 100).reduce((p, c) => p + c);
    let elem = document.getElementById('total-positions-2');
    elem.style.backgroundColor = total === 0 ? 'grey' : (total > 0 ? '#00b90a' : colors.red);
    elem.style.color = colors.black;
    elem.style.padding = '10px';
    elem.style.fontSize = isTablet() ? '7.8vh !important' : (isMobile() ? '55px !important' : '4vh !important');
    // <br/><span class="w3-small">${new Date().toLocaleString()}</span>
    elem.innerHTML = `$${round(total).toLocaleString()}<hr/>${round2(total / total_invested * 100)}%`;
    document.title = `M#-TRADER | $${round(total).toLocaleString()}`;

    elem = document.getElementById('total-positions-banner');
    elem.innerHTML = `$${round(total).toLocaleString()} | ${round2(total / total_invested * 100)}%`;
    //#endregion

    //#region GROUP SUMMARIES CHARTS
    // * -------------------------------------
    // * GROUP SUMMARY CHARTS
    // * -------------------------------------
    // console.log('----------------------------------------------------');
    const group_results = [];
    index = 0;
    // for await (const a of (init ? [favs, research, crypto, { seed_dollars: favs.seed_dollars + research.seed_dollars + crypto.seed_dollars, symbols: all_symbols_names }] : [favs, research/*, crypto.symbols*/])) {
    // for await (const a of [favs, research, crypto, { seed_dollars: favs.seed_dollars + research.seed_dollars + crypto.seed_dollars, symbols: all_symbols_names }]) {
    // for await (const a of [symbol_groups.favs, symbol_groups.research, symbol_groups.crypto, { seed_dollars: symbol_groups.favs.seed_dollars + symbol_groups.research.seed_dollars + symbol_groups.crypto.seed_dollars, symbols: all_symbols_names }]) {
    for await (const a of [symbol_groups.ETF, symbol_groups.STOCKS, symbol_groups.CRYPTO]) {

        const group_name = index === 0 ? 'ETF' : (index === 1 ? 'STOCKS' : (index === 2 ? 'CRYPTO' : 'ALL'));
        let all = all_symbols.filter((v) => a.symbols.indexOf(v.symbol) >= 0)

        // const day_results = all;
        // const gain_pct = all.map((v) => v.gain_pct).reduce((p, c) => p + c) / all.length;

        if (index < 3) {
            add_buttons(
                a.symbols,
                index === 0 ? 'symbol-buttons-bollinger-favs' : (index === 1 ? 'symbol-buttons-bollinger' : 'symbol-buttons-bollinger-crypto'),
                group_name,
                index === 0 ? 'ETF' : (index === 1 ? 'STOCKS' : (index === 2 ? 'CRYPTO' : 'ALL'))
            );
        }

        // //#region calculate trade days for each symbol in the group
        // // const num_months = round((new Date(end) - new Date(start)) / (30 * 24 * 60 * 60 * 1000));
        // let days = [];
        // let day_gains = [];
        // let day_gains_cumulative = [];
        // let all_trades = all.length > 0 ? all.map((v) => v.trades).reduce((p, c) => [...p, ...c]) : [];
        // let trade_days = all_trades.map((v) => v.e2).filter((v, i, a) => a.indexOf(v) === i).sort();
        // let cumulative = 0;
        // let summary_months = {};
        // let summary_month_total = 0;
        // let summary_total = 0;
        // let summary_total_count = 0;
        // let month = null;
        // trade_days.forEach((v, i) => {
        //     let filtered = all_trades.filter((v2) => v2.e2 === v);
        //     const num_symbols = filtered.map((v) => v.s).filter((v, i, a) => i === a.indexOf(v)).length;
        //     const trades_total = reduceArray(filtered.map((v2) => v2.gain));
        //     // const gain = (trades_total / 100) * (num_symbols * 1000);
        //     // const gain = (trades_total / 100) * (a.seed_dollars / a.symbols.length); // TODO: REVIEW NUMBERS !!!
        //     // const gain = (trades_total / 100) * (a.seed_dollars / a.symbols.length) * filtered.length;
        //     let gd = 0;
        //     filtered.forEach((v2) => { gd += (v2.gain / 100) * (a.seed_dollars / a.symbols.length) });
        //     const gain = gd;
        //     // let gd = 0;
        //     // filtered.forEach((v2) => { gd += (v2.gain / 100) * (a.seed_dollars / a.symbols.length) });
        //     // const gain = gd;
        //     cumulative += gain;
        //     days.push({ x: v, y: round3(cumulative) });

        //     day_gains.push({ x: v, y: round1(gain) })
        //     day_gains_cumulative.push({ x: v, y: round1(cumulative) })

        //     // -----------------------------------------------------
        //     /** MONTH SUMMARIES */
        //     const getMonthName = (month) => {
        //         return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month];
        //     }
        //     let month = new Date(v).getFullYear() + '_' + (new Date(v).getMonth() + 1).toString().padStart(2, '0') + '_' + getMonthName(new Date(v).getMonth());
        //     if (!summary_months[month]) {
        //         summary_total += summary_month_total;
        //         summary_total_count++;
        //         summary_months[month] = gain;
        //         summary_month_total = gain;
        //     } else {
        //         summary_month_total += gain;
        //         summary_months[month] += gain;
        //     }
        // });
        // if (index < 3) {
        //     group_results.push(summary_months);
        // }
        //#endregion

        //#region MONTHLY BAR CHART WITH CUMULATIVE
        // * -------------------------------------
        // * MONTHLY BAR CHART WITH CUMULATIVE
        // * -------------------------------------
        const temp = Object.keys(groups[group_name]).map((k) => groups[group_name][k]).sort((a, b) => b - a);
        const t = temp.slice(1, -1);

        //  TODO: get rid of the high and the low values when calculating the average
        o = deepClone(chart_bar_options);
        o.chart.animations = { enabled: false };
        o.chart.height = 275;
        o.chart.sparkline = { enabled: true };
        o.xaxis.labels.show = false;
        // o.yaxis.min = -200;
        o.series[0].data = Object.keys(groups[group_name]).map((k) => {
            return {
                x: k,
                y: round(groups[group_name][k])
            }
        });
        o.series.push({ name: '50K Seed', type: 'line', color: colors.orange, data: [] });
        o.series[1].data = Object.keys(groups[group_name]).map((k) => {
            return {
                x: k,
                y: round(groups[group_name][k] * 1.666)
            }
        });
        // o.series.push({name:'75K Seed', type:'line', color: colors.yellow, data: []});
        // o.series[2].data = Object.keys(groups[group_name]).map((k) => {
        //     return {
        //         x: k,
        //         y: round(groups[group_name][k]*2.5)
        //     }
        // });
        o.yaxis.labels.formatter = function (x) {
            return `$${x.toLocaleString()}`;
        }
        o.annotations.points = [];
        o.dataLabels = {
            enabled: true,
            offsetY: -24,
            enabledOnSeries: [0],
            style: {
                fontSize: '16px',
            },
            formatter: function (text, op) {
                let v = +(text);
                return Math.abs(v) > 1000 ? round(v / 1000) + 'K' : round1(v);
                // v = v >= 1000 ? v /1000 : v;
                // return round1(v / 1000) + 'K';
            },
        };
        const num = symbol_groups[index === 0 ? 'ETF' : (index === 1 ? 'STOCKS' : 'CRYPTO')].symbols.length;
        const g = round(Object.values(groups[group_name]).reduce((p, c) => p + c));
        const avg = round(g / Object.values(groups[group_name]).length);
        const pct = round(g / (num * 1000) * 100);
        const last = round2(Object.values(groups[group_name])[Object.values(groups[group_name]).length - 1]);

        // const avg2 = round((temp.reduce((p, c) => p + c)) / (temp.length));
        const elem = document.getElementById(`title-symbols-group-${index + 1}`)
        elem.style.fontSize = '18px';
        elem.style.color = '#fff';
        // elem.innerHTML = `<div class="w3-xxlarge">`;
        elem.innerHTML = `<span class="w3-xlarge"><b>${group_name} | <span style="color:lime;">$${round1(g / 1000).toLocaleString()}K</span></b> | <span style="color:lime;">${round(pct).toLocaleString()}%</span> @ <span style="color:lime;">$${num}K</span></span>`;
        // elem.innerHTML = `</div>`;
        // elem.innerHTML += `<br/><span style="color:lime;">$${round1(g / 1000).toLocaleString()}K</span> | <span style="color:lime;">${pct.toLocaleString()}%</span> @ <span style="color:lime;">$${num}K</span>`;
        elem.innerHTML += `<hr/>`;
        elem.innerHTML += `AVG: <span style="color:lime;">$${avg.toLocaleString()}</span>`;
        elem.innerHTML += `<span class="w3-right">$10K SEED: <span style="color:lime;">$${(round1(g / num * 10 / 1000)).toLocaleString()}K</span></span>`;
        elem.innerHTML += `<br/>LAST: <span style="color:lime;">$${round(last).toLocaleString()}</span>`;
        elem.innerHTML += `<span class="w3-right">$50K SEED: <span style="color:lime;">$${(round1(g / num * 50 / 1000)).toLocaleString()}K</span></span>`;
        elem.innerHTML += `<br/><span class="w3-right">$75K SEED: <span style="color:lime;">$${(round1(g / num * 75 / 1000)).toLocaleString()}K</span></span>`;
        elem.innerHTML += `<br/><span class="w3-right">$100K SEED: <span style="color:lime;">$${(round1(g / num * 100 / 1000)).toLocaleString()}K</span></span>`;

        // elem.innerHTML += `<hr/>`;
        // document.getElementById(`title-symbols-stacked-${index + 5}`).innerHTML += ` | ${a.seed_dollars / 1000}K`;
        o.annotations.yaxis.push({ y: avg, borderColor: '#fff', strokeDashArray: 0, label: { _text: '$' + avg.toLocaleString(), offsetY: -100, style: { background: '#000', color: '#fff', fontSize: '20px' } } });
        // o.annotations.yaxis.push({ y: avg2, borderColor: '#fff', strokeDashArray: 0, label: { _text: '$' + avg.toLocaleString(), offsetY: -100, style: { background: '#000', color: '#fff', fontSize: '20px' } } });
        let c = index === 0 ? chart_symbols_group_1 : (index === 1 ? chart_symbols_group_2 : (index === 2 ? chart_symbols_group_3 : chart_symbols_group_4))
        if (c) {
            // c.destroy();
            c.updateOptions({
                //     title: o.title,
                series: o.series,
                annotations: o.annotations,
            })
        } else {
            c = new ApexCharts(document.querySelector("#chart-symbols-group-" + (index + 1)), o);
            c.render();
            index === 0 ? chart_symbols_group_1 = c : (index === 1 ? chart_symbols_group_2 = c : (index === 2 ? chart_symbols_group_3 = c : chart_symbols_group_4 = c))
        }
        //#endregion

        //#region day gains cumulative chart
        // * -------------------------------------
        // * DAY GAINS CUMULATIVE CHART
        // * -------------------------------------
        // const data = day_gains_cumulative;
        // const elem = document.getElementById(`title-symbols-stacked-${index + 1}`);
        // elem.style.fontSize = '18px';
        // elem.style.color = '#fff';
        // elem.innerHTML = `${group_name} | $${round(cumulative).toLocaleString()}`;
        // elem.innerHTML += ` | ${round(cumulative / (a.seed_dollars) * 100)}%`;

        // o = deepClone(chart_area_spline_options);
        // // o.title = {
        // //     text: `${group_name} | $${round(cumulative).toLocaleString()}`,
        // //     style: { fontSize: '22px', color: '#fff' }
        // // };
        // o.xaxis.type = 'datetime';
        // o.chart.height = 200;
        // o.series = [];
        // const tl = calculateTrendline(data.map((v) => v.y));
        // o.series.push({ name: 'Close', type: 'area', color: '#03fcfc20', data });
        // o.series.push({ name: 'Trendline', type: 'line', color: '#89f100ff', data: data.map((v, i) => { return { x: v.x, y: round1(tl.calculateY(i)) } }) });
        // o.yaxis.min = -5;
        // // o.yaxis.max = 125;
        // const last = o.series[0].data.length > 0 ? o.series[0].data[o.series[0].data.length - 1].y : 0;
        // // const pct = cumulative / (a.length * 1000) * 100;
        // // o.annotations.yaxis.push({ y: last, borderColor: '#fff', label: { text: round1(pct) + '%', style: { fontSize: '20px' } } });
        // o.yaxis.labels.formatter = function (x) {
        //     return `$${x.toLocaleString()}`;
        // }
        // c = index === 0 ? chart_symbols_stacked_1 : (index === 1 ? chart_symbols_stacked_2 : (index === 2 ? chart_symbols_stacked_3 : chart_symbols_stacked_4))
        // if (c) {
        //     // c.destroy();
        //     c.updateOptions({
        //         //     title: o.title,
        //         series: o.series,
        //         //     annotations: o.annotations,
        //     })
        // } else {
        //     c = new ApexCharts(document.querySelector(`#chart-symbols-stacked-${index + 1}`), o);
        //     c.render();
        //     index === 0 ? chart_symbols_stacked_1 = c : (index === 1 ? chart_symbols_stacked_2 = c : (index === 2 ? chart_symbols_stacked_3 = c : chart_symbols_stacked_4 = c))
        // }
        // total_groups += index < 3 ? round1(last) : 0;
        //#endregion

        // let cumulative_temp = 0;
        // all.map((v) => { cumulative_temp += v.gain_dollars; chart_data_reivest.push(cumulative_temp); return cumulative_temp; });
        // // console.log('----------------------------------------------------');
        // // console.log(`%c${group_name} | CUMULATIVE |  $${round2(cumulative_temp).toLocaleString()} | $${a.seed_dollars / 1000}K | ${round(cumulative_temp / a.seed_dollars * 100)}%`, 'color:yellow;');
        // // console.log(chart_data_reivest);
        // const cumulative_g = round2(reduceArray(all.map((v) => v.gain_dollars)));
        // total_groups_reinvest += index < 3 ? round1(cumulative_g) : 0;
        // // console.log(`%c${group_name} | ${cumulative_g.toLocaleString()} | ${round(cumulative_g / (1000 * a.length) * 100)} %`, 'color:aquamarine');

        /** GROUP TITLE CARD */
        // if (index < 3) {
        //     document.getElementById(`title-${group_name}`)
        //         .innerHTML += `<br/>
        //         <div style="border-top:1px solid;">$<b>${round(cumulative_g / 1000).toLocaleString()} K</b> | ${round(cumulative_g / (1000 * a.length) * 100)}% | ${a.symbols.length}K
        //         </div>`
        // }

        // let months_total = 0;
        // Object.keys(summary_months).forEach((k) => {
        //     months_total += summary_months[k];
        //     // console.log(`%c${group_name} | ${k} | $${round1(summary_months[k]).toLocaleString()}`, 'color:aquamarine;'); //#e92cc1
        // });
        // console.log(`%c${group_name} SUMMARY | TOTAL: $${round(months_total).toLocaleString()} | AVG: $${round((t.reduce((p, c) => p + c)) / (t.length)).toLocaleString()}`, 'color:#e92cc1;');
        // console.log(`%c${group_name} SUMMARY | TOTAL: $${round(months_total).toLocaleString()} | AVG: $${round((reduceArray(t)) / (t.length)).toLocaleString()}`, 'color:#e92cc1;');
        // console.table(summary_months);

        // ---------------------------------------------------------------
        // TODO: calculate how many points in the future - it is NOT days
        // console.log(`%c${group_name} | ${round2(cumulative).toLocaleString()} | ${round1(tl.calculateY(days.length * 2)).toLocaleString()} | ${round1(tl.calculateY(days.length * 3)).toLocaleString()} | SEED ${a.symbols.length}K`, 'color:orange;');
        // ---------------------------------------------------------------

        index++;
        o = undefined;
        all = undefined;
        // all_trades = undefined;
        // trade_days = undefined;
        // days = undefined;
        // day_gains = undefined;
        // day_gains_cumulative = undefined;
    };

    //#region MONTHLY GROUP CHARTS
    // -----------------------------------------------------
    // MONTHLY GROUP CHARTS
    // -----------------------------------------------------
    const update_months_chart = (index, name, values) => {
        return;

        /** get rid of the high and the low values */
        const temp = Object.keys(values).map((k) => values[k]).sort((a, b) => b - a);
        const t = temp.slice(1, -1);

        // console.log('----------------------------------------------------');
        // console.log('CHART MONTHLY');
        // console.log('----------------------------------------------------');
        o = deepClone(chart_bar_options);
        o.chart.animations = { enabled: false };
        o.chart.height = 300;
        o.chart.sparkline = { enabled: true };
        o.xaxis.labels.show = false;
        o.series[0].data = Object.keys(values).map((k) => {
            return {
                x: k,
                y: round(values[k])
            }
        });
        o.series.push({ name: 'Cumulative', type: 'area', color: '#89f1005d', data: [] });
        let cumulative = 0;
        const data = Object.keys(values).map((k) => {
            cumulative += values[k];
            return { x: k, y: round3(cumulative) }
        });
        o.series[1].data = data;
        o.yaxis.labels.formatter = function (x) {
            return `$${x.toLocaleString()}`;
        }
        o.annotations.points = [];
        o.dataLabels = {
            enabled: true,
            offsetY: -24,
            style: {
                fontSize: '16px',
            },
            formatter: function (text, op) {
                let v = +(text);
                return Math.abs(v) > 1000 ? round(v / 1000) + 'K' : v;
                // v = v >= 1000 ? v /1000 : v;
                // return round1(v / 1000) + 'K';
            },
        };
        o.yaxis.min = -15 * 1000;
        const avg = t.length > 0 ? round((reduceArray(t)) / (t.length)) : 0;
        const avg_all = temp.length > 0 ? round((reduceArray(temp)) / (temp.length)) : 0;
        const g = round(reduceArray(o.series[0].data.map((v) => v.y)) / 1000);

        // const avg2 = round((temp.reduce((p, c) => p + c)) / (temp.length));
        document.getElementById(`title-symbols-stacked-${index + 5}`).style.fontSize = '18px';
        document.getElementById(`title-symbols-stacked-${index + 5}`).style.color = '#fff';
        document.getElementById(`title-symbols-stacked-${index + 5}`).innerHTML = `${name} | $${g.toLocaleString()}K`;
        document.getElementById(`title-symbols-stacked-${index + 5}`).innerHTML += ` | ${round(g / 50 * 100).toLocaleString()}%`;
        document.getElementById(`title-symbols-stacked-${index + 5}`).innerHTML += ` | AVG: $${avg_all.toLocaleString()}`;
        document.getElementById(`title-symbols-stacked-${index + 5}`).innerHTML += ` | 50K`;
        // document.getElementById(`title-symbols-stacked-${index + 5}`).innerHTML += ` | ${a.seed_dollars / 1000}K`;
        o.annotations.yaxis.push({ y: avg, borderColor: '#fff', strokeDashArray: 0, label: { _text: '$' + avg.toLocaleString(), offsetY: -100, style: { background: '#000', color: '#fff', fontSize: '20px' } } });
        // o.annotations.yaxis.push({ y: avg2, borderColor: '#fff', strokeDashArray: 0, label: { _text: '$' + avg.toLocaleString(), offsetY: -100, style: { background: '#000', color: '#fff', fontSize: '20px' } } });
        let c = index === 0 ? chart_symbols_stacked_5 : (index === 1 ? chart_symbols_stacked_6 : (index === 2 ? chart_symbols_stacked_7 : chart_symbols_stacked_8))
        if (c) {
            // c.destroy();
            c.updateOptions({
                //     title: o.title,
                series: o.series,
                annotations: o.annotations,
            })
        } else {
            c = new ApexCharts(document.querySelector("#chart-symbols-stacked-" + (index + 5)), o);
            c.render();
            index === 0 ? chart_symbols_stacked_5 = c : (index === 1 ? chart_symbols_stacked_6 = c : (index === 2 ? chart_symbols_stacked_7 = c : chart_symbols_stacked_8 = c))
        }
    }
    //#endregion

    // //#region calculate months
    // // ----------------------------------------------------
    // // CHART MONTHLY
    // // ----------------------------------------------------
    // g = 0;
    // const months = {};
    // Object.keys(group_results[0]).forEach((k) => months[k] = 0);
    // Object.keys(months).forEach((m, i) => {
    //     const g = reduceArray(group_results.map((v) => v[m]))
    //     months[m] += g;
    //     // console.log(`%c$${round1(g).toLocaleString()}`, 'color:aquamarine;');
    // });
    // // console.log(months);
    // // console.log(round2(reduceArray(Object.keys(months).map((k) => round1(months[k])))).toLocaleString());
    // group_results.push(months);
    // // console.log(group_results);
    // group_results.forEach((v, i) => update_months_chart(i, '', v));
    // // console.log('----------------------------------------------------');
    // // // console.log(`%cTOTAL GROUPS | $${round1(total_groups)}K | ${round2(total_groups / 30 * 100)}%`, 'color:orange;');
    // // // console.log('----------------------------------------------------');
    // // console.log(`%cTOTAL GROUPS REINVEST | $${round(total_groups_reinvest).toLocaleString()}`, 'color:aquamarine;');
    // // console.log(`%cTOTAL GROUPS | $${round(total_groups).toLocaleString()}`, 'color:coral;');
    // //#endregion

    // //#endregion

    console.groupEnd();

    /** log the data for analysis */
    // console.log(all_symbols);

    /** dipose objects */
    // open_positions = undefined;
    // all_orders = undefined;
    // all_symbols = undefined;
    data = undefined;
    bars = undefined;
}
