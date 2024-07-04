<template>
   <div id="IncomeAnalysis" style="height: 100%; width: 95%"></div>
</template>

<script>
export default {
    data(){
        return{
            myChart:[]
        }
    },


    created() {
        this.$nextTick(()=> {
            this.lineEcharts()
        })
    },

    mounted(){
        let _this = this;
        window.onresize = function() {
            _this.myChart.resize()
        }

    },

    methods:{
    lineEcharts() {
      var chartDom = document.getElementById("IncomeAnalysis");
      this.myChart = this.$echarts.init(chartDom);
      let xLabel = ["1月", "2月", "3月", "4月", "5月", "6月","7月", "8月", "9月", "10月", "11月", "12月"];
      let goToSchool = ["40", "60", "22", "85", "50", "40"]
      let goOutSchool = ["20", "50", "12", "65", "30", "60"]
      var option;
option = {
    // backgroundColor: '#080b30',
    title: {
        // text: '多线图',
        textStyle: {
            align: 'center',
            color: '#fff',
            fontSize: 20,
        },
        top: '5%',
        left: 'center',
    },
    legend: {
        // data: ['已贯通', '计划贯通','贯通率',],
        textStyle: {
            color: '#B4B4B4'
        },
        top:'7%',
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            lineStyle: {
                color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                        offset: 0,
                        color: 'rgba(0, 255, 233,0)'
                    }, {
                        offset: 0.5,
                        color: 'rgba(255, 255, 255,1)',
                    }, {
                        offset: 1,
                        color: 'rgba(0, 255, 233,0)'
                    }],
                    global: false
                }
            },
        },
    },
    grid: {
        top: '15%',
        left: '5%',
        right: '5%',
        bottom: '15%',
        // containLabel: true
    },
    xAxis: [{
        type: 'category',
        axisLine: {
            show: true
        },
        splitArea: {
            // show: true,
            color: '#f00',
            lineStyle: {
                color: '#f00'
            },
        },
        axisLabel: {
            color: '#fff'
        },
        splitLine: {
            show: false
        },
        boundaryGap: false,
        data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],

    }],

    yAxis: [{
        type: 'value',
        min: 0,
        // max: 140,
        splitNumber: 4,
        splitLine: {
            show: true,
            lineStyle: {
                color: 'rgba(255,255,255,0.1)'
            }
        },
        axisLine: {
            show: true,
        },
        axisLabel: {
            show: true,
            formatter:["100","200","400","600","800"],
            textStyle: {
                
                color: '#d1e6eb',
            },
        },
        axisTick: {
            show: true,
        },

    }],
    series: [{
            name: '优化前碳排',
            type: 'line',
            smooth: true, //是否平滑
            showAllSymbol: true,
            data: goToSchool,

            // symbol: 'image://./static/images/guang-circle.png',
            symbol: 'circle',
            symbolSize: 15,
            lineStyle: {
                normal: {
                    color: "#00b3f4",
                    shadowColor: 'rgba(0, 0, 0, .3)',
                    shadowBlur: 0,
                    shadowOffsetY: 5,
                    shadowOffsetX: 5,
                },
            },
            label: {
                show: true,
                position: 'top',
                textStyle: {
                    color: '#00b3f4',
                }
            },
            itemStyle: {
                color: "#00b3f4",
                borderColor: "#fff",
                borderWidth: 3,
                shadowColor: 'rgba(0, 0, 0, .3)',
                shadowBlur: 0,
                shadowOffsetY: 2,
                shadowOffsetX: 2,
            },
            tooltip: {
                show: false
            },
            areaStyle: {
                normal: {
                    color: this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: 'rgba(0,179,244,0.3)'
                        },
                        {
                            offset: 1,
                            color: 'rgba(0,179,244,0)'
                        }
                    ], false),
                    shadowColor: 'rgba(0,179,244, 0.9)',
                    shadowBlur: 20
                }
            },
        },
        {
            name: '优化后碳排',
            type: 'line',
            smooth: true, //是否平滑
            showAllSymbol: true,
            // symbol: 'image://./static/images/guang-circle.png',
            symbol: 'circle',
            symbolSize: 15,
            lineStyle: {
                normal: {
                    color: "#00ca95",
                    shadowColor: 'rgba(0, 0, 0, .3)',
                    shadowBlur: 0,
                    shadowOffsetY: 5,
                    shadowOffsetX: 5,
                },
            },
            label: {
                show: true,
                position: 'top',
                textStyle: {
                    color: '#00ca95',
                }
            },

            itemStyle: {
                color: "#00ca95",
                borderColor: "#fff",
                borderWidth: 3,
                shadowColor: 'rgba(0, 0, 0, .3)',
                shadowBlur: 0,
                shadowOffsetY: 2,
                shadowOffsetX: 2,
            },
            tooltip: {
                show: false
            },
            areaStyle: {
                normal: {
                    color: this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: 'rgba(0,202,149,0.3)'
                        },
                        {
                            offset: 1,
                            color: 'rgba(0,202,149,0)'
                        }
                    ], false),
                    shadowColor: 'rgba(0,202,149, 0.9)',
                    shadowBlur: 20
                }
            },
            data: goOutSchool,
        },

    ]
};
            option && this.myChart.setOption(option);
    },
    }
}
</script>

<style lang="less" scoped>


</style>


