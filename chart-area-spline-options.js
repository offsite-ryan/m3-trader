var chart_area_spline_options = {
    series: [{
        name: 'series1',
        data: [31, 40, 28, 51, 42, 109, 100]
    }, {
        name: 'series2',
        data: [11, 32, 45, 32, 34, 52, 41]
    }],
    chart: {
        height: 250,
        type: 'line',
        sparkline: {
            enabled: true,
        },
        animations: {
            enabled: false,
        },
        zoom: {
            enabled: false,
        },
    },
    title: {
        text: undefined,
        style: {
            color: '#fff',
        }
    },
    // fill: {
    //     type: "gradient", 
    //     gradient: {
    //         shadeIntensity: 0.33,
    //     }
    // },
    dataLabels: {
        enabled: false,
        // style: {
        //     fontSize: '20px',
        // }
    },
    stroke: {
        width: [3.5, 2.0, 2.5, 2, 3, 2],
        curve: 'smooth',
        // curve: ['stepline', 'smooth', 'smooth']
    },
    xaxis: {
        // type: 'datetime',
        type: 'numeric',
        labels: {
            rotate: -90,
            datetimeUTC: false,
            style: {
                colors: '#fff',
            },
            // datetimeUTC: false,
        }
        // categories: ["2018-09-19T00:00:00.000Z", "2018-09-19T01:30:00.000Z", "2018-09-19T02:30:00.000Z", "2018-09-19T03:30:00.000Z", "2018-09-19T04:30:00.000Z", "2018-09-19T05:30:00.000Z", "2018-09-19T06:30:00.000Z"]
    },
    yaxis: {
        labels: {
            style: {
                colors: '#fff',
            }
        }
    },
    legend: {
        labels: {
            useSeriesColors: true,
        }
    },
    tooltip: {
        theme: 'dark',
        shared: true,
        x: {
            format: 'dd-MMM HH:mm'
        },
        style: {
            fontSize: '18px',
        }
    },
    annotations: {
        yaxis: [{
            x: 0,
            // x2: null,
            strokeDashArray: 0,
            borderColor: '#fff',
            fillColor: '#fff',
            opacity: 0.9,
            // label: {
            //     text: '',
            //     offsetX: 25,
            //     borderColor: '#fff',
            //     style: {
            //         fontSize: '18px',
            //         color: '#fff',
            //         background: '#fff'
            //     },
            //     position: 'left'
            // },
        },
        ],
    }
};
