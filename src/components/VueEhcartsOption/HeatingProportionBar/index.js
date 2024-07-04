export default class HeatingProportionBar {
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

    HeatingProportionBarOptionFunc(callback) {
        var colorList = ['#506B98', '#9AAFC2']
        let fontSize14 = '0.0629rem' // 14px
        let colorBorder = 'rgba(0, 243, 230, 0.4)' // 边框颜色
        let colorBackground = 'rgba(2, 44, 86, 0)' // 背景颜色
        let colorFont = '#FFF' // 字体颜色
        let colorPalette = ['#FF6622', '#229AFF', '#22FFCC', '#F6C33B'] // 调色盘
        this.option = {
            colors: colorPalette,
            tooltip: {
                // 提示框组件
                trigger: 'axis',
                // backgroundColor: colorBackground,
                // borderColor: colorBorder, // 边框颜色
                // axisPointer: {
                //     type: 'shadow',
                //     label: {
                //         // backgroundColor: 'rgba(17, 27, 54, 1)',
                //         // backgroundColor: colorBackground
                //     },
                // },
                // textStyle: {
                //     color: colorFont,
                //     fontStyle: 'normal',
                //     fontSize: fontSize14,
                // },
            },
            grid: {
                left: '2%',
                right: '5%',
                bottom: '1%',
                top: '15%',
                containLabel: true,
            },
            legend: {
                // 图例组件，颜色和名字
                right: 0,
                top: '2%',
                itemGap: 16,
                itemWidth: 18,
                itemHeight: 10,
                // selectedMode: false,
                // show: true,
                // data: [],
                textStyle: {
                    color: colorFont,
                    fontStyle: 'normal',
                    fontSize: fontSize14,
                },
            },
            xAxis: [{
                type: 'value',
                // type: 'category',
                // boundaryGap: true,//坐标轴两边留白
                // data: [],
                axisLabel: {
                    //坐标轴刻度标签的相关设置。
                    //		interval: 0,//设置为 1，表示『隔一个标签显示一个标签』
                    //	margin:15,
                    color: colorFont,
                    fontStyle: 'normal',
                    fontSize: fontSize14,
                    rotate: 0,
                },
                axisTick: {
                    //坐标轴刻度相关设置。
                    show: false,
                },
                axisLine: {
                    //坐标轴轴线相关设置
                    lineStyle: {
                        color: colorList,
                        opacity: 1,
                    },
                },
                splitLine: {
                    show: false,
                    lineStyle: {
                        color: colorList,
                        opacity: 0.3,
                    },
                },
            }],
            yAxis: [{
                // type: 'value',
                // name: "kgCO₂",
                type: 'category',
                data: ['g22', 'g23'],
                nameTextStyle: {
                    color: colorFont,
                    lineHeight: 0,
                    padding: [0, 30, 10, 0],
                },
                splitNumber: 5,
                axisLabel: {
                    color: colorFont,
                    fontStyle: 'normal',
                    fontSize: fontSize14,
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: colorList,
                        opacity: 1,
                    },
                },
                axisTick: {
                    show: false,
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: colorList,
                        opacity: 0.3,
                    },
                },
            },],
            series: [{
                name: '',
                type: 'bar',
                barWidth: '20%',
                itemStyle: {
                  normal: {
                      color: new this.echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                          offset: 0,
                          color: '#8bd46e'
                      }, {
                          offset: 1,
                          color: '#09bcb7'
                      }]),
    
                  }
                  
                },
                data: [600, 300]
              },
            // {
            //     name: '今年',
            //     type: 'bar',
            //     barWidth: '20%',
            //     itemStyle: {
            //         normal: {
            //             color: new this.echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            //                 offset: 0,
            //                 color: '#248ff7'
            //             }, {
            //                 offset: 1,
            //                 color: '#6851f1'
            //             }]),
            //         }
            //     },
            //     data: []
            // }
        ]};
        callback && callback(this.option)
    }

}