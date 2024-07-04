<template>
   <div id="analyseLine" style="height: 100%; width: 95%"></div>
</template>

<script>
export default {
    data(){
        return{
          myChart1:[]
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
            _this.myChart4.resize()
        }

    },
    methods:{
    lineEcharts() {
      var chartDom = document.getElementById("analyseLine");
      this.myChart4 = this.$echarts.init(chartDom);
      let xLabel = ["12-30", "12-30", "01-01", "01-02", "01-03", "01-04","01-05", "01-06", "01-07", "01-08", "01-09", "01-10"];
      let goToSchool = ["23", "25", "42", "55", "60", "80","95","82","70","59","55","40"];
      let goOutSchool = ["0", "1", "2", "2.5", "3.2", "3.6","4.2", "4.5", "4.2", "5.5", "7.2", "8.6"];
      var option;
      option = {
        // backgroundColor: "#0e1c47",
        tooltip: {
          trigger: "axis",
          backgroundColor: "transparent",
          axisPointer: {
            lineStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: "rgba(126,199,255,0)", // 0% 处的颜色
                  },
                  {
                    offset: 0.5,
                    color: "rgba(126,199,255,1)", // 100% 处的颜色
                  },
                  {
                    offset: 1,
                    color: "rgba(126,199,255,0)", // 100% 处的颜色
                  },
                ],
                global: false, // 缺省为 false
              },
            },
          },
        },
        legend: {
          align: "left",
          // right: "5%",
          top: "5%",
          type: "plain",
          textStyle: {
            color: "#7ec7ff",
            fontSize: 16,
          },
          // icon:'rect',
          itemGap: 25,
          itemWidth: 18,
          icon: "path://M0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z",

          data: [
            {
              name: "功率因数",
            },
            {
              name: "力调标准(%)",
            },
          ],
        },
        grid: {
          top: "20%",
          left: "10%",
          right: "5%",
          // bottom: "25%",
          // containLabel: true
        },
        xAxis: [
          {
            type: "category",
            boundaryGap: false,
            axisLine: {
              //坐标轴轴线相关设置。数学上的x轴
              show: true,
              lineStyle: {
                color: "#233653",
              },
            },
            axisLabel: {
              //坐标轴刻度标签的相关设置
              textStyle: {
                color: "#7ec7ff",
                padding: 16,
                fontSize: 14,
              },
              formatter: function (data) {
                return data;
              },
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: "#192a44",
              },
            },
            axisTick: {
              show: false,
            },
            data: xLabel,
          },
        ],
        yAxis: [
          {
            name:'单位:kgCO₂',
            nameTextStyle: {
              color: "#7ec7ff",
              fontSize: 16,
              padding: 10,
            },
            min: 0,
            splitLine: {
              show: true,
              lineStyle: {
                color: "#192a44",
              },
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: "#233653",
              },
            },
            axisLabel: {
              show: true,
              textStyle: {
                color: "#7ec7ff",
                padding: 16,
              },
              formatter: function (value) {
                if (value === 0) {
                  return value;
                }
                return value;
              },
            },
            axisTick: {
              show: false,
            },
          },
        ],
        series: [
          {
            name: "单位:kgCO₂",
            type: "line",
            symbol: "circle", // 默认是空心圆（中间是白色的），改成实心圆
            showSymbol: true,
            symbolSize: 5,
            smooth: true,
            lineStyle: {
              normal: {
                // width: 5,
                color: "rgba(25,163,223,1)", // 线条颜色
              },
              borderColor: "rgba(0,0,0,.4)",
            },
            itemStyle: {
              color: "rgba(25,163,223,1)",
              borderColor: "#646ace",
              borderWidth: 2,
            },
            markLine: {
              //安全基线
              silent: true,
              lineStyle: {
                normal: {
                  color: "#01fef9", // 这儿设置安全基线颜色
                },
              },
              data: [
                {
                  yAxis: "80",
                  name:"重载"
                },
                {
                yAxis: 30,
                name: '轻载',
                lineStyle: {
                    type: 'dashed',
                    color: '#b17063'
                },
                }
              ],
              label: {
                show:true
                // normal: {
                //   formatter: "重载", // 这儿设置安全基线
                // },
              },
            },
            tooltip: {
              show: true,
            },
            data: goToSchool,
          },
        ],
      };
            option && this.myChart4.setOption(option);
        // window.addEventListener("resize", function () {
        //     this.myChart1.resize();
        // });
    },
    }
}
</script>

<style lang="less" scoped>


</style>


