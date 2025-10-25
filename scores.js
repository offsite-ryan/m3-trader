const scores = [
    {
        "symbol": "ANSC",
        "score": null,
        "pct": 6.2
    },
    {
        "symbol": "CUB",
        "score": null,
        "pct": 5.2
    },
    {
        "symbol": "IRTC",
        "score": null,
        "pct": 125.5
    },
    {
        "symbol": "ABCL",
        "score": 9,
        "pct": 118.1
    },
    {
        "symbol": "ALF",
        "score": 9,
        "pct": 5
    },
    {
        "symbol": "CYBR",
        "score": 9,
        "pct": 63.7
    },
    {
        "symbol": "ESLT",
        "score": 9,
        "pct": 86.9
    },
    {
        "symbol": "FJP",
        "score": 9,
        "pct": 33
    },
    {
        "symbol": "GIG",
        "score": 9,
        "pct": 9.2
    },
    {
        "symbol": "GILT",
        "score": 9,
        "pct": 125.9
    },
    {
        "symbol": "GOOG",
        "score": 9,
        "pct": 49.3
    },
    {
        "symbol": "GOOGL",
        "score": 9,
        "pct": 52.8
    },
    {
        "symbol": "IIIV",
        "score": 9,
        "pct": 42.2
    },
    {
        "symbol": "KOPN",
        "score": 9,
        "pct": 193.8
    },
    {
        "symbol": "LLYVA",
        "score": 9,
        "pct": 70.9
    },
    {
        "symbol": "LLYVK",
        "score": 9,
        "pct": 72.9
    },
    {
        "symbol": "NETD",
        "score": 9,
        "pct": 6.4
    },
    {
        "symbol": "PLTR",
        "score": 9,
        "pct": 141.1
    },
    {
        "symbol": "RGTI",
        "score": 9,
        "pct": 732
    },
    {
        "symbol": "RIGL",
        "score": 9,
        "pct": 143.7
    },
    {
        "symbol": "SCZ",
        "score": 9,
        "pct": 23.5
    },
    {
        "symbol": "XERS",
        "score": 9,
        "pct": 124
    },
    {
        "symbol": "RCKY",
        "score": 4.5,
        "pct": 23.5
    },
    {
        "symbol": "AGIO",
        "score": 4,
        "pct": 34.3
    },
    {
        "symbol": "ALDX",
        "score": 4,
        "pct": 107.2
    },
    {
        "symbol": "APP",
        "score": 4,
        "pct": 226.5
    },
    {
        "symbol": "ARGX",
        "score": 4,
        "pct": 36.5
    },
    {
        "symbol": "ASND",
        "score": 4,
        "pct": 44.4
    },
    {
        "symbol": "BBIO",
        "score": 4,
        "pct": 70.4
    },
    {
        "symbol": "BOTZ",
        "score": 4,
        "pct": 23.3
    },
    {
        "symbol": "BRRR",
        "score": 4,
        "pct": 46.9
    },
    {
        "symbol": "BSCT",
        "score": 4,
        "pct": 0.3
    },
    {
        "symbol": "CASY",
        "score": 4,
        "pct": 34.7
    },
    {
        "symbol": "CDZI",
        "score": 4,
        "pct": 105.2
    },
    {
        "symbol": "CGNX",
        "score": 4,
        "pct": 46.9
    },
    {
        "symbol": "CHEF",
        "score": 4,
        "pct": 39.4
    },
    {
        "symbol": "CRDO",
        "score": 4,
        "pct": 165.7
    },
    {
        "symbol": "DXPE",
        "score": 4,
        "pct": 107.7
    },
    {
        "symbol": "EWJV",
        "score": 4,
        "pct": 22.9
    },
    {
        "symbol": "EYE",
        "score": 4,
        "pct": 126.1
    },
    {
        "symbol": "FDT",
        "score": 4,
        "pct": 32.5
    },
    {
        "symbol": "FFIV",
        "score": 4,
        "pct": 30.2
    },
    {
        "symbol": "FRHC",
        "score": 4,
        "pct": 55.8
    },
    {
        "symbol": "FUTU",
        "score": 4,
        "pct": 64.8
    },
    {
        "symbol": "FYBR",
        "score": 4,
        "pct": 5.1
    },
    {
        "symbol": "GTX",
        "score": 4,
        "pct": 74.9
    },
    {
        "symbol": "HERO",
        "score": 4,
        "pct": 38.6
    },
    {
        "symbol": "IBIT",
        "score": 4,
        "pct": 46.7
    },
    {
        "symbol": "IDCC",
        "score": 4,
        "pct": 111.1
    },
    {
        "symbol": "IDXX",
        "score": 4,
        "pct": 46.5
    },
    {
        "symbol": "IESC",
        "score": 4,
        "pct": 85.3
    },
    {
        "symbol": "IGF",
        "score": 4,
        "pct": 9.3
    },
    {
        "symbol": "INDV",
        "score": 4,
        "pct": 128.1
    },
    {
        "symbol": "LENZ",
        "score": 4,
        "pct": 73.5
    },
    {
        "symbol": "LGND",
        "score": 4,
        "pct": 55.4
    },
    {
        "symbol": "LINC",
        "score": 4,
        "pct": 69.4
    },
    {
        "symbol": "LVTX",
        "score": 4,
        "pct": 41.7
    },
    {
        "symbol": "MDB",
        "score": 4,
        "pct": 34.9
    },
    {
        "symbol": "MRVL",
        "score": 4,
        "pct": 46.5
    },
    {
        "symbol": "NBIS",
        "score": 4,
        "pct": 154.3
    },
    {
        "symbol": "NBIX",
        "score": 4,
        "pct": 22.8
    },
    {
        "symbol": "NXT",
        "score": 4,
        "pct": 124.4
    },
    {
        "symbol": "PERI",
        "score": 4,
        "pct": 31
    },
    {
        "symbol": "POWL",
        "score": 4,
        "pct": 49.2
    },
    {
        "symbol": "PRCH",
        "score": 4,
        "pct": 306.9
    },
    {
        "symbol": "RMNI",
        "score": 4,
        "pct": 97.6
    },
    {
        "symbol": "SANM",
        "score": 4,
        "pct": 83.2
    },
    {
        "symbol": "SENEA",
        "score": 4,
        "pct": 66.9
    },
    {
        "symbol": "SIXG",
        "score": 4,
        "pct": 48.8
    },
    {
        "symbol": "SOFI",
        "score": 4,
        "pct": 108.3
    },
    {
        "symbol": "TATT",
        "score": 4,
        "pct": 88.6
    },
    {
        "symbol": "TTMI",
        "score": 4,
        "pct": 111.3
    },
    {
        "symbol": "UAE",
        "score": 4,
        "pct": 30.6
    },
    {
        "symbol": "UAL",
        "score": 4,
        "pct": 50
    },
    {
        "symbol": "VACH",
        "score": 4,
        "pct": 4.5
    },
    {
        "symbol": "VSEC",
        "score": 4,
        "pct": 50.8
    },
    {
        "symbol": "BACQ",
        "score": 3,
        "pct": 22.5
    },
    {
        "symbol": "BEAG",
        "score": 3,
        "pct": 10
    },
    {
        "symbol": "GLXY",
        "score": 3,
        "pct": 75.3
    },
    {
        "symbol": "PTCT",
        "score": 2.67,
        "pct": 72.2
    },
    {
        "symbol": "WGS",
        "score": 2.67,
        "pct": 109.3
    },
    {
        "symbol": "AAON",
        "score": 2.33,
        "pct": 8.4
    },
    {
        "symbol": "ACNB",
        "score": 2.33,
        "pct": 5.5
    },
    {
        "symbol": "ACWI",
        "score": 2.33,
        "pct": 16.3
    },
    {
        "symbol": "ADEA",
        "score": 2.33,
        "pct": 33.3
    },
    {
        "symbol": "ADPT",
        "score": 2.33,
        "pct": 141.4
    },
    {
        "symbol": "AEHR",
        "score": 2.33,
        "pct": 155.3
    },
    {
        "symbol": "AEIS",
        "score": 2.33,
        "pct": 67.4
    },
    {
        "symbol": "AGNC",
        "score": 2.33,
        "pct": 6.8
    },
    {
        "symbol": "AGNCO",
        "score": 2.33,
        "pct": 3.3
    },
    {
        "symbol": "AIA",
        "score": 2.33,
        "pct": 29.3
    },
    {
        "symbol": "AIP",
        "score": 2.33,
        "pct": 89
    },
    {
        "symbol": "AIRR",
        "score": 2.33,
        "pct": 17.1
    },
    {
        "symbol": "AKBA",
        "score": 2.33,
        "pct": 92.7
    },
    {
        "symbol": "ALAB",
        "score": 2.33,
        "pct": 120.2
    },
    {
        "symbol": "ALGM",
        "score": 2.33,
        "pct": 45.7
    },
    {
        "symbol": "ALGS",
        "score": 2.33,
        "pct": 218.8
    },
    {
        "symbol": "ALLT",
        "score": 2.33,
        "pct": 157.3
    },
    {
        "symbol": "ALNT",
        "score": 2.33,
        "pct": 114.9
    },
    {
        "symbol": "AMLX",
        "score": 2.33,
        "pct": 152
    },
    {
        "symbol": "AMRX",
        "score": 2.33,
        "pct": 41.1
    },
    {
        "symbol": "AMSC",
        "score": 2.33,
        "pct": 152.2
    },
    {
        "symbol": "AMZN",
        "score": 2.33,
        "pct": 21.7
    },
    {
        "symbol": "APEI",
        "score": 2.33,
        "pct": 101.3
    },
    {
        "symbol": "ATAI",
        "score": 2.33,
        "pct": 232.6
    },
    {
        "symbol": "ATAT",
        "score": 2.33,
        "pct": 41
    },
    {
        "symbol": "ATEC",
        "score": 2.33,
        "pct": 134.3
    },
    {
        "symbol": "ATRA",
        "score": 2.33,
        "pct": 93.8
    },
    {
        "symbol": "ATRO",
        "score": 2.33,
        "pct": 112.2
    },
    {
        "symbol": "AUPH",
        "score": 2.33,
        "pct": 55.5
    },
    {
        "symbol": "AVNW",
        "score": 2.33,
        "pct": 54.9
    },
    {
        "symbol": "AZN",
        "score": 2.33,
        "pct": 23.2
    },
    {
        "symbol": "AZTA",
        "score": 2.33,
        "pct": 14.6
    },
    {
        "symbol": "BAND",
        "score": 2.33,
        "pct": 0.3
    },
    {
        "symbol": "BDTX",
        "score": 2.33,
        "pct": 42.5
    },
    {
        "symbol": "BILI",
        "score": 2.33,
        "pct": 38.4
    },
    {
        "symbol": "BRNY",
        "score": 2.33,
        "pct": 15.4
    },
    {
        "symbol": "BSCU",
        "score": 2.33,
        "pct": 0.9
    },
    {
        "symbol": "BSCV",
        "score": 2.33,
        "pct": 1.9
    },
    {
        "symbol": "BTDR",
        "score": 2.33,
        "pct": 130.6
    },
    {
        "symbol": "BZ",
        "score": 2.33,
        "pct": 68.4
    },
    {
        "symbol": "CAMT",
        "score": 2.33,
        "pct": 57.5
    },
    {
        "symbol": "CATH",
        "score": 2.33,
        "pct": 12.2
    },
    {
        "symbol": "CCB",
        "score": 2.33,
        "pct": 65
    },
    {
        "symbol": "CEG",
        "score": 2.33,
        "pct": 69.7
    },
    {
        "symbol": "CHRS",
        "score": 2.33,
        "pct": 98.8
    },
    {
        "symbol": "CIBR",
        "score": 2.33,
        "pct": 17.4
    },
    {
        "symbol": "CIFR",
        "score": 2.33,
        "pct": 246.6
    },
    {
        "symbol": "CLSM",
        "score": 2.33,
        "pct": 6.3
    },
    {
        "symbol": "CMMB",
        "score": 2.33,
        "pct": 232.9
    },
    {
        "symbol": "COGT",
        "score": 2.33,
        "pct": 69.7
    },
    {
        "symbol": "CRSP",
        "score": 2.33,
        "pct": 38.2
    },
    {
        "symbol": "CRWD",
        "score": 2.33,
        "pct": 49.6
    },
    {
        "symbol": "DAKT",
        "score": 2.33,
        "pct": 50.5
    },
    {
        "symbol": "DASH",
        "score": 2.33,
        "pct": 50.5
    },
    {
        "symbol": "DMAC",
        "score": 2.33,
        "pct": 25.2
    },
    {
        "symbol": "DORM",
        "score": 2.33,
        "pct": 34.2
    },
    {
        "symbol": "DRVN",
        "score": 2.33,
        "pct": 20.5
    },
    {
        "symbol": "DVAX",
        "score": 2.33,
        "pct": 16.8
    },
    {
        "symbol": "EBAY",
        "score": 2.33,
        "pct": 41.2
    },
    {
        "symbol": "ECOW",
        "score": 2.33,
        "pct": 17.3
    },
    {
        "symbol": "EMB",
        "score": 2.33,
        "pct": 2.9
    },
    {
        "symbol": "ENVX",
        "score": 2.33,
        "pct": 58.9
    },
    {
        "symbol": "EQRR",
        "score": 2.33,
        "pct": 7
    },
    {
        "symbol": "ESGU",
        "score": 2.33,
        "pct": 12.6
    },
    {
        "symbol": "ESQ",
        "score": 2.33,
        "pct": 47.8
    },
    {
        "symbol": "ETNB",
        "score": 2.33,
        "pct": 105.4
    },
    {
        "symbol": "EVRG",
        "score": 2.33,
        "pct": 25.7
    },
    {
        "symbol": "EXPE",
        "score": 2.33,
        "pct": 36.5
    },
    {
        "symbol": "FAD",
        "score": 2.33,
        "pct": 18
    },
    {
        "symbol": "FCVT",
        "score": 2.33,
        "pct": 14.8
    },
    {
        "symbol": "FDTS",
        "score": 2.33,
        "pct": 28.5
    },
    {
        "symbol": "FDUS",
        "score": 2.33,
        "pct": 12.2
    },
    {
        "symbol": "FER",
        "score": 2.33,
        "pct": 44.5
    },
    {
        "symbol": "FIXD",
        "score": 2.33,
        "pct": 0.4
    },
    {
        "symbol": "FLEX",
        "score": 2.33,
        "pct": 74.5
    },
    {
        "symbol": "FNY",
        "score": 2.33,
        "pct": 5.8
    },
    {
        "symbol": "FROG",
        "score": 2.33,
        "pct": 63.3
    },
    {
        "symbol": "FSUN",
        "score": 2.33,
        "pct": 3.6
    },
    {
        "symbol": "FTC",
        "score": 2.33,
        "pct": 11.5
    },
    {
        "symbol": "FTGS",
        "score": 2.33,
        "pct": 9
    },
    {
        "symbol": "FV",
        "score": 2.33,
        "pct": 9.7
    },
    {
        "symbol": "FVC",
        "score": 2.33,
        "pct": 4.6
    },
    {
        "symbol": "FWONA",
        "score": 2.33,
        "pct": 10.3
    },
    {
        "symbol": "FWONK",
        "score": 2.33,
        "pct": 12.8
    },
    {
        "symbol": "GH",
        "score": 2.33,
        "pct": 153.9
    },
    {
        "symbol": "GHRS",
        "score": 2.33,
        "pct": 158.4
    },
    {
        "symbol": "GILD",
        "score": 2.33,
        "pct": 36
    },
    {
        "symbol": "GLPG",
        "score": 2.33,
        "pct": 3
    },
    {
        "symbol": "GNOM",
        "score": 2.33,
        "pct": 323.3
    },
    {
        "symbol": "GRAL",
        "score": 2.33,
        "pct": 216.5
    },
    {
        "symbol": "GSAT",
        "score": 2.33,
        "pct": 1333.2
    },
    {
        "symbol": "HAFC",
        "score": 2.33,
        "pct": 25
    },
    {
        "symbol": "HBNC",
        "score": 2.33,
        "pct": 18.4
    },
    {
        "symbol": "HDSN",
        "score": 2.33,
        "pct": 40.4
    },
    {
        "symbol": "HISF",
        "score": 2.33,
        "pct": 1
    },
    {
        "symbol": "HIVE",
        "score": 2.33,
        "pct": 97.4
    },
    {
        "symbol": "HLAL",
        "score": 2.33,
        "pct": 16
    },
    {
        "symbol": "HNRG",
        "score": 2.33,
        "pct": 72.8
    },
    {
        "symbol": "HOOD",
        "score": 2.33,
        "pct": 145.9
    },
    {
        "symbol": "HRMY",
        "score": 2.33,
        "pct": 5
    },
    {
        "symbol": "HTBK",
        "score": 2.33,
        "pct": 18.3
    },
    {
        "symbol": "HURN",
        "score": 2.33,
        "pct": 33.9
    },
    {
        "symbol": "HUT",
        "score": 2.33,
        "pct": 168.6
    },
    {
        "symbol": "HYZD",
        "score": 2.33,
        "pct": 2.2
    },
    {
        "symbol": "IBKR",
        "score": 2.33,
        "pct": 9.2
    },
    {
        "symbol": "IBTK",
        "score": 2.33,
        "pct": 1.2
    },
    {
        "symbol": "IBTL",
        "score": 2.33,
        "pct": 1.4
    },
    {
        "symbol": "IEF",
        "score": 2.33,
        "pct": 1.5
    },
    {
        "symbol": "IEI",
        "score": 2.33,
        "pct": 1.8
    },
    {
        "symbol": "IFGL",
        "score": 2.33,
        "pct": 13.6
    },
    {
        "symbol": "IGIB",
        "score": 2.33,
        "pct": 2
    },
    {
        "symbol": "IGSB",
        "score": 2.33,
        "pct": 0.8
    },
    {
        "symbol": "IMKTA",
        "score": 2.33,
        "pct": 20.2
    },
    {
        "symbol": "INCY",
        "score": 2.33,
        "pct": 40
    },
    {
        "symbol": "INSM",
        "score": 2.33,
        "pct": 88.4
    },
    {
        "symbol": "IRMD",
        "score": 2.33,
        "pct": 39.4
    },
    {
        "symbol": "ITRN",
        "score": 2.33,
        "pct": 35.2
    },
    {
        "symbol": "IUSB",
        "score": 2.33,
        "pct": 2.5
    },
    {
        "symbol": "IVA",
        "score": 2.33,
        "pct": 82.1
    },
    {
        "symbol": "JAZZ",
        "score": 2.33,
        "pct": 47.5
    },
    {
        "symbol": "JBIO",
        "score": 2.33,
        "pct": 339
    },
    {
        "symbol": "JGLO",
        "score": 2.33,
        "pct": 7.4
    },
    {
        "symbol": "KOD",
        "score": 2.33,
        "pct": 308.1
    },
    {
        "symbol": "KRMA",
        "score": 2.33,
        "pct": 17.3
    },
    {
        "symbol": "KTOS",
        "score": 2.33,
        "pct": 126
    },
    {
        "symbol": "LASR",
        "score": 2.33,
        "pct": 143.7
    },
    {
        "symbol": "LAUR",
        "score": 2.33,
        "pct": 76.5
    },
    {
        "symbol": "LDEM",
        "score": 2.33,
        "pct": 17.1
    },
    {
        "symbol": "LEGR",
        "score": 2.33,
        "pct": 14.3
    },
    {
        "symbol": "LIF",
        "score": 2.33,
        "pct": 101.7
    },
    {
        "symbol": "LITE",
        "score": 2.33,
        "pct": 126.4
    },
    {
        "symbol": "LMBS",
        "score": 2.33,
        "pct": 1.5
    },
    {
        "symbol": "LOPE",
        "score": 2.33,
        "pct": 59.3
    },
    {
        "symbol": "LRCX",
        "score": 2.33,
        "pct": 94.4
    },
    {
        "symbol": "LZ",
        "score": 2.33,
        "pct": 60
    },
    {
        "symbol": "MCFT",
        "score": 2.33,
        "pct": 25.5
    },
    {
        "symbol": "MEDP",
        "score": 2.33,
        "pct": 63.3
    },
    {
        "symbol": "MNMD",
        "score": 2.33,
        "pct": 64.6
    },
    {
        "symbol": "MODL",
        "score": 2.33,
        "pct": 16.2
    },
    {
        "symbol": "MPAA",
        "score": 2.33,
        "pct": 108.3
    },
    {
        "symbol": "MPWR",
        "score": 2.33,
        "pct": 59
    },
    {
        "symbol": "MYRG",
        "score": 2.33,
        "pct": 62.2
    },
    {
        "symbol": "NBN",
        "score": 2.33,
        "pct": 5.8
    },
    {
        "symbol": "NERV",
        "score": 2.33,
        "pct": 86.6
    },
    {
        "symbol": "NESR",
        "score": 2.33,
        "pct": 305.5
    },
    {
        "symbol": "NNE",
        "score": 2.33,
        "pct": 93.1
    },
    {
        "symbol": "NTGR",
        "score": 2.33,
        "pct": 43
    },
    {
        "symbol": "NTRA",
        "score": 2.33,
        "pct": 53.8
    },
    {
        "symbol": "NVMI",
        "score": 2.33,
        "pct": 78.2
    },
    {
        "symbol": "NWE",
        "score": 2.33,
        "pct": 14.3
    },
    {
        "symbol": "OM",
        "score": 2.33,
        "pct": 131.2
    },
    {
        "symbol": "OPRT",
        "score": 2.33,
        "pct": 107.8
    },
    {
        "symbol": "ORKA",
        "score": 2.33,
        "pct": 64.9
    },
    {
        "symbol": "OSPN",
        "score": 2.33,
        "pct": 1.5
    },
    {
        "symbol": "PAX",
        "score": 2.33,
        "pct": 37
    },
    {
        "symbol": "PDLB",
        "score": 2.33,
        "pct": 40.5
    },
    {
        "symbol": "PDP",
        "score": 2.33,
        "pct": 4
    },
    {
        "symbol": "PENG",
        "score": 2.33,
        "pct": 43
    },
    {
        "symbol": "PHO",
        "score": 2.33,
        "pct": 3.7
    },
    {
        "symbol": "PID",
        "score": 2.33,
        "pct": 8.3
    },
    {
        "symbol": "PINC",
        "score": 2.33,
        "pct": 40.1
    },
    {
        "symbol": "PIZ",
        "score": 2.33,
        "pct": 23.6
    },
    {
        "symbol": "POET",
        "score": 2.33,
        "pct": 66
    },
    {
        "symbol": "PRFZ",
        "score": 2.33,
        "pct": 17.7
    },
    {
        "symbol": "PRVA",
        "score": 2.33,
        "pct": 44.7
    },
    {
        "symbol": "PSCI",
        "score": 2.33,
        "pct": 14.8
    },
    {
        "symbol": "PSMT",
        "score": 2.33,
        "pct": 31.4
    },
    {
        "symbol": "PWRD",
        "score": 2.33,
        "pct": 29.5
    },
    {
        "symbol": "PYZ",
        "score": 2.33,
        "pct": 8.8
    },
    {
        "symbol": "QNST",
        "score": 2.33,
        "pct": 9.9
    },
    {
        "symbol": "QQQH",
        "score": 2.33,
        "pct": 102.3
    },
    {
        "symbol": "QQQJ",
        "score": 2.33,
        "pct": 20.7
    },
    {
        "symbol": "QTUM",
        "score": 2.33,
        "pct": 60.7
    },
    {
        "symbol": "RDVT",
        "score": 2.33,
        "pct": 64.2
    },
    {
        "symbol": "RELY",
        "score": 2.33,
        "pct": 43.6
    },
    {
        "symbol": "RKLB",
        "score": 2.33,
        "pct": 226.4
    },
    {
        "symbol": "RMBS",
        "score": 2.33,
        "pct": 113.2
    },
    {
        "symbol": "ROBT",
        "score": 2.33,
        "pct": 30.5
    },
    {
        "symbol": "RUSHB",
        "score": 2.33,
        "pct": 21.1
    },
    {
        "symbol": "RYAAY",
        "score": 2.33,
        "pct": 46.7
    },
    {
        "symbol": "RYTM",
        "score": 2.33,
        "pct": 80.5
    },
    {
        "symbol": "RZLT",
        "score": 2.33,
        "pct": 100.6
    },
    {
        "symbol": "SFIX",
        "score": 2.33,
        "pct": 61
    },
    {
        "symbol": "SFM",
        "score": 2.33,
        "pct": 48.4
    },
    {
        "symbol": "SHOP",
        "score": 2.33,
        "pct": 95.8
    },
    {
        "symbol": "SKOR",
        "score": 2.33,
        "pct": 0.4
    },
    {
        "symbol": "SKYY",
        "score": 2.33,
        "pct": 36.5
    },
    {
        "symbol": "SLRC",
        "score": 2.33,
        "pct": 12.6
    },
    {
        "symbol": "SNEX",
        "score": 2.33,
        "pct": 48.2
    },
    {
        "symbol": "SPCX",
        "score": 2.33,
        "pct": 7.2
    },
    {
        "symbol": "SRAD",
        "score": 2.33,
        "pct": 78.4
    },
    {
        "symbol": "SSRM",
        "score": 2.33,
        "pct": 153.5
    },
    {
        "symbol": "STNE",
        "score": 2.33,
        "pct": 59.8
    },
    {
        "symbol": "SUSB",
        "score": 2.33,
        "pct": 0.7
    },
    {
        "symbol": "SUSC",
        "score": 2.33,
        "pct": 0.2
    },
    {
        "symbol": "SYNA",
        "score": 2.33,
        "pct": 17.3
    },
    {
        "symbol": "TASK",
        "score": 2.33,
        "pct": 27.7
    },
    {
        "symbol": "TBBK",
        "score": 2.33,
        "pct": 33.7
    },
    {
        "symbol": "TBLA",
        "score": 2.33,
        "pct": 25.3
    },
    {
        "symbol": "TDSB",
        "score": 2.33,
        "pct": 7.3
    },
    {
        "symbol": "TER",
        "score": 2.33,
        "pct": 49.3
    },
    {
        "symbol": "TH",
        "score": 2.33,
        "pct": 1.8
    },
    {
        "symbol": "THFF",
        "score": 2.33,
        "pct": 35.3
    },
    {
        "symbol": "THRM",
        "score": 2.33,
        "pct": 0.1
    },
    {
        "symbol": "TLN",
        "score": 2.33,
        "pct": 102.8
    },
    {
        "symbol": "TRIN",
        "score": 2.33,
        "pct": 15.2
    },
    {
        "symbol": "TRIP",
        "score": 2.33,
        "pct": 37.4
    },
    {
        "symbol": "TRVI",
        "score": 2.33,
        "pct": 146.4
    },
    {
        "symbol": "TSEM",
        "score": 2.33,
        "pct": 69.5
    },
    {
        "symbol": "TTWO",
        "score": 2.33,
        "pct": 56
    },
    {
        "symbol": "TVTX",
        "score": 2.33,
        "pct": 83.1
    },
    {
        "symbol": "UBND",
        "score": 2.33,
        "pct": 2.3
    },
    {
        "symbol": "UCRD",
        "score": 2.33,
        "pct": 1.1
    },
    {
        "symbol": "UFO",
        "score": 2.33,
        "pct": 74.7
    },
    {
        "symbol": "UITB",
        "score": 2.33,
        "pct": 2.2
    },
    {
        "symbol": "ULTA",
        "score": 2.33,
        "pct": 36.7
    },
    {
        "symbol": "USIG",
        "score": 2.33,
        "pct": 0.2
    },
    {
        "symbol": "USLM",
        "score": 2.33,
        "pct": 33.2
    },
    {
        "symbol": "VCIT",
        "score": 2.33,
        "pct": 0.5
    },
    {
        "symbol": "VCSH",
        "score": 2.33,
        "pct": 0.6
    },
    {
        "symbol": "VGIT",
        "score": 2.33,
        "pct": 1.6
    },
    {
        "symbol": "VIAV",
        "score": 2.33,
        "pct": 57.4
    },
    {
        "symbol": "VNET",
        "score": 2.33,
        "pct": 142.1
    },
    {
        "symbol": "VONE",
        "score": 2.33,
        "pct": 13.2
    },
    {
        "symbol": "VONG",
        "score": 2.33,
        "pct": 25.7
    },
    {
        "symbol": "VOTE",
        "score": 2.33,
        "pct": 12.8
    },
    {
        "symbol": "VRSN",
        "score": 2.33,
        "pct": 30.1
    },
    {
        "symbol": "VSAT",
        "score": 2.33,
        "pct": 162.6
    },
    {
        "symbol": "VSTA",
        "score": 2.33,
        "pct": 108.1
    },
    {
        "symbol": "VTHR",
        "score": 2.33,
        "pct": 12.5
    },
    {
        "symbol": "VTWG",
        "score": 2.33,
        "pct": 18.8
    },
    {
        "symbol": "VTWO",
        "score": 2.33,
        "pct": 10.8
    },
    {
        "symbol": "VUZI",
        "score": 2.33,
        "pct": 211.9
    },
    {
        "symbol": "VWOB",
        "score": 2.33,
        "pct": 1.9
    },
    {
        "symbol": "WAY",
        "score": 2.33,
        "pct": 25.8
    },
    {
        "symbol": "WBD",
        "score": 2.33,
        "pct": 102.8
    },
    {
        "symbol": "WTBA",
        "score": 2.33,
        "pct": 0.1
    },
    {
        "symbol": "WTW",
        "score": 2.33,
        "pct": 9.9
    },
    {
        "symbol": "WULF",
        "score": 2.33,
        "pct": 121.1
    },
    {
        "symbol": "XT",
        "score": 2.33,
        "pct": 23.9
    },
    {
        "symbol": "EOSE",
        "score": 2,
        "pct": 253.7
    },
    {
        "symbol": "AEVA",
        "score": 1.75,
        "pct": 310.6
    },
    {
        "symbol": "APPS",
        "score": 1.75,
        "pct": 152.4
    },
    {
        "symbol": "ASPI",
        "score": 1.75,
        "pct": 127
    },
    {
        "symbol": "AXGN",
        "score": 1.75,
        "pct": 37.3
    },
    {
        "symbol": "BCAX",
        "score": 1.75,
        "pct": 1.7
    },
    {
        "symbol": "CHTR",
        "score": 1.75,
        "pct": 0.5
    },
    {
        "symbol": "COMM",
        "score": 1.75,
        "pct": 164.6
    },
    {
        "symbol": "CTMX",
        "score": 1.75,
        "pct": 221.4
    },
    {
        "symbol": "EVLV",
        "score": 1.75,
        "pct": 87.2
    },
    {
        "symbol": "LXRX",
        "score": 1.75,
        "pct": 58.6
    },
    {
        "symbol": "NVTS",
        "score": 1.75,
        "pct": 312.2
    },
    {
        "symbol": "OPRX",
        "score": 1.75,
        "pct": 128.2
    },
    {
        "symbol": "PSNL",
        "score": 1.75,
        "pct": 135
    },
    {
        "symbol": "SANA",
        "score": 1.75,
        "pct": 128
    },
    {
        "symbol": "SEDG",
        "score": 1.75,
        "pct": 93.2
    },
    {
        "symbol": "SPNS",
        "score": 1.75,
        "pct": 13.1
    },
    {
        "symbol": "SSP",
        "score": 1.75,
        "pct": 8.9
    },
    {
        "symbol": "SYM",
        "score": 1.75,
        "pct": 102.8
    },
    {
        "symbol": "KYIV",
        "score": 1.67,
        "pct": 17
    },
    {
        "symbol": "PSIX",
        "score": 1.67,
        "pct": 123.3
    }
];