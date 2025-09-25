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
    addBollingerBands(key = 'bands_c', data, period = 14, multiplier = 0.7) {
        applyBands(data, period, multiplier);
        data.forEach((v) => {
            if (!v[key]) {
                v[key] = { sma: 0, lowerBand: 0, upperBand: 0, delta: 0 };
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
    async bars(symbol, timeframe = '1D', start = this.START_OF_YEAR, end = new Date().toISOString()) {
        return new Promise(async (resolve) => {
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
            if (url) {
                fetch(url, options)
                    .then(res => res.json())
                    .then((res) => {
                        // console.log(res); 
                        return res;
                    })
                    .then((res) => { res.symbol = symbol; return res; })
                    .then((res) => { if (!res.bars[symbol]) { throw new Error(res) } return res; })
                    .then((res) => res.bars[symbol] || [])
                    .then((res) => this.addMetaData(res))
                    .then((res) => timeframe === '1Min' ? this.addMissingData(res, s, end) : res)
                    .then((res) => this.addBollingerBands('bands_c', res, 14))
                    .then((res) => this.addTrendlines(res))
                    .then((res) => {
                        const obj = [];
                        res.forEach((v) => {
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
                                lb: v.bands_c.lowerBand,
                                ub: v.bands_c.upperBand,
                                p5: v.tl5,
                                dow: v.dow,
                            });
                        });
                        resolve(obj);
                        res = undefined;
                    });
            } else {
                resolve(null);
            }
        });
    }
}

// =================================================
// MAIN
// =================================================
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
// ANALYZE DAYS
// =================================================
async function analyze_days(algo = 'E', symbol, timeframe = '1D', start = START_OF_YEAR, end = new Date().toISOString(), delay = 0) {
    return new Promise(async (resolve) => {
        await sleep(delay);

        let bars = await alpaca_data.bars(symbol, timeframe, start, end);
        let was_below = true;
        let was_above = true;
        let own_at = -1;
        let g = 0;
        let g_dollars = 0;
        let trades = [];
        const algos = {
            // ----------
            // STOCKS
            // ----------
            A: { buy: (v, i) => v.c >= v.ub, sell: (v, i) => v.c <= v.ub },
            B: { buy: (v, i) => v.c >= v.lb, sell: (v, i) => v.c <= v.ub },
            C: { buy: (v, i) => v.sma >= v.lb, sell: (v, i) => v.c <= v.ub },
            // D: { buy: (v, i) => v.c >= v.sma, sell: (v, i) => v.c <= v.lb },
            D: { buy: (v, i) => v.c >= v.sma, sell: (v, i) => v.c <= v.lb },
            E: { buy: (v, i) => v.c >= v.sma, sell: (v, i) => v.c < v.sma },
            F: { buy: (v, i) => v.c >= v.lb, sell: (v, i) => v.c < v.lb }, // ***
            F0: { buy: (v, i) => v.c >= v.lb, sell: (v, i) => v.c < v.lb }, // ***
            F1: { buy: (v, i) => v.dow !== 5 && v.o >= v.lb, sell: (v, i) => v.dow === 5 || v.c < v.lb },
            F2: { buy: (v, i) => v.dow !== 5 && v.c >= v.lb, sell: (v, i) => v.dow === 5 || v.c < v.lb },
            G: { buy: (v, i) => v.c >= v.lb && v.p5 >= v.c, sell: (v, i) => v.c < v.lb },
            // H: { buy: (v, i) => v.c >= v.p5, sell: (v, i) => v.c < v.p5 },
            H: { buy: (v, i) => v.o >= v.lb, sell: (v, i) => true }, // bu/sell each day if above lower bound
            // * ----------
            // * CRYPTO
            // * ----------
            C1: { buy: (v, i) => v.o >= v.sma, sell: (v) => v.c <= v.lb },
            C2: { buy: (v, i) => v.o >= v.lb, sell: (v) => v.c <= v.ub },
            C3: { buy: (v, i) => v.c >= v.o, sell: (v) => v.c <= v.o },
            Z: { buy: (v, i) => false, sell: (v) => false },
        };
        // algo = 'D';
        // algo = 'E';
        algo = symbol.endsWith('USD') ? 'D' : 'F';
        // algo = 'A';
        // algo = 'B';

        if (bars) {
            bars.forEach((v, i) => {
                if (v.sma) {
                    if (v.c >= v.ub) {
                        was_above = true;
                    }
                    if (v.c <= v.lb) {
                        was_below = true;
                    }
                    // BUY
                    if (algos[algo].buy(v, i)) {
                        if (was_below === true && own_at === -1) {
                            // if (TRADE) {
                            //     buy(symbol, 5000); // TODO: change to INVVESTMENT_SEED
                            // }

                            // trades.push({
                            //     num: i - own_at,
                            //     1: own_at,
                            //     2: i,
                            //     gain: (v.c - v.o) / v.o * 100,
                            //     // gain: (bars[i].c - bars[own_at].o) / bars[own_at].o * 100,
                            //     e1: v.e,
                            //     e2: v.e+1000,
                            //     t1: getYMD(v.tl),
                            //     t2: getYMD(new Date(v.e+1000).toLocaleString()),
                            // });

                            own_at = i;
                        }
                    }
                    // SELL
                    else if (algos[algo].sell(v, i)) {
                        if (own_at >= 0) {
                            // if (TRADE) {
                            //     sell(symbol);
                            // }
                            trades.push({
                                s: symbol,
                                num: i - own_at,
                                1: own_at,
                                2: i,
                                // gain: (bars[i].c - bars[own_at].c) / bars[own_at].c * 100,
                                gain: (bars[i].c - bars[own_at].o) / bars[own_at].o * 100,
                                e1: bars[own_at].e,
                                e2: v.e,
                                t1: getYMD(bars[own_at].tl),
                                t2: getYMD(v.tl),
                            });
                            own_at = -1;
                        }
                    }
                }
                if (i === bars.length - 1) {
                    if (own_at > -1) {
                        const gain = (bars[i].c - bars[own_at].o) / bars[own_at].o * 100;
                        trades.push({ num: i - own_at, 1: own_at, 2: i, gain, e1: bars[own_at].e, e2: v.e, });
                    }
                }
            });
            let cumulative = 0;
            let cumulative_dollars = 1000;
            trades.forEach((v) => {
                cumulative += v.gain;
                v.gain_cumulative = cumulative;
                cumulative_dollars += cumulative_dollars * (v.gain / 100);
                // cumulative_dollars += 1000 * (v.gain / 100);
                v.gain_dollars = cumulative_dollars;
            });
            g = trades.map((v) => v.gain).reduce((p, c) => p + c);
            g_dollars = cumulative_dollars;
        };
        const last = bars[bars.length - 1];
        resolve({ symbol, gain_pct: g, gain_dollars: g_dollars, own: own_at, buy: last.o >= last.sma, sell: last.c <= last.lb, bars, trades });
        bars = undefined;
        trades = undefined;
    });
}

// =================================================
// TEST 4
// =================================================
async function test4(symbol = 'OKLO', log = true) {

    const INVESTMENT_SEED = 1000;
    const ALGORITHM = 'C1';
    const init = (bollinger_selected_symbol === null);
    bollinger_selected_symbol = symbol;


    // const favs = ['GE',].sort();
    // 
    // const favs = ['FTI', 'BKR', 'VAL', 'KGS'].sort();
    const favs = ['DDOG', 'FOX', 'GE', 'GEV', 'IBM', 'JPM', 'NFLX', 'OKLO', 'PLTR', 'PSIX',].sort();
    const crypto = [
        // 'BAT/USD', 'PEPE/USD', 
        // 'TRUMP/USD', 'SHIB/USD', 'XTC/USD', 'YFI/USD', 'DOT/USD', 
        'AVAX/USD', 'BCH/USD', 'BTC/USD', 'DOGE/USD', 'ETH/USD', 'SUSHI/USD',
        'GRT/USD', 'SOL/USD', 'UNI/USD', 'XRP/USD',
    ].sort();
    const research_crypto = [
        // 'BAT/USD', 'PEPE/USD', 'TRUMP/USD', 
        'AVAX/USD', 'BCH/USD', 'BTC/USD', 'CRV/USD', 'DOGE/USD', 'ETH/USD', 'LINK/USD', 'LTC/USD', 'SUSHI/USD',
        'DOT/USD', 'GRT/USD', 'SHIB/USD', 'SOL/USD', 'UNI/USD', /*'XTC/USD',*/ 'YFI/USD', 'XRP/USD',
    ].sort();
    const research = [
        // 'DDOG', 'FOX', 'GE', 'GEV', 'IBM', 'JPM', 'NFLX', 'OKLO', 'PLTR', 'PSIX',
        // 'SMCI', 'F', 'GM', 'NEGG', 'BETZ', 'IBET', 
        // 'DKNG', 'VZ', 'WM', 'LULU', 'UBER', 'BP', 'SPY', 'JPM', 
        // 'Z', 'T', 'MP', 'CVX', 'PM', 
        'HOOD',
        'AMD', 'AVGO', 'BETZ', 'BX', 'COIN', 'CVS',
        'IBIT', 'INTL', 'LEU', 'MDB', 'MSFT', 'NVDA', 'NIO', 'ONEQ', 'OPEN', 'ORCL',
        'QUBT', 'RKLB', 'SMCI', 'SNOW', 'TPB', 'TSEM', 'QQQ', 'TSLA', 'UUUU', 'WMT',
    ].sort();


    //#region ADD BUTTONS
    const add_buttons = (symbols, id, title = 'Title') => {
        let html = `<div 
            id="title-${title}"
            class="w3-col s12 m4 l2 _w3-margin w3-padding"
            style="border:1px solid white;"><b>${title}</b></div>`;
        symbols.forEach((s) => {
            const has_position = open_positions.findIndex((v) => v.symbol === s.replace('/', ''));
            // console.log(s, has_position);

            const status = all_symbols.find((v) => v.symbol === s);
            let status_color = '';
            if (status) {
                if (status.gain_pct >= 0) {
                    status_color = `rgb(0, 128, 0, ${Math.abs(status.gain_pct / 100)})`;
                } else if (status.gain_pct < 0) {
                    status_color = `rgb(255, 0, 0, ${Math.abs(status.gain_pct / 100)})`;
                }
            }
            // const last = status.bars[status.bars.length-2];
            const current = status.bars[status.bars.length - 1];
            // const should_sell = status.own >= 0 && current.c <= last.lb;
            const should_buy = current.c >= current.sma;
            const should_sell = current.c <= current.lb;
            // console.log(s, should_sell);
            const icon = [
                'DDOG', 'FOX', 'GE', 'GEV', 'IBM', 'JPM', 'NFLX', 'OKLO', 'PLTR', 'PSIX',
                'LEU', 'MP', 'TPB', 'QUBT'
            ].indexOf(s.split('/')[0]) >= 0 ? '<i class="fa fa-star w3-text-yellow" aria-hidden="true"></i>' : ''; //'<i class="fa fa-star-o w3-text-grey" aria-hidden="true"></i>';

            // up carot: &#9650;  &#9651;
            // down caret: &#9660;  &#9661;
            html += `<div 
            class="w3-col s4 m2 l1 _w3-margin w3-padding"
            style="cursor:pointer;border:1px solid${symbol === s ? ' #02dcff' : ' grey'};${should_sell && has_position >= 0 ? 'color:red;' : (should_buy ? 'color:#1dcf93;' : '')}"
            onclick="test4('${s}')">
            ${icon}
            ${s.split('/')[0]}
            ${has_position >= 0 ? `<div class="w3-right" style="margin-top:2px;background-color:${should_sell ? 'red' : 'aquamarine'};border-radius:15px;width:15px;height:15px;">&nbsp;</div>` : ''}
            ${status ? `<br/><div class="" style="color:white;background-color:${status ? status_color : ''};">` + round1(status.gain_pct) + '%</div>' : ''}
            </div>`;
        });
        document.getElementById(id).innerHTML = html + '<br/>';
    }
    //#endregion

    //#region LOAD DATA
    // * ------------------------
    // * LOAD DATA */
    // * ------------------------

    let open_positions = await positions();
    // .filter((v2)=>new Date(v2.t) >= new Date('2025-08-26'))
    let all_orders = (await orders())
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
    // console.log(open_positions, all_orders);

    let total_groups = 0;
    let total_groups_reinvest = 0;
    const tz = new Date().getTimezoneOffset() / 60;
    // const start = new Date(new Date(`2024-12-15T00:00:00-04:00`));
    const start = new Date(new Date(`2024-07-01T00:00:00-0${tz}:00`));
    const end = new Date(`${getYMD(new Date())}T23:59:59-0${tz}:00`);
    let index = 0;

    // console.log('----------------------------------------------------');
    const all_symbols_names = [...favs, ...crypto, ...research];
    const promises = all_symbols_names.map((s) => {
        return analyze_days(ALGORITHM, s, '1D', start.toISOString(), end.toISOString(), 100)
    });
    let all_symbols = await Promise.all(promises);

    // let data = await analyze_days('E', symbol, '1D', start.toISOString(), end.toISOString());
    let data = all_symbols.filter((v) => v.symbol === symbol)[0];
    let bars = data.bars;
    const chart_annotations = data.trades;
    //#endregion

    //#region CHART YTD DAYS
    // * ------------------------
    // * CHART YTD DAYS
    // * ------------------------
    let o = deepClone(chart_area_spline_options);
    o.chart.height = 500;
    o.chart.toolbar = { show: false };
    o.chart.sparkline = false;
    o.legend.show = false;
    o.xaxis.type = 'datetime';
    o.series = [];
    o.series.push({ name: 'Close', data: [] }); // , type: 'area', color: colors.blue + '10'
    o.series[0].data = bars.map((v) => { return { x: v.e, y: round2(v.c) } });
    o.series.push({ name: 'Trigger', color: colors.yellow, data: [] });
    o.series[1].data = bars.map((v) => { return { x: v.e, y: v.lb ? round2(v.lb) : null } });

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
        const g = round(seed * (a.gain / 100));
        o.annotations.xaxis.push({
            x: a.e1,
            x2: a.e2,
            borderColor: '#03fcfc10',
            fillColor: '#03fcfc20',
            strokeDashArray: 0,
            opacity: 1,
            label: {
                text: mobile_view ? '' : `${g}`,
                _text: `${round(INVESTMENT_SEED * (a.gain / 100))}`,
                orientation: 'horizontal',
                style: {
                    background: a.gain >= 0 ? colors.green : colors.red,
                    color: colors.white,
                    fontSize: '20px',
                }
            }
        });
        seed += g;
    })

    const pct = round1(chart_annotations.map((v) => v.gain).reduce((p, c) => p + c));
    const g = round(INVESTMENT_SEED * (pct / 100));
    const delta = round1((bars[bars.length - 1].c - bars[14].c) / bars[0].c * 100);
    o.title.text = `${symbol} | SEED $${seed.toLocaleString()} | 1K $${g.toLocaleString()} | ${pct}% | ${delta}% | ${chart_annotations.length} | $${o.series[0].data[o.series[0].data.length - 1].y}`;
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
    o.series[2].data = bars.map((v) => { return { x: v.e, y: round2(v.o) } });
    o.series.forEach((s) => {
        s.data = s.data.slice(-10);
    });
    o.annotations.xaxis.forEach((v) => v.label.text = v.label._text);
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
    o.chart.height = 240;
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
    chart_bollinger_2 = new ApexCharts(document.querySelector(`#chart-bollinger-1`), o);
    chart_bollinger_2.render();
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
    o.chart.height = isMobile() ? 350 : 225;
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
    const total = open_positions.length > 0 ? open_positions.map((v) => +(v.unrealized_pl)).reduce((p, c) => p + c) : 0;
    const total_invested = open_positions.length > 0 ? open_positions.map((v) => +(v.cost_basis)).reduce((p, c) => p + c) : 0;
    // const total_pct = open_positions.map((v) => +(v.unrealized_plpc) * 100).reduce((p, c) => p + c);
    const elem = document.getElementById('total-positions-2');
    elem.style.backgroundColor = total === 0 ? 'grey' : (total > 0 ? '#00b90a' : colors.red);
    elem.style.color = colors.black;
    elem.style.padding = '10px';
    elem.style.fontSize = isTablet() ? '140px !important' : (isMobile() ? '55px !important' : '');
    // <br/><span class="w3-small">${new Date().toLocaleString()}</span>
    elem.innerHTML = `$${round(total).toLocaleString()}<hr/>${round2(total / total_invested * 100)}%`;
    //#endregion

    //#region GROUP SUMMARIES
    // * -------------------------------------
    // * GROUP SUMMARIES
    // * -------------------------------------
    console.log('----------------------------------------------------');
    for await (const a of (init ? [favs, research, crypto, all_symbols.map((v) => v.symbol)] : [favs, research/*, crypto*/])) {

        const group_name = index === 0 ? 'FAVS' : (index === 1 ? 'R & D' : (index === 2 ? 'CRYPTO' : 'ALL'));
        // console.log(group_name);
        let all = all_symbols.filter((v) => a.indexOf(v.symbol) >= 0)

        const day_results = all;
        const gain_pct = all.map((v) => v.gain_pct).reduce((p, c) => p + c) / all.length;

        if (index < 3) {
            add_buttons(
                a,
                index === 0 ? 'symbol-buttons-bollinger-favs' : (index === 1 ? 'symbol-buttons-bollinger' : 'symbol-buttons-bollinger-crypto'),
                group_name
            );
        }

        let days = [];
        let day_gains = [];
        let day_gains_cumulative = [];
        let all_trades = all.map((v) => v.trades).reduce((p, c) => [...p, ...c]);
        let trade_days = all_trades.map((v) => v.e2).filter((v, i, a) => a.indexOf(v) === i).sort();
        let cumulative = 0;
        let summary_months = {};
        let summary_month_total = 0;
        let summary_total = 0;
        let summary_total_count = 0;
        let month = null;
        trade_days.forEach((v, i) => {
            let filtered = all_trades.filter((v2) => v2.e2 === v);
            const trades_total = filtered.length > 0 ? filtered.map((v2) => v2.gain).reduce((p, c) => p + c) : 0;
            const gain = (trades_total / 100) * (filtered.map((v) => v.s).filter((v, i, a) => i === a.indexOf(v)).length * 1000);
            cumulative += gain;
            days.push({ x: v, y: round3(cumulative) });

            day_gains.push({ x: v, y: round1(gain) })
            day_gains_cumulative.push({ x: v, y: round1(cumulative) })

            // -----------------------------------------------------
            /** MONTH SUMMARIES */
            const getMonthName = (month) => {
                return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month];
            }
            month = new Date(v).getFullYear() + '_' + (new Date(v).getMonth() + 1).toString().padStart(2, '0') + '_' + getMonthName(new Date(v).getMonth());
            if (!summary_months[month]) {
                // if (summary_months.length > 0) {
                // console.log(`%c${group_name} | ${month} | $${round1(summary_month_total).toLocaleString()}`, 'color:#e92cc1;');
                summary_total += summary_month_total;
                summary_total_count++;
                // }
                summary_months[month] = gain;
                summary_month_total = gain;
            } else {
                summary_month_total += gain;
                summary_months[month] += gain;
            }
        });


        const temp = Object.keys(summary_months).map((k) => summary_months[k]).sort((a, b) => b - a);
        const t = temp.slice(1, -1);
        // console.log(temp.sort((a, b) => b - a));
        // console.log(t);

        o = deepClone(chart_bar_options);
        o.chart.animations = { enabled: false };
        o.chart.height = 200;
        o.chart.sparkline = { enabled: true };
        o.xaxis.labels.show = false;
        o.series[0].data = Object.keys(summary_months).map((k) => {
            return {
                x: k,
                y: round(summary_months[k])
            }
        });
        o.yaxis.labels.formatter = function (x) {
            return `$${x.toLocaleString()}`;
        }
        o.annotations.points = [];
        o.dataLabels = {
            style: {
                fontSize: '14px',
            },
            formatter: function (text, op) {
                return [text, op.value]
            },
        };
        const avg = round((t.reduce((p, c) => p + c)) / (t.length));
        document.getElementById(`title-symbols-stacked-${index + 5}`).style.fontSize = '18px';
        document.getElementById(`title-symbols-stacked-${index + 5}`).style.color = '#fff';
        document.getElementById(`title-symbols-stacked-${index + 5}`).innerHTML = `${group_name} | $${round(summary_total).toLocaleString()} | AVG: $${avg.toLocaleString()}`;
        o.annotations.yaxis.push({ y: avg, borderColor: '#fff', strokeDashArray: 0, label: { _text: '$' + avg.toLocaleString(), offsetY: -100, style: { background: '#000', color: '#fff', fontSize: '20px' } } });
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
        // -----------------------------------------------------

        const data = day_gains_cumulative;
        const elem = document.getElementById(`title-symbols-stacked-${index + 1}`);
        elem.style.fontSize = '18px';
        elem.style.color = '#fff';
        elem.innerHTML = `${group_name} | $${round(cumulative).toLocaleString()}`;
        elem.innerHTML += ` | ${round(cumulative / (a.length * 1000) * 100)}%`;

        o = deepClone(chart_area_spline_options);
        // o.title = {
        //     text: `${group_name} | $${round(cumulative).toLocaleString()}`,
        //     style: { fontSize: '22px', color: '#fff' }
        // };
        o.xaxis.type = 'datetime';
        o.chart.height = 200;
        o.series = [];
        const tl = calculateTrendline(data.map((v) => v.y));
        o.series.push({ name: 'Close', type: 'area', color: '#03fcfc20', data });
        o.series.push({ name: 'Trendline', type: 'line', color: '#89f100ff', data: data.map((v, i) => { return { x: v.x, y: round1(tl.calculateY(i)) } }) });
        o.yaxis.min = -5;
        // o.yaxis.max = 125;
        const last = o.series[0].data[o.series[0].data.length - 1].y;
        // const pct = cumulative / (a.length * 1000) * 100;
        // o.annotations.yaxis.push({ y: last, borderColor: '#fff', label: { text: round1(pct) + '%', style: { fontSize: '20px' } } });
        o.yaxis.labels.formatter = function (x) {
            return `$${x.toLocaleString()}`;
        }
        c = index === 0 ? chart_symbols_stacked_1 : (index === 1 ? chart_symbols_stacked_2 : (index === 2 ? chart_symbols_stacked_3 : chart_symbols_stacked_4))
        if (c) {
            // c.destroy();
            c.updateOptions({
                //     title: o.title,
                series: o.series,
                //     annotations: o.annotations,
            })
        } else {
            c = new ApexCharts(document.querySelector(`#chart-symbols-stacked-${index + 1}`), o);
            c.render();
            index === 0 ? chart_symbols_stacked_1 = c : (index === 1 ? chart_symbols_stacked_2 = c : (index === 2 ? chart_symbols_stacked_3 = c : chart_symbols_stacked_4 = c))
        }
        total_groups += index < 3 ? round1(last) : 0;
        // total_groups += round1(10 * 1000 * (cumulative / 10000 / 1000));
        // console.log(index, round3(tl.slope));

        // })
        const cumulative_g = round2(all.map((v) => v.gain_dollars).reduce((p, c) => p + c))
        total_groups_reinvest += index < 3 ? round1(cumulative_g) : 0;
        // console.log(`%c${group_name} | ${cumulative_g.toLocaleString()} | ${round(cumulative_g / (1000 * a.length) * 100)} %`, 'color:aquamarine');

        /** GROUP TITLE CARD */
        if (index < 3) {
            document.getElementById(`title-${group_name}`)
                .innerHTML += `<br/><div style="border-top:1px solid;">$<b>${round(cumulative_g / 1000).toLocaleString()} K</b> | ${round(cumulative_g / (1000 * a.length) * 100)}% | ${a.length}K</div>`
        }

        let months_total = 0;
        Object.keys(summary_months).forEach((k) => {
            months_total += summary_months[k];
            console.log(`%c${group_name} | ${k} | $${round1(summary_months[k]).toLocaleString()}`, 'color:aquamarine;'); //#e92cc1
        });
        console.log(`%c${group_name} SUMMARY | TOTAL: $${round(months_total).toLocaleString()} | AVG: $${round((t.reduce((p, c) => p + c)) / (t.length)).toLocaleString()}`, 'color:#e92cc1;');
        // console.table(summary_months);

        // ---------------------------------------------------------------
        // TODO: calculate how many points in the future - it is NOT days
        console.log(`%c${group_name} | ${round2(cumulative).toLocaleString()} | ${round1(tl.calculateY(days.length * 2)).toLocaleString()} | ${round1(tl.calculateY(days.length * 3)).toLocaleString()} | SEED ${a.length}K`, 'color:orange;');
        // ---------------------------------------------------------------

        index++;
        o = undefined;
        all = undefined;
        all_trades = undefined;
        trade_days = undefined;
        days = undefined;
        day_gains = undefined;
        day_gains_cumulative = undefined;
    };
    // console.log(`%cTOTAL GROUPS | $${round1(total_groups)}K | ${round2(total_groups / 30 * 100)}%`, 'color:orange;');
    // console.log('----------------------------------------------------');
    console.log(`%cTOTAL GROUPS REINVEST | $${round(total_groups_reinvest).toLocaleString()}`, 'color:aquamarine;');
    console.log(`%cTOTAL GROUPS | $${round(total_groups).toLocaleString()}`, 'color:coral;');
    //#endregion

    /** log the data for analysis */
    // console.log(all_symbols);

    /** dipose objects */
    open_positions = undefined;
    all_orders = undefined;
    all_symbols = undefined;
    data = undefined;
    bars = undefined;
}
