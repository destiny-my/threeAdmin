<template>
  <div :id="idClass" style="height: 100%; width: 100%"></div>
</template>

<script>
export default {
  props: {
    idClass: {
      type: String
    },
    message1: {
      type: String
    },
    message2: {
      type: String
    }
  },

  data() {
    return {
      myChart: []
    }
  },
  created() {
    this.$nextTick(() => {
      this.echart()
    })
  },
  mounted() {
    let _this = this
    window.onresize = function() {
      _this.myChart.resize()
    }

  },
  methods: {
    echart() {
      var chartDom = document.getElementById(this.idClass)
      this.myChart = this.$echarts.init(chartDom)
      var option
      var value = this.message2
      var data = {
        value: value,
        Ratio: (value / 100).toFixed(2)
      }

      // 指定图表的配置项和数据
      var option = {
        series: [
          {
            type: 'gauge',
            min: 0,
            max: 100,
            splitNumber: 10,
            axisLine: {
              lineStyle: {
                width: 15,
                color: [
                  [0.2, '#d9ab42'],
                  [0.8, '#6fe1e2'],
                  [1, '#2395eb']
                ]
              }
            },
            pointer: {
              icon: 'path://M2090.36389,615.30999 L2090.36389,615.30999 C2091.48372,615.30999 2092.40383,616.194028 2092.44859,617.312956 L2096.90698,728.755929 C2097.05155,732.369577 2094.2393,735.416212 2090.62566,735.56078 C2090.53845,735.564269 2090.45117,735.566014 2090.36389,735.566014 L2090.36389,735.566014 C2086.74736,735.566014 2083.81557,732.63423 2083.81557,729.017692 C2083.81557,728.930412 2083.81732,728.84314 2083.82081,728.755929 L2088.2792,617.312956 C2088.32396,616.194028 2089.24407,615.30999 2090.36389,615.30999 Z',
              width: 10,
              offsetCenter: [0, 0],
              itemStyle: {
                color: 'auto'
              }
            },
            axisTick: {
              length: 8,
              distance: 0,
              lineStyle: {
                color: '#6fe1e2',
                width: 2
              }
            },
            splitLine: {
              length: 8,
              distance: 0,
              lineStyle: {
                color: '#6fe1e2',
                width: 2
              }
            },
            axisLabel: {
              color: '#1890ff',
              fontSize: 12,
              distance: 20,
            },
            title: {
              offsetCenter: [0, '80%'],
              fontSize: 14,
              textStyle:{
                color: '#fff',
              }
            },
            detail: {
              fontSize: 14,
              valueAnimation: true,
              offsetCenter: [0, '60%'],
              // formatter: function (value) {
              //   return value + '%';
              // },
              formatter: function (value) {
                if (value % 20 == 0) {
                  return value + '%';
                }
              },
              color: '#6fe1e2'
            },
            data: [
              {
                value: data.value,
                name: this.message1
              }
            ]
          }
        ]


        // series: [
        //   // 中间白色半圆
        //   {
        //     type: 'gauge',
        //     radius: '100%', // 位置
        //     center: ['50%', '70%'],
        //     min: 0,
        //     max: 100,
        //     startAngle: 180,
        //     endAngle: 0,
        //     axisLine: {
        //       show: true,
        //       lineStyle: {
        //         // 轴线样式
        //         width: 500, // 宽度
        //         color: [
        //           [
        //             1,
        //             new this.$echarts.graphic.RadialGradient(.5, 1, 1, [{
        //               offset: 1,
        //               color: 'rgba(229, 229, 229,0.15)'
        //             },
        //               {
        //                 offset: 0.4,
        //                 color: 'rgba(229, 229, 229,0.8)'
        //               },
        //               {
        //                 offset: 0,
        //                 color: 'rgba(229, 229, 229,0.8)'
        //               }
        //             ])
        //           ]
        //         ] // 颜色
        //       }
        //     },
        //     axisTick: {
        //       // 刻度
        //       show: false
        //     },
        //     splitLine: {
        //       // 分割线
        //       show: false
        //     },
        //     axisLabel: {
        //       // 刻度标签
        //       show: false
        //     },
        //     pointer: {
        //       // 仪表盘指针
        //       show: false
        //     },
        //     detail: {
        //       // 仪表盘详情
        //       show: false
        //     }
        //   },
        //   // 内侧轴线
        //   {
        //     type: 'gauge',
        //     radius: '90%', // 位置
        //     center: ['50%', '70%'],
        //     min: 0,
        //     max: 100,
        //     startAngle: 180,
        //     endAngle: 0,
        //     axisLine: {
        //       show: true,
        //       lineStyle: {
        //         // 轴线样式
        //         width: 200, // 宽度
        //         color: [
        //           [data.Ratio, colorLeft],
        //           [1, colorRight]
        //         ] // 颜色

        //       }
        //     },
        //     pointer: {
        //       // 仪表盘指针
        //       show: false
        //     },
        //     axisTick: {
        //       // 刻度
        //       show: false
        //     },
        //     splitLine: {
        //       // 分割线
        //       show: false
        //     },
        //     axisLabel: {
        //       // 刻度标签
        //       show: false
        //     },
        //     detail: {
        //       // 仪表盘详情
        //       show: false
        //     }
        //   },
        //   // 指针
        //   {
        //     type: 'gauge',
        //     radius: '80%', // 位置
        //     center: ['50%', '70%'],
        //     min: 0,
        //     max: 100,
        //     startAngle: 180,
        //     endAngle: 0,
        //     axisLine: {
        //       show: false
        //     },
        //     data: [{
        //       value: data.value,
        //       name: this.message1
        //     }],
        //     pointer: {
        //       // 仪表盘指针
        //       show: true
        //     },
        //     itemStyle: {
        //       color: 'rgba(255,255,255,0)',
        //       borderColor: '#f3f5f6',
        //       borderWidth: '4',
        //       borderType: 'solid'
        //     },
        //     axisTick: {
        //       // 刻度
        //       show: false
        //     },
        //     splitLine: {
        //       // 分割线
        //       show: false
        //     },
        //     axisLabel: {
        //       // 刻度标签
        //       show: true,
        //       distance: -62,
        //       textStyle: {
        //         color: '#fff',
        //         fontSize: 10,
        //         shadowColor: '#fff',
        //       },
        //       formatter: function (value) {
        //         if (value % 20 == 0) {
        //           return value + '%';
        //         }
        //       }
        //     },
        //     detail: {
        //       formatter: '{value}',
        //       textStyle:{
        //         fontSize:0
        //       }
        //     },
        //     title: {
        //       show: true,
        //       offsetCenter: [0, '50%'],
        //       color: '#08b5d6'
        //     }
        //   }
        // ]
      }

      option && this.myChart.setOption(option)

    }
  }
}
</script>

<style lang="less" scoped>


</style>




