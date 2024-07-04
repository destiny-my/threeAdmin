/*
 * @Author: ybf
 * @Date: 2023-11-08 10:06:10
 * @LastEditTime: 2023-11-29 10:05:03
 * @Description: 描述
 * Copyright (c) 2023 by 慧能分享, All Rights Reserved.
 */
export default class HeatComparison {
    /**
     * 构造函数
     * @param id 场景窗体div
     */
    constructor(echarts) {
        this.echarts = echarts
        this.scale = 1
        this.option = {}
    }
    _HeatSupplyInit(){
        // this.HeatSupplyOptionFunc()
    }

    heatComparisonFunc(callback) {
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
                data: ["去年","今年"],
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
                data: [],
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
                type: 'value',
                max: '1200',
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
                    name: '去年',
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
                    data: [600]
                  },
                {
                    name: '今年',
                    type: 'bar',
                    barWidth: '20%',
                    itemStyle: {
                        normal: {
                            color: new this.echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 0,
                                color: '#248ff7'
                            }, {
                                offset: 1,
                                color: '#6851f1'
                            }]),
                        }
                    },
                    data: [400]
                }
            ]
        }
        callback(this.option)
    }

}