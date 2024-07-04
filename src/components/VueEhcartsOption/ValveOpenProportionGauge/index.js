import * as echarts from 'echarts'
export default class ValveOpenProportionGauge {
    /**
     * 构造函数
     * @param id 场景窗体div
     */
    constructor(echarts) {
        this.scale = 1
        this.echarts = echarts
        this.option = {}
        this._HeatSupplyInit()
    }
    _HeatSupplyInit() {
        // this.HeatSupplyOptionFunc()
    }

    ValveOpenProportionGaugeOptionFunc(callback) {
        let colorPalette = ['#FF6622', '#229AFF', '#22FFCC', '#F6C33B'] // 调色盘
        var dataArr = 60;
        this.option = {
            colors: colorPalette,
            title: {
                show: true,
                text: '任务进度',
                // subtext: dataArr + '%',
                subtextStyle: {
                    color: '#FFFFFF',
                    fontSize: 16,
                    fontWeight: "bold",
                    lineHeight: 10,
                },
                x: 'center',
                y: '85%',
                z: 9,
                // textAlign: 'center',
                textStyle: {
                    color: '#f1f7fe',
                    fontSize: 12,
                    fontWeight: 'normal'
                },

            },
            series: [
                {
                    name: "内部（环形）进度条",
                    type: "gauge",
                    // center: ['20%', '50%'],
                    radius: '85%',
                    splitNumber: 10,
                    axisLine: {
                        lineStyle: {
                            color: [
                                [dataArr / 100, '#458EFD'],
                                [1, "#FFFFFF"]
                            ],
                            width: 10
                        }
                    },
                    axisLabel: {
                        show: false,
                    },
                    axisTick: {
                        show: false,

                    },
                    splitLine: {
                        show: false,
                    },
                    pointer: {
                        show: false,
                    },
                },
                // {
                //     name: '外部刻度',
                //     type: 'gauge',
                //     //  center: ['20%', '50%'],
                //     radius: '95%',
                //     min: 0, //最小刻度
                //     max: 100, //最大刻度
                //     splitNumber: 10, //刻度数量
                //     startAngle: 225,
                //     endAngle: -45,
                //     axisLine: {
                //         show: true,
                //         // 仪表盘刻度线
                //         lineStyle: {
                //             width: 2,
                //             color: [
                //                 [1, '#FFFFFF']
                //             ]
                //         }
                //     },
                //     //仪表盘文字
                //     axisLabel: {
                //         show: true,
                //         color: '#fff',
                //         distance: 20,
                //         fontSize: 10,
                //         formatter: function (v) {
                //             switch (v + '') {
                //                 case '0':
                //                     return '0';
                //                 case '10':
                //                     return '10';
                //                 case '20':
                //                     return '20';
                //                 case '30':
                //                     return '30';
                //                 case '40':
                //                     return '40';
                //                 case '50':
                //                     return '50';
                //                 case '60':
                //                     return '60';
                //                 case '70':
                //                     return '70';
                //                 case '80':
                //                     return '80';
                //                 case '90':
                //                     return '90';
                //                 case '100':
                //                     return '100';
                //             }
                //         }
                //     }, //刻度标签。
                //     axisTick: {
                //         show: true,
                //         splitNumber: 4,
                //         lineStyle: {
                //             color: '#3082FE', //用颜色渐变函数不起作用
                //             width: 1,
                //         },
                //         length: -5
                //     }, //刻度样式
                //     splitLine: {
                //         show: true,
                //         length: -15,
                //         lineStyle: {
                //             color: '#458EFD', //用颜色渐变函数不起作用
                //             width: 2,
                //         }
                //     }, //分隔线样式
                //     detail: {
                //         show: false
                //     },
                //     pointer: {
                //         show: false
                //     }
                // },
                /*内部*/
                {
                    type: 'pie',
                    radius: ['0', '50%'],
                    center: ['50%', '50%'],
                    z: 8,
                    hoverAnimation: false,
                    data: [{
                        name: '检查进度',
                        value: dataArr,
                        itemStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                    offset: 0,
                                    color: '#3398ff'
                                }, {
                                    offset: 1,
                                    color: '#7db0fd'
                                }])
                            }

                        },
                        label: {
                            normal: {
                                formatter: function (params) {
                                    return params.value + '%';
                                },
                                color: '#FFFFFF',
                                fontSize: 16,
                                fontWeight: "bold",
                                position: 'center',
                                show: true
                            }
                        },
                        labelLine: {
                            show: false
                        }
                    }],
                },
                /*外一层*/
                {
                    type: "pie",
                    radius: "55%",
                    startAngle: 220,
                    endAngle: -40,
                    hoverAnimation: false,
                    center: ["50%", "50%"],
                    avoidLabelOverlap: false,
                    label: {
                        show: false
                    },
                    labelLine: {
                        show: false
                    },
                    data: [{
                        value: 1,
                        itemStyle: {
                            normal: {
                                color: '#8DC4FD'
                            }
                        }
                    }],
                },
                //外二层圈
                {
                    type: "pie",
                    radius: "60%",
                    center: ["50%", "50%"],
                    avoidLabelOverlap: false,
                    z: 0,
                    hoverAnimation: false,
                    label: {
                        show: false
                    },
                    labelLine: {
                        show: false
                    },
                    data: [{
                        "value": 1,
                        itemStyle: {
                            normal: {
                                color: '#e3edf8'
                            }
                        }
                    }]
                }
            ]
        };
        callback && callback(this.option)
    }

}