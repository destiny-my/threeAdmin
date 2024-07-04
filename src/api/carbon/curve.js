//待引用
export function getMultiCurves(title, xLabel, yLabel, markLineLabel1, markLineLabel2, markLineLabel3, markLineNum1, markLineNum2, markLineNum3, seriesData1, seriesData2, seriesData3) {
  var markLabel1 = markLineLabel1.replace(/\n/g,'');
  var markLabel2 = markLineLabel2.replace(/\n/g,'');
  var markLabel3 = markLineLabel3.replace(/\n/g,'');
  var legendTop = "7%";
  var gridBottom = "16%";
  if(title != "") {
     legendTop = "17%";
     gridBottom = "17%";
  }
  var option = {
    title: {
      text: title,
      textStyle: {
        align: 'center',
        color: '#fff',
        fontSize: 20,
      },
      top: '5%',
      left: 'center',
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: 'rgba(4, 13, 40, 0.5)',
      borderColor: '#0095FF',
      textStyle: {
        color: '#DEF1FD'
      },
      axisPointer: {
        lineStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
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
      textStyle: {
        color: '#B4B4B4'
      },
      top:legendTop,
    },
    grid: {
      top: '15%',
      left: '5%',
      right: '5%',
      bottom: gridBottom,
      containLabel: false,
    },
    xAxis: [{
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
          padding: 2,
          fontSize: 14,
        },
        formatter: function(data) {
          return data;
        },
      },
      splitLine: {
        show: false,
        lineStyle: {
          color: "#192a44",
        },
      },
      axisTick: {
        show: false,
      },
      data: xLabel,
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
        formatter: yLabel,
        textStyle: {
          color: '#d1e6eb',
        },
      },
      axisTick: {
        show: true,
      },

    }],
    series: [
      {
        name: markLabel1,
        type: "line",
        symbol: "circle", // 默认是空心圆（中间是白色的），改成实心圆
        showSymbol: true,
        symbolSize: 5,
        smooth: false,
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
              yAxis: markLineNum1,
            },
          ],
          label: {
            normal: {
              formatter: markLineLabel1,
            },
          },
        },
        tooltip: {
          show: true,
        },
        data: seriesData1,
      },
      {
        name: markLabel2,
        type: "line",
        symbol: "circle", // 默认是空心圆（中间是白色的），改成实心圆
        showSymbol: true,
        symbolSize: 5,
        smooth: false,
        lineStyle: {
          normal: {
            // width: 5,
            color: "rgba(10,219,250,1)", // 线条颜色
          },
          borderColor: "rgba(0,0,0,.4)",
        },
        itemStyle: {
          color: "rgba(10,219,250,1)",
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
              yAxis: markLineNum2,
            },
          ],
          label: {
            normal: {
              formatter: markLineLabel2,
            },
          },
        },
        tooltip: {
          show: true,
        },
        data: seriesData2,
      },
      {
        name: markLabel3,
        type: "line",
        symbol: "circle", // 默认是空心圆（中间是白色的），改成实心圆
        showSymbol: true,
        symbolSize: 5,
        smooth: false,
        lineStyle: {
          normal: {
            // width: 5,
            color: "rgba(0,202,149,1)", // 线条颜色
          },
          borderColor: "rgba(0,0,0,.4)",
        },
        itemStyle: {
          color: "rgba(0,202,149,1)",
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
              yAxis: markLineNum3,
            },
          ],
          label: {
            normal: {
              formatter: markLineLabel3,
            },
          },
        },
        tooltip: {
          show: true,
        },
        data: seriesData3,
      }
    ],
  };
  return option;
}
