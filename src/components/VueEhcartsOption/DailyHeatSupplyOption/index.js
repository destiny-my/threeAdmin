export default class dailyHeatSupplyOption {
    /**
     * 构造函数
     * @param id 场景窗体div
     */
    constructor(echarts) {
        this.echarts = echarts
        this.option = null
    }

    dailyHeatSupplyOptionFunc(callback) {
        this.option = {

            tooltip: {
                trigger: 'axis',
                axisPointer: { // 坐标轴指示器，坐标轴触发有效
                    type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                }
            },
            grid: {
                left: '2%',
                right: '4%',
                bottom: '14%',
                top: '16%',
                containLabel: true
            },
            legend: {
                data: ['1', '2', '3'],
                right: 10,
                top: 12,
                textStyle: {
                    color: "#fff"
                },
                itemWidth: 12,
                itemHeight: 10,
                // itemGap: 35
            },
            xAxis: {
                type: 'category',
                data: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31',],
                axisLine: {
                    lineStyle: {
                        color: 'white'

                    }
                },
                axisLabel: {
                    // interval: 0,
                    // rotate: 40,
                    textStyle: {
                        fontFamily: 'Microsoft YaHei'
                    }
                },
            },
            yAxis: {
                name: '',
                type: 'value',
                // max: '1200',
                axisLine: {
                    show: false,
                    lineStyle: {
                        color: 'white'
                    }
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: 'rgba(255,255,255,0.3)'
                    }
                },
                axisLabel: {}
            },
            series: [
                {
                    name: '3',
                    type: 'bar',
                    barWidth: '40%',
                    itemStyle: {
                        normal: {
                            color: new this.echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 0,
                                color: '#248ff7'
                            }, {
                                offset: 1,
                                color: '#6851f1'
                            }]),
                            barBorderRadius: 11,
                        }
                    },
                    data: [400, 600, 700, 700, 1000, 400, 400, 600, 700, 400, 600, 700, 700, 1000, 400, 400, 600, 700, 400, 600, 700, 700, 1000, 400, 400, 600, 700, 400, 600, 700, 700, 1000, 400, 400, 600, 700, 400, 600, 700, 700, 1000, 400, 400, 600, 700]
                }
            ]
        }
        callback(this.option)
    }

}