export default class ProportionOfHeatSupplyOption {
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
    _HeatSupplyInit(){
        // this.HeatSupplyOptionFunc()
    }

    HeatSupplyOptionFunc(callback) {
        var rich = {
            yellow: {
                color: "#ffc72b",
                fontSize: 12 * this.scale,
                padding: [5, 4],
                align: 'center'
            },
            total: {
                color: "#ffc72b",
                fontSize: 12 * this.scale,
                align: 'center'
            },
            white: {
                color: "#fff",
                align: 'center',
                fontSize: 14 * this.scale,
                padding: [5, 0]
            },
            blue: {
                color: '#49dff0',
                fontSize: 12 * this.scale,
                align: 'center'
            },
            hr: {
                borderColor: '#0b5263',
                width: '100%',
                borderWidth: 1,
                height: 0,
            }
        }
        var colorList = ['#73DDFF', '#ffc72b']
        this.option = {
            title: {
                text: '总量',
                x: 'center',
                y: 'center',
                textStyle: {
                    fontSize: 20,
                    color: "#ffc72b",
                    padding: [5, 4],
                    align: 'center'
                }
            },
            tooltip: {
                trigger: 'item'
            },
            series: [{
                type: 'pie',
                center: ['50%', '50%'],
                radius: ['50%', '83%'],
                clockwise: true,
                avoidLabelOverlap: true,
                hoverOffset: 10,
                itemStyle: {
                    normal: {
                        color: function(params) {
                            return colorList[params.dataIndex]
                        }
                    }
                },
                label: {
                    show: true,
                    position: 'outside',
                    color: '#ddd',
                    formatter:  (params, ticket, callback) => {
                        var total = 0; //考生总数量
                        var percent = 0; //考生占比
                        // this.echartData.forEach(function (value, index, array) {
                        //     total += value.value;
                        // });
                        // console.log(params)
                        percent = ((params.value / total) * 100).toFixed(1);
                        // return '{white|' + params.name + '}' + '\n{white|' + params.percent + '%}';
                        return '{white|' + params.name + '}' + '{white|' + params.percent + '%}';
                    },
                    rich: rich
                },
                labelLine: {
                    normal: {
                        length: 10,
                        length2: 15,
                        lineStyle: {
                            width: 1
                        }
                    }
                },
                data: [{
                    'name': 'A座',
                    'value': 70
                }, {
                    'name': 'B座',
                    'value': 35
                }
                ],
            }]
        };


        callback && callback(this.option)
    }

}