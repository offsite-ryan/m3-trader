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

        let bars = await alpaca_data.bars(symbol, '1D', start, end);
        let was_below = true;
        let was_above = true;
        let own_at = -1;
        let g = 0;
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
            F1: { buy: (v, i) => v.dow !== 5 && v.o >= v.lb, sell: (v, i) => v.dow === 5 || v.c < v.lb },
            F2: { buy: (v, i) => v.dow !== 5 && v.c >= v.lb, sell: (v, i) => v.dow === 5 || v.c < v.lb },
            G: { buy: (v, i) => v.c >= v.lb && v.p5 >= v.c, sell: (v, i) => v.c < v.lb },
            // H: { buy: (v, i) => v.c >= v.p5, sell: (v, i) => v.c < v.p5 },
            H: { buy: (v, i) => v.o >= v.lb, sell: (v, i) => true }, // bu/sell each day if above lower bound
            // ----------
            // CRYPTO
            // ----------
            C1: { buy: (v, i) => v.o >= v.sma, sell: (v) => v.c <= v.lb },
            C2: { buy: (v, i) => v.o >= v.lb, sell: (v) => v.c <= v.ub },
            C3: { buy: (v, i) => v.c >= v.o, sell: (v) => v.c <= v.o },
            Z: { buy: (v, i) => false, sell: (v) => false },
        };
        // algo = 'D';
        // algo = 'E';
        algo = symbol.endsWith('USD') ? 'D' : 'F1';
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
            trades.forEach((v) => {
                cumulative += v.gain;
                v.gain_cumulative = cumulative;
            });
            g = trades.map((v) => v.gain).reduce((p, c) => p + c);
        };
        const last = bars[bars.length - 1];
        resolve({ symbol, gain_pct: g, own: own_at, buy: last.o >= last.sma, sell: last.c <= last.lb, bars, trades });
        bars = undefined;
        trades = undefined;
    });
}
// =================================================
// TEST 4
// =================================================
async function test4(symbol = 'OKLO', log = true) {

    const INVESTMENT_SEED = 5000;
    const ALGORITHM = 'C1';
    const init = (bollinger_selected_symbol === null);
    bollinger_selected_symbol = symbol;


    // const favs = ['FOX', ].sort();
    const favs = ['DDOG', 'FOX', 'GE', 'GEV', 'IBM', 'JPM', 'NFLX', 'OKLO', 'PLTR', 'PSIX',].sort();
    const crypto = [
        // 'BAT/USD', 'PEPE/USD', 'TRUMP/USD', 
        'AVAX/USD', 'BCH/USD', 'BTC/USD', 'CRV/USD', 'DOGE/USD', 'ETH/USD', 'LINK/USD', 'LTC/USD', 'SUSHI/USD',
        'DOT/USD', 'GRT/USD', 'SHIB/USD', 'SOL/USD', 'UNI/USD', /*'XTC/USD',*/ 'YFI/USD', 'XRP/USD',
    ].sort();
    const research_crypto = [
        // 'PEPE/USD', 'XTC/USD', 'XRP/USD',
        'AVAX/USD', 'BCH/USD', 'BTC/USD', 'DOGE/USD', 'ETH/USD', 'GRT/USD', 'LTC/USD', 'SOL/USD', 'SHIB/USD', 'SUSHI/USD',
        'BAT/USD', 'CRV/USD', 'DOT/USD', 'LINK/USD', 'SOL/USD', 'UNI/USD', 'YFI/USD', 'TRUMP/USD'
    ].sort();
    const research = [
        // 'SMCI', 'F', 'GM', 'NEGG', 'BETZ', 'IBET', 
        // 'DKNG', 'VZ', 'WM', 'LULU', 'UBER', 'BP', 'SPY', 
        'AMD', 'AVGO', 'BETZ', 'BX', 'COIN', 'CVS', 'CVX',
        'IBIT', 'INTL', 'JPM', 'MDB', 'MSFT', 'NVDA', 'NIO', 'ONEQ', 'OPEN', 'ORCL', 'PM',
        'RKLB', 'SNOW', 'T', 'TSEM', 'QQQ', 'TSLA', 'UUUU', 'WMT', 'Z'
    ].sort();


    const add_buttons = (symbols, id) => {
        let html = '';
        symbols.forEach((s) => {
            const has_position = open_positions.findIndex((v) => v.symbol === s.replace('/', ''));
            // console.log(s, has_position);

            const status = all.find((v) => v.symbol === s);
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

            html += `<div 
            class="w3-col s4 m2 l1 _w3-margin w3-padding"
            style="border:1px solid${symbol === s ? ' #02dcff' : ' grey'};${should_sell && has_position >= 0 ? 'color:red;' : (should_buy ? 'color:#1dcf93;' : '')}"
            onclick="test4('${s}')"
            >${s.split('/')[0]}
            ${has_position >= 0 ? `<div class="w3-right" style="margin-top:2px;background-color:${should_sell ? 'red' : 'aquamarine'};border-radius:15px;width:15px;height:15px;">&nbsp;</div>` : ''}
            ${status ? `<br/><div class="" style="color:white;background-color:${status ? status_color : ''};">` + round1(status.gain_pct) + '%</div>' : ''}
            </div>`;
        });
        document.getElementById(id).innerHTML = html + '<br/>';
    }

    let all = null;
    // const start = new Date(new Date('2024-12-01T00:00:00-05:00'));
    // const start = new Date(new Date(`2024-07-29T${symbol.endsWith('USD') ? '00:00:00-05:00' : '09:30:00-05:00'}`));
    // const end = new Date(getYMD(new Date()) + `${symbol.endsWith('USD') ? 'T23:59:59-04:00' : 'T16:00:00-04:00'}`);

    const open_positions = await positions();
    // .filter((v2)=>new Date(v2.t) >= new Date('2025-08-26'))
    const all_orders = (await orders())
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


    // ------------------------
    // /** GROUP CHARTS */
    // ------------------------
    let total_groups = 0;
    const tz = new Date().getTimezoneOffset() / 60;
    // const start = new Date(new Date(`2024-12-15T00:00:00-04:00`));
    const start = new Date(new Date(`2024-07-29T00:00:00-0${tz}:00`));
    const end = new Date(`${getYMD(new Date())}T23:59:59-0${tz}:00`);
    let index = 0;
    console.log('----------------------------------------------------');
    for await (const a of (init ? [favs, crypto, research] : [favs, crypto])) {
        // for await (const a of [favs, crypto, research]) {
        const promises = a.map((s) => {
            return analyze_days(ALGORITHM, s, '1D', start.toISOString(), end.toISOString(), 100)
        });
        all = await Promise.all(promises);
        const day_results = all;
        const gain_pct = all.map((v) => v.gain_pct).reduce((p, c) => p + c) / all.length;
        // console.log(`%cALL | ${index === 0 ? 'FAVS' : (index === 1 ? 'CRYPTO' : 'RESEARCH')}`, 'color:orange;');
        // console.log(all);

        add_buttons(a, index === 0 ? 'symbol-buttons-bollinger-favs' : (index === 1 ? 'symbol-buttons-bollinger-crypto' : 'symbol-buttons-bollinger'))

        if (index === 2) {
            all.forEach((s) => {
                treemap_data.push({ x: s.symbol, y: round1(s.gain_pct) })
            })
        }

        const days = [];
        // const days_per_symbol = {};
        // all.forEach((v) => days_per_symbol[v.symbol] = { c: 0, data: [] });
        const all_trades = all.map((v) => v.trades).reduce((p, c) => [...p, ...c]);
        let trade_days = all_trades.map((v) => v.e2).filter((v, i, a) => a.indexOf(v) === i).sort();
        // trade_days = trade_days.sort((a, b) => a.e2 < b.e2);
        let cumulative = 0;
        trade_days.forEach((v, i) => {
            const filtered = all_trades.filter((v2) => v2.e2 === v);
            const gain = filtered.map((v2) => v2.gain_cumulative).reduce((p, c) => p + c);
            // const gain = filtered.map((v2) => v2.gain).reduce((p, c) => p + c);
            cumulative += gain;
            days.push({ x: v, y: round1(cumulative / 100) });

            // filtered.forEach((v2) => {
            //     days_per_symbol[v2.s].data.push({ x: v, y: round1(cumulative / 100) })
            // });
        });
        // console.log(days);
        let o = deepClone(chart_area_spline_options);
        o.title = {
            // text: `${index === 0 ? 'FAVS' : (index === 1 ? 'CRYPTO' : 'RESEARCH')} | $${round1(5*1000*all.length*(cumulative/10000/1000)).toLocaleString()}K`,
            text: `${index === 0 ? 'FAVS' : (index === 1 ? 'CRYPTO' : 'RESEARCH')} | $${round1(10 * 1000 * (cumulative / 10000 / 1000)).toLocaleString()}K`,
            style: { fontSize: '22px', color: '#fff' }
        };
        o.xaxis.type = 'datetime';
        o.chart.height = 200;
        o.series = [];
        const tl = calculateTrendline(days.map((v) => v.y));
        o.series.push({ name: 'Close', type: 'area', color: '#03fcfc20', data: days });
        o.series.push({ name: 'Trendline', type: 'line', color: '#89f100ff', data: days.map((v, i) => { return { x: v.x, y: round1(tl.calculateY(i)) } }) });
        // o.series.push({ name: 'Close', type: 'area', color: '#03fcfc20', data: all[0].trades.map((v)=>{ return {x: v.e2, y: v.gain_cumulative}}) });
        // o.yaxis.min = -5;
        // o.yaxis.max = 125;
        const last = o.series[0].data[o.series[0].data.length - 1].y;
        o.annotations.yaxis.push({ y: last, borderColor: '#fff', label: { text: last + '%', style: { fontSize: '20px' } } });
        let c = index === 0 ? chart_symbols_stacked_1 : (index === 1 ? chart_symbols_stacked_2 : chart_symbols_stacked_3)
        if (c) {
            c.destroy();
            // c.updateOptions({
            //     title: o.title,
            //     series: o.series,
            //     annotations: o.annotations,
            // })
        } else {
            c = new ApexCharts(document.querySelector(`#chart-symbols-stacked-${index + 1}`), o);
            c.render();
            o = undefined;
        }
        total_groups += round1(last);
        // total_groups += round1(10 * 1000 * (cumulative / 10000 / 1000));
        // console.log(index, round3(tl.slope));

        // ------------------------
        // /** GROUP CHARTS STACKED BY SYMBOL */
        // ------------------------

        index++;
        all = undefined;
    };
    // console.log(`%cTOTAL GROUPS | $${round1(total_groups)}K | ${round2(total_groups / 30 * 100)}%`, 'color:orange;');
    console.log(`%cTOTAL GROUPS | ${round1(total_groups)}%`, 'color:orange;');

    // add_buttons(favs, 'symbol-buttons-bollinger-favs');
    // add_buttons(crypto.sort(), 'symbol-buttons-bollinger-crypto');
    // add_buttons(research, 'symbol-buttons-bollinger');

    // const start = new Date(new Date('2024-12-01T00:00:00-05:00'));
    // const end = new Date(getYMD(new Date()) + 'T23:59:59-04:00');
    const data = await analyze_days('E', symbol, '1D', start.toISOString(), end.toISOString());
    const bars = data.bars;
    const chart_annotations = data.trades;
    // const treemap_data = [];

    // ------------------------
    // /** CHART YTD DAYS */
    // ------------------------
    let o = deepClone(chart_area_spline_options);
    o.chart.height = 500;
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

    let e = new Date(start).getTime();
    while (e <= bars[bars.length - 1].e) {
        if (new Date(e).getDate() === 1) {
            o.annotations.xaxis.push({
                x: e
            });
        }
        e += (24 * 60 * 60 * 1000);
    }

    chart_annotations.forEach((a) => {
        o.annotations.xaxis.push({
            x: a.e1,
            x2: a.e2,
            borderColor: '#03fcfc10',
            fillColor: '#03fcfc20',
            strokeDashArray: 0,
            opacity: 1,
            label: {
                text: mobile_view ? '' : `${round(INVESTMENT_SEED * (a.gain / 100))}`,
                _text: `${round(INVESTMENT_SEED * (a.gain / 100))}`,
                orientation: 'horizontal',
                style: {
                    background: a.gain >= 0 ? colors.green : colors.red,
                    color: colors.white,
                    fontSize: '20px',
                }
            }
        });
    })

    const pct = round1(chart_annotations.map((v) => v.gain).reduce((p, c) => p + c));
    const g = round(INVESTMENT_SEED * (pct / 100));
    const delta = round1((bars[bars.length - 1].c - bars[14].c) / bars[0].c * 100);
    o.title.text = `${symbol} | $${g.toLocaleString()} | ${pct}% | ${delta}% | ${chart_annotations.length} | $${o.series[0].data[o.series[0].data.length - 1].y}`;
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

    // -------------------------------------
    // CHART ACIVE POSITIONS
    // -------------------------------------
    // orders().then((v)=>console.log(v.map((v)=>{return {s: v.symbol, side: v.side, c: round(v.filled_avg_price * v.filled_qty), d: new Date(v.filled_at).toLocaleString() };})));
    // orders().then((v)=>console.log(v.map((v)=>{return {s: v.symbol, side: v.side, c: (v.filled_avg_price * v.filled_qty), d: new Date(v.filled_at).toLocaleString(), e: new Date(v.filled_at).getTime() };}).filter((v)=>v.e > new Date('2025-08-25T23:59:59'))));

    o = deepClone(chart_bar_options);
    // o.chart.type = 'treemap';
    o.chart.animations = { enabled: false };
    // unrealized_plpc
    o.series[0].data = open_positions.map((v) => {
        return {
            x: [
                v.symbol.replace('USD', ''),
                isMobile() ? '' : `${round1(v.unrealized_plpc * 100)}%`
            ],
            // x: v.symbol.replace('USD', ''),
            y: round(v.unrealized_pl)
        }
    });
    o.yaxis.labels.formatter = function (x) {
        return `$${x.toLocaleString()}`;
    }
    o.annotations.points = [];
    o.chart.height = isMobile() ? 350 : 225;
    o.dataLabels = {
        offsetY: -24,
        style: {
            fontSize: '16px',
        }
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

    // -------------------------------------
    // TOTAL SUMMARY
    // -------------------------------------
    const total = open_positions.length > 0 ? open_positions.map((v) => +(v.unrealized_pl)).reduce((p, c) => p + c) : 0;
    // const total_pct = open_positions.map((v) => +(v.unrealized_plpc) * 100).reduce((p, c) => p + c);
    const elem = document.getElementById('total-positions-2');
    elem.style.backgroundColor = total === 0 ? 'grey' : (total > 0 ? '#00b90a' : colors.red);
    elem.style.color = colors.black;
    elem.style.padding = '10px';
    // let fontSize = null;
    // if (isTablet()) {
    //     fontSize = '100px !important';
    // }
    // elem.style.fontSize = fontSize;
    elem.style.fontSize = isTablet() ? '140px !important' : (isMobile() ? '55px !important' : '');
    elem.innerHTML = `$${round(total).toLocaleString()}<hr/>${round2(total / (42 * 1000) * 100)}%`;
    // elem.innerHTML = `$${round(total).toLocaleString()}<hr/>${round2(total / (INVESTMENT_SEED * open_positions.length) * 100)}%`;
    // elem.innerHTML = `$${round(total).toLocaleString()}<hr/>${round2(total_pct)}%`;
}
