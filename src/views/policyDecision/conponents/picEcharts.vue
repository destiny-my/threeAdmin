
<template>
  <div id="PicEcharts" style="height: 100%; width: 95%;left:20px;"></div>
</template>

<script>
export default {
  data() {
    return {
      myChart:[]
    };
  },

    created() {
        this.$nextTick(()=> {
            this.lineEcharts()
        })
    },


  methods: {
    lineEcharts() {
      var chartDom = document.getElementById("PicEcharts");
      var myChart = this.$echarts.init(chartDom);
      let value = "10800";
      var option;
      option = {
        // backgroundColor: "#020f18",
        title: {
          text: "{c|节约}\n{a|" + value + "}\n{c|元}",
          x: "center",
          y: "center",
          textStyle: {
            rich: {
              a: {
                fontSize: 33,
                color: "#fff",
                fontWeight: "400",
              },
              c: {
                fontSize: 16,
                width: 31,
                height: 15,
                color:"#05122E",
              },
            },
          },
        },
        xAxis: {
          data: [],
          axisTick: {
            show: false,
          },
          axisLine: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
        },
        yAxis: {
          splitLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLine: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
        },

        series: [
          {
            name: "外部刻度",
            type: "gauge",
            //  center: ['20%', '50%'],
            radius: "100%",
            min: 0, //最小刻度
            max: 100, //最大刻度

            startAngle: 225,
            endAngle: -45,
            axisLine: {
              show: false,
              lineStyle: {
                width: 1,
                color: [[1, "rgba(0,0,0,0)"]],
              },
            }, //仪表盘轴线
            axisLabel: {
              show: false,
            },
            axisTick: {
              show: true,
              splitNumber: 7,
              lineStyle: {
                color: "#42E5FB", //用颜色渐变函数不起作用
                width: 2,
              },
              length: 8,
            }, //刻度样式
            splitLine: {
              show: true,
              length: 15,
              lineStyle: {
                color: "#42E5FB", //用颜色渐变函数不起作用
              },
            }, //分隔线样式
            detail: {
              show: false,
            },
            pointer: {
              show: false,
            },
          },


        {
            name: "内部（环形）进度条",
            type: "gauge",
            // center: ['20%', '50%'],
            radius: '70%',
            splitNumber: 50,
            axisLine: {
                lineStyle: {
                    color: [
                        [value / 100, 'rgba(76, 228, 230, 1)'],
                        [1, "rgba(24, 134, 144, 0.8)"]
                    ],
                    width: 5
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
            z: 5,
          
        },
          {
            name: "内圆",
            type: "pie",
            radius: [0, "56%"], //蓝色
            hoverAnimation: false,
            itemStyle: {
                shadowBlur: 20,
                shadowColor: "#000",
                color: {
                  type: "radial",
                  x: 0.5,
                  y: 0.5,
                  r: 0.5,
                  colorStops: [
                    {
                      offset: 0,
                      color: "rgba(76, 228, 230, 1)", // 0% 处的颜色
                    },
                    {
                      offset: 1,
                      color: "rgba(24, 134, 144, 0.8)", // 100% 处的颜色
                    },
                  ],
                  global: false, // 缺省为 false
              },
            },
            legendHoverLink: false,
            label: {
              show: false,
            },
            data: [100],
            z: 3,
          },
        ],
      };
      option && myChart.setOption(option);
        window.addEventListener("resize", function () {
            myChart.resize();
        });
    

    },
  },
};
</script>

<style lang="less" scoped>

        canvas{
          top:-10px;
          left: 20px;
        }
</style>






