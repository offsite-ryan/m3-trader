// const errors = []
// const originalError = console.error;
// console.error = function (...args) {
//     originalError(...args);
//     errors.push(...args);
// };

const GET = 'GET';
const POST = 'POST';
const DELETE = 'DELETE';
const buy_sell_root_url = 'https://paper-api.alpaca.markets';
// const options = (method, payload) => {
//     const obj = {
//         method: method.toUpperCase(),
//         headers: {
//             accept: 'application/json',
//             'APCA-API-KEY-ID': KEY,
//             'APCA-API-SECRET-KEY': SECRET,
//         }
//     }
//     if (payload !== null) {
//         obj.body = JSON.stringify(payload);
//     }
//     return obj;
// }
function buy(symbol, spend) {
    return new Promise((resolve, reject) => {
        payload = {
            side: 'buy',
            type: 'market',
            // time_in_force: symbol.endsWith('/USD') ? 'gtc' : 'day',
            time_in_force: symbol.endsWith('/USD') ? 'ioc' : 'day',
            symbol: symbol, //.replace('/', ''),
            // qty: qty.toString(), // /** quantity to buy */
            notional: round2(spend).toString() // /** dollar amount to buy */
        };
        const options = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'APCA-API-KEY-ID': KEY,
                'APCA-API-SECRET-KEY': SECRET,
            },
            body: JSON.stringify(payload),
        };
        let url = `${buy_sell_root_url}/v2/orders`;
        fetch(url, options)
            // fetch(url, options('POST', payload))
            .then(res => res.json())
            .then(res => { console.log('BUY', symbol, res); resolve(res) })
            .catch((err) => { console.error('error in buy()', err) });
    });
}
function buy_symbols(symbols, spend) {
    return new Promise(async (resolve, reject) => {
        const obj = {};
        symbols = symbols.split(',');
        for await (const symbol of symbols) {
            const res = await buy(symbol, spend);
            obj[symbol] = res;
            console.log(`Bought ${symbol} for $${spend}`, res);
            await sleep(2000);
        }
        console.log(obj);
        // resolve(res);
    });
}
function sell_symbols(symbols) {
    return new Promise(async (resolve, reject) => {
        const obj = {}; v;
        symbols = symbols.split(',');
        for await (const symbol of symbols) {
            const res = await sell(symbol);
            obj[symbol] = res;
            console.log(`Sold ${symbol}`, res);
            await sleep(1000);
        }
        console.log(obj);
        // resolve(res);
    });
}
function sell(symbol) {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'DELETE',
            headers: {
                accept: 'application/json',
                'APCA-API-KEY-ID': KEY,
                'APCA-API-SECRET-KEY': SECRET,
            }
        };
        let url = `${buy_sell_root_url}/v2/positions/${symbol.replace('/', '')}?percentage=100`;
        fetch(url, options)
            .then(res => res.json())
            .then(res => { console.log('SELL', symbol, res); resolve(res); })
            .catch(err => console.error('error in sell()', err));
    });
}
function liquidate() {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'DELETE',
            headers: {
                accept: 'application/json',
                'APCA-API-KEY-ID': KEY,
                'APCA-API-SECRET-KEY': SECRET,
            }
        };
        // https://paper-api.alpaca.markets/v2/positions
        let url = `${buy_sell_root_url}/v2/positions`;
        fetch(url, options)
            .then(res => res.json())
            .then(res => { console.log('LIQUIDATE', res); resolve(res); })
            .catch(err => console.error('error in liquidate()', err));
    });
}
function positions() {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'APCA-API-KEY-ID': KEY,
                'APCA-API-SECRET-KEY': SECRET,
            }
        };

        fetch(`${buy_sell_root_url}/v2/positions`, options)
            .then(res => res.json())
            // .then((res)=>{})
            .then(res => resolve(res))
            .catch(err => console.error('error in positions()', err));
    });
}
function orders(status = 'all') {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'APCA-API-KEY-ID': KEY,
                'APCA-API-SECRET-KEY': SECRET,
            }
        };

        // orders().then((v)=>console.log(v.map((v2)=>{ return {symbol:v2.symbol, side: v2.side, price: v2.side === 'buy' ? -(+(v2.filled_avg_price*v2.filled_qty)) : +(v2.filled_avg_price*v2.filled_qty), stamp: new Date(v2.filled_at).toLocaleString()}}).map((v2)=>v2.price).reduce((p,c)=>p+c)))
        fetch(`${buy_sell_root_url}/v2/orders?status=all&limit=500&direction=desc`, options)
            // fetch(`${buy_sell_root_url}/v2/orders?status=${status}&limit=500`, options)
            .then(res => res.json())
            .then(res => resolve(res))
            .catch(err => console.error('error in orders()', err));
    });
}
function quote(symbol, start = getTodayLocal()) {
    return new Promise((resolve, reject) => {
        let url = `https://data.alpaca.markets/v2/stocks/${symbol}/quotes?start=${start}&limit=1&feed=sip&sort=asc`;
        if (symbol.endsWith('/USD')) {
            // https://data.alpaca.markets/v1beta3/crypto/us/quotes?symbols=AVAX%2FUSD&start=2025-07-28T04%3A03%3A00Z&limit=1&sort=desc
            url = `https://data.alpaca.markets/v1beta3/crypto/us/quotes?symbols=${symbol}&start=${start}&limit=1&sort=desc`
            resolve(null);
        }
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'APCA-API-KEY-ID': KEY,
                'APCA-API-SECRET-KEY': SECRET,
            }
        };

        fetch(url, options)
            .then(res => res.json())
            .then(res => {
                const q = symbol.endsWith('/USD') ? res.quotes[symbol][0] : res.quotes[0];
                resolve(q);
            })
            .then(res => resolve(res))
            .catch(err => console.error('error in quote()', err));

    });
}
function fee() {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'APCA-API-KEY-ID': KEY,
                'APCA-API-SECRET-KEY': SECRET
            }
        };

        try {
            fetch('https://paper-api.alpaca.markets/v2/account/activities/CFEE?direction=desc&page_size=100', options)
                .then(res => res.json())
                .then(res => {
                    console.log(res.map((v) => { return { date: v.date, amount: parseFloat(v.net_amount) } }).map((v) => v.amount).reduce((p, c) => p + c));
                    resolve(res);
                })
                .catch(err => console.error('error in fee()', err));
        } catch (err) {
            console.error(err);
        }
    });
}
function summarize_orders(crypto = true) {
    return new Promise((resolve, reject) => {
        const data = [];
        orders().then((v) => {
            // data.push(...v.map((v2) => {
            // data.push(...v.filter((v2) => v2.status === 'filled').map((v2) => {
            data.push(...v.filter((v2) => +(v2.filled_qty) !== 0).map((v2) => {
                return {
                    symbol: v2.symbol,
                    side: v2.side,
                    price: v2.side === 'buy' ? -(+(v2.filled_avg_price * v2.filled_qty)) : +(v2.filled_avg_price * v2.filled_qty),
                    avg_price: v2.filled_avg_price,
                    qty: v2.filled_qty,
                    stamp: new Date(v2.submitted_at).toLocaleString()
                    // stamp: new Date(v2.filled_at).toLocaleString()
                }
            })
            )
            // console.table(data);
            // console.log(v.map((v2) => { return { symbol: v2.symbol, side: v2.side, price: v2.side === 'buy' ? -(+(v2.filled_avg_price * v2.filled_qty)) : +(v2.filled_avg_price * v2.filled_qty), stamp: new Date(v2.filled_at).toLocaleString() } }).map((v2) => v2.price).reduce((p, c) => p + c))
            resolve({
                total: data.length > 0 ? round2(data.map((v2) => v2.price).reduce((p, c) => p + c)) : 0,
                data
            });
        })
    });
}
function account() {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'APCA-API-KEY-ID': KEY,
                'APCA-API-SECRET-KEY': SECRET
            }
        };

        fetch('https://paper-api.alpaca.markets/v2/account', options)
            .then(res => res.json())
            .then(res => resolve({ cash: (+(res.cash)).toLocaleString(), asof: res.balance_asof, fees: res.accrued_fees, status: res.status }))
            .catch(err => console.error(err));
    })
}
function account_history(period = '1W', timeframe = '1H') {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'APCA-API-KEY-ID': KEY,
                'APCA-API-SECRET-KEY': SECRET
            }
        };

        fetch(`https://paper-api.alpaca.markets/v2/account/portfolio/history?period=${period}&timeframe=${timeframe}&intraday_reporting=continuous&pnl_reset=per_day`, options)
            .then(res => res.json())
            .then((res) => {
                // console.log(res);
                const data = [];
                res.equity.forEach((d, i) => {
                    if (d > 0) {
                        data.push({
                            stamp: new Date(res.timestamp[i] * 1000).toLocaleString(),
                            eqity: d,
                            day: res.profit_loss[i],
                            gain: round2(d - res.base_value)
                        })
                    }
                })
                resolve(data);
                // console.group();
                // data.forEach((v)=>console.log(v));
                // console.groupEnd();
            })
            .catch(err => console.error(err));
    });
}
async function summary(clearConsole = true) {
    if (clearConsole) {
        console.clear();
    }
    // console.table([await account()]);
    // console.table(await account_history('1M', '1D'));
    const orders = await summarize_orders();
    const open_positions = await positions();
    document.getElementById('positions').style.display = open_positions.length > 0 ? 'block' : 'none';
    // console.table(orders.data);
    // console.log(orders.total);
    let round_trips = [];
    const obj = {};
    let temp = {};
    const data = orders.data.reverse();
    data.forEach((v, i) => {
        // const key = `${v.stamp.split(',')[0]}_${v.symbol}`;
        const key = `${v.symbol}`;
        let stamp = getYMD(v.stamp.split(',')[0]);
        if (!temp[key]) {
            temp[key] = { symbol: v.symbol, stamp, buy: 0, sell: 0, gain: 0, stamp: v.stamp.split(',')[0] };
        }

        // if (obj[`${stamp}_${key}`]) {
        //     stamp += '_2';
        // }
        if (v.side === 'buy') {
            temp[key].buy += round2(v.price);
            temp[key].avg_price += round2(+(v.avg_price));
            temp[key].qty += round2(+(v.qty));
        } else {
            temp[key].sell += round2(v.price);
            temp[key].gain += round2(temp[key].sell + temp[key].buy);

            round_trips.push(deepClone(temp[key]));
            // delete temp[key].stamp;

            if (!obj[`${stamp}_${v.symbol}`]) {
                obj[`${stamp}_${v.symbol}`] = temp[key];
            } else {
                // /** ADD TO EXISTING DAY */
                ['buy', 'sell', 'gain'].forEach((k) => {
                    obj[`${stamp}_${v.symbol}`][k] += temp[key][k];
                    obj[`${stamp}_${v.symbol}`][k] = round2(obj[`${stamp}_${v.symbol}`][k]);
                })
            }
            delete temp[key];
        }
    });
    Object.keys(temp).forEach((k) => {
        const key = `${getYMD(temp[k].stamp)}_${k}`;
        delete temp[k].stamp;
        obj[key] = temp[k];
    })
    // console.table(round_trips, round_trips.map((v) => v.gain).reduce((p, c) => p + c));
    // console.log(round2(round_trips.map((v) => v.gain).reduce((p, c) => p + c)));

    temp = {};
    Object.keys(obj).sort().filter((k) => isCrypto ? k.endsWith('USD') : !k.endsWith('USD')).forEach((k) => {
        const key = `${k.split('_')[0]}`;
        if (!temp[key]) {
            temp[key] = 0;
        }
        temp[key] += obj[k].gain;
        temp[key] = round2(temp[key]);
    });
    // console.table(temp);

    // temp[Object.keys(temp)[Object.keys(temp).length - 1]] = round2(open_positions.map((v) => +(v.unrealized_pl)).reduce((p, c) => p + c));
    let total = 0;
    let treemap_data = [];
    let html = [];
    Object.keys(temp).sort().forEach((k) => {
        const v = temp[k];
        total += v;
        treemap_data.push({ x: k, y: round2(v) });
        const color = v >= 0 ? '#00b90a' : 'red';
        html.push(`<tr>
                    <td style="width:55%;">${k}</td>
                    <td style="color:${color};">${v}</td>
                </tr>`);
    });
    document.getElementById('table-summary-rows').innerHTML = html.reverse().join('\n');
    document.getElementById('total-days').innerHTML = `$${round2(total).toLocaleString()} | ${round1(total / seed * 100)}%`;

    // /** DAY SUMMARIES CHART */
    let options = deepClone(chart_bar_options);
    options.series[0].data = treemap_data;
    let min = Math.min(MAX_LOSS, ...options.series[0].data.map((v) => v.y));
    let max = Math.max(...options.series[0].data.map((v) => v.y));
    let cumulative = 0;
    // options.series[0].data.map((v, i) => { total += v.y; cumulative.push({ x: v.x, y: total }) });
    options.series.push({
        name: 'Cumulative',
        type: 'area',
        color: '#00eeff30',
        data: options.series[0].data.map((v, i) => {
            cumulative += v.y;
            return { x: v.x, y: cumulative }
        })
    });

    tl = calculateTrendline(options.series[1].data.map((v) => v.y));
    options.series.push({
        name: 'Trendline',
        type: 'line',
        color: '#00eeff',
        data: options.series[1].data.map((v, i) => {
            return { x: v.x, y: tl.calculateY(i) };
        })
    });
    // console.table(
    //     {
    //         [`projection ${options.series[1].data.length}`]: round2(tl.calculateY(options.series[1].data.length)).toLocaleString(),
    //         'projection 30': round2(tl.calculateY(30)).toLocaleString(),
    //         'projection 180': round2(tl.calculateY(180)).toLocaleString(),
    //         'projection 365': round2(tl.calculateY(365)).toLocaleString(),
    //     }
    // );

    options.annotations.yaxis[1].y = treemap_data.length > 0 ? treemap_data.map((v) => v.y).reduce((p, c) => p + c) / treemap_data.length : 0;
    options.annotations.yaxis[1].label = {
        text: `$${round(treemap_data.length > 0 ? treemap_data.map((v) => v.y).reduce((p, c) => p + c) / treemap_data.length : 0).toLocaleString()}`,
        position: 'left',
        offsetX: 15,
        style: {
            fontSize: '18px',
            color: '#fff',
            background: '#00b90a'
        }
    };
    delete options.annotations.yaxis[2];
    delete options.annotations.points;
    options.chart.height = 250;
    options.xaxis.labels.formatter = function (x) {
        return `${x.toString().substring(5)}`;
    }
    options.yaxis.labels.formatter = function (x) {
        return `$${x.toLocaleString()}`;
    }
    if (chart_treemap_3) {
        chart_treemap_3.destroy();
    }
    chart_treemap_3 = new ApexCharts(document.querySelector("#chart-treemap-3"), options);
    chart_treemap_3.render();

    total = 0;
    html = [];
    let last_day = '';
    round_trips.filter((v) => isCrypto ? v.symbol.endsWith('USD') : !v.symbol.endsWith('USD')).forEach((v, i) => {
        // Object.keys(obj).sort().filter((k) => isCrypto ? k.endsWith('USD') : !k.endsWith('USD')).forEach((k, i) => {
        // const v = obj[k];
        total += v.gain;
        const color = v.gain >= 0 ? '#00b90a' : 'red';
        // const day = k.split('_')[0];
        const day = v.stamp;
        html.push(`<tr style="${last_day !== v.stamp ? 'border-bottom:1px solid #616161;' : ''}">
                    <td style="width:35%;">${v.symbol}_${v.stamp}</td>
                    <td>${v.buy}</td>
                    <td>${v.sell}</td>
                    <!--<td>${v.avg_price}</td>
                    <td>${v.qty}</td>-->
                    <td style="color:${color};">${v.gain}</td>
                </tr>`
        );
        last_day = day;
    });
    document.getElementById('table-orders-rows').innerHTML = html.reverse().join('\n');
    document.getElementById('total-orders').innerHTML = `$${round2(total).toLocaleString()} | ${round1(total / seed * 100)}%`;

    // let table = document.getElementById("table-orders-rows");
    // let trs = table.rows;
    // Array.from(trs)
    //     .sort((a, b) => b.cells[0].textContent - a.cells[0].textContent)
    //     .forEach(tr => table.appendChild(tr));

    // /** POSITIONS */
    total = 0;
    treemap_data = [];
    html = ``;
    open_positions.filter((v) => isCrypto ? v.symbol.endsWith('USD') : !v.symbol.endsWith('USD')).forEach((v) => {
        total += +(v.unrealized_pl);
        treemap_data.push({ x: v.symbol, y: round2(v.unrealized_pl) });
        const color = v.unrealized_pl >= 0 ? '#00b90a' : 'red';
        html += `<tr>
                    <td style="width:25%;">${v.symbol.replace('USD', '/USD')}</td>
                    <td>${round2(v.avg_entry_price)}</td>
                    <td>${round2(v.cost_basis)}</td>
                    <td>${round2(v.market_value)}</td>
                    <td style="color:${color};">$${round2(v.unrealized_pl)}</td>
                    <td style="color:${color};">${round1(v.unrealized_plpc * 100)}%</td>
                </tr>`;
    });
    document.getElementById('table-positions-rows').innerHTML = html;
    // const invested = -Object.keys(obj).map((k) => obj[k].buy).reduce((p, c) => p + c);

    const elem = document.getElementById('total-positions');
    elem.style.backgroundColor = total === 0 ? 'grey' : (total > 0 ? '#30b937' : colors.red);
    elem.style.color = colors.black;
    elem.style.padding = '10px';
    elem.innerHTML = `$${round(total).toLocaleString()}<hr/>${round2(total / seed * 100)}%`;

    // options = deepClone(chart_treemap_options);
    options = deepClone(chart_bar_options);
    options.series[0].data = treemap_data;
    min = Math.min(MAX_LOSS, ...options.series[0].data.map((v) => v.y));
    max = Math.max(...options.series[0].data.map((v) => v.y));
    // options.plotOptions.treemap.colorScale.ranges[0].from = min;
    // options.plotOptions.treemap.colorScale.ranges[1].to = max;
    options.yaxis.labels.formatter = function (x) {
        return `$${x.toLocaleString()}`;
    }
    options.annotations.points = [];
    options.chart.height = treemap_data.length < 5 ? 200 : treemap_data.length * 47;
    if (chart_treemap_2) {
        chart_treemap_2.destroy();
    }
    chart_treemap_2 = new ApexCharts(document.querySelector("#chart-treemap-2"), options);
    chart_treemap_2.render();

    round_trips = undefined;


    // options.chart.height = 75;
    // console.log('total', ' | ', round2(Object.keys(obj).map((k) => obj[k].gain).reduce((p, c) => p + c)));
}