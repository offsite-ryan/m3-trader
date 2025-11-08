const chart_bar_options = {
    series: [{
        name: 'Gain',
        data: []
    }],
    chart: {
        type: 'bar',
        height: 450,
        toolbar: {
            show: false,
        },
        background: '#000',
        zoom: {
            enabled: false,
        },
    },
    title: {
        text: '',
    },
    plotOptions: {
        bar: {
            colors: {
                ranges: [
                    {
                        from: -100 * 1000,
                        to: -10,
                        color: '#ff1e00cb'
                    },
                    {
                        from: -10,
                        to: 0,
                        color: '#FEB01990'
                    }
                ]
            },
            // columnWidth: '80%',
            dataLabels: {
                position: 'top', // top, center, bottom
                color: '#fff',
            },
        },
        treemap: {
            enableShades: true,
            shadeIntensity: 0.75,
            colorScale: {
                ranges: [
                    {
                        from: -1000,
                        to: 0,
                        color: colors.red
                    },
                    {
                        from: 0.001,
                        to: 500,
                        color: '#00b90a'
                    }
                ]
            }
        }
    },
    colors: ['#00b90a'],
    stroke: {
        width: 2,
        curve: 'smooth',
        // curve: 'straight',
    },
    theme: {
        mode: 'dark',
    },
    dataLabels: {
        enabled: false,
    },
    legend: {
        show: false,
    },
    _forecastDataPoints: {
        count: 1,
        fillOpacity: 0.5,
        strokeWidth: undefined,
        dashArray: 4,
    },
    dataLabels: {
        enabled: true,
        offsetY: -20,
        enabledOnSeries: [0, 1],
        formatter: function (val) {
            // return val + "%";
            return `$${round(val).toLocaleString()}`;
        }
    },
    tooltip: {
        style: { fontSize: '16px' },
    },
    yaxis: {

        // title: {
        //     text: 'Growth',
        // },
        // min: -1,
        labels: {
            formatter: function (y) {
                return round1(y).toLocaleString() + '%';
            },
            style: {
                colors: '#fff',
            }
        }
    },
    xaxis: {
        type: 'category',
        categories: [
        ],
        labels: {
            rotate: -90,
            style: {
                colors: '#fff',
            }
        }
    },
    annotations: {
        xaxis: [{
            x: null,
            x2: null,
            strokeDashArray: 0,
            borderColor: '#F15B46',
            fillColor: '#F15B46',
            opacity: 0.9,
            label: {
                text: '',
                offsetX: 25,
                borderColor: '#f5f242',
                style: {
                    fontSize: '18px',
                    color: '#fff',
                    background: '#00b90a'
                },
                position: 'left'
            },
        },
        ],
        yaxis: [{
            y: 0,
            _y2: 0 + 0.005,
            strokeDashArray: 0,
            borderColor: '#f5f242',
            fillColor: '#f5f242',
            opacity: 0.9,
            label: {
                text: '',
                offsetX: 25,
                borderColor: '#f5f242',
                style: {
                    fontSize: '18px',
                    color: '#fff',
                    background: '#00b90a'
                },
                position: 'left'
            },
        }, {
            y: 0,
            y2: null,
            strokeDashArray: 0,
            borderColor: '#f6ff00',
            fillColor: '#f6ff00',
        }, {
            y: -1.75,
            y2: null,
            strokeDashArray: 0,
            borderColor: '#ff002b',
            fillColor: '#ff002b',
        }
        ],
        points: [
            // {
            //     x: 0,
            //     y: 40,
            //     // borderColor: '#f5f242',
            //     // seriesIndex: 1,
            //     // fillColor: '#f5f242',
            //     // opacity: 0.5,
            //     label: {
            //         text: '123',
            //         style: {
            //             fontSize: '18px',
            //             color: '#fff',
            //             background: '#00b90a'
            //         }
            //     }
            // }
        ]
    }
};