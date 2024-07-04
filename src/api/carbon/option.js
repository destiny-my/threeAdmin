// 颜色
export let fontSize12 = '0.0559rem' // 12px
export let fontSize14 = '0.0729rem' // 14px
export let fontSize16 = '0.0833rem' // 16px
export let fontSize22 = '0.1146rem' // 22px
export let colorFont = '#FFF' // 字体颜色
export let colorFont75 = 'rgba(255,255,255,0.75)' // 白色透明
export let colorBackground = 'rgba(2, 44, 86, 0.8)' // 背景颜色
export let colorBorder = 'rgba(0, 243, 230, 0.4)' // 边框颜色
export let colorSplitLine = ['#506B98', '#9AAFC2'] // 分割线颜色
export let colorPalette = ['#FF6622', '#229AFF', '#22FFCC', '#F6C33B'] // 调色盘
export let colorPaletteOptimization = ['#EB3820', '#85C021', '#00FFFF'] // 调色盘 碳排优化 [优化前,优化后,实际]
// export let colorMeasurement = ['#E30726', '#85C021'] //调色盘 用电度量内各曲线
export let colorMeasurement = ['#85C021', '#EB3820'] //调色盘 用电度量内各曲线
export let colorBaseLine = ['#8085E9', '#ecf390'] //标准基线
export let colorTodayAnalyse = ['#3caef5', '#40C836', '#EB3820'] //调色盘 负载率分析：今日工况分析
export let colorTimeSharing_R = ['#BA8448', '#05B8FF', '#F36C21'] //调色盘 电费分析：[基本电费，电度电费，力调电费]
export let colorTimeSharing_L = ['#bee7f4', '#3bb8dd', '#239fc3'] //调色盘 电费分析：[峰，平，谷]
export let colorAllProp = ['#229AFF', '#22FFCC', '#F6C33B'] //调色盘 总览：[电，气，水]
export let colorElecProp = ['#FF0000', '#ffa500', '#ffff00', '#00ff00', '#007fff', '#0000ff', '#8b00ff'] //调色盘 用电分析：[空调，照明，电梯，新风，给排水，插座，应急]
export let colorWaterProp = ['#EFA666', '#EDDD86', '#9987CE'] //调色盘 用水分析：[厨房排水，卫生间排水，景观水]
export let colorGasProp = ['#63B2EE', '#76DA91'] //调色盘 用气分析：[厨房，供暖]
export let colorOptimizeLoad = ['#FF0000', '#F47920', '#229AFF', '#f391a9', '#FEDCBD', '#00FFFF'] // 调色盘 优化
export let colorOptimizeMulti = ['#009ACD', '#85C021', '#00FFFF', '#7CFC00'] // 调色盘 优化

// 曲线option 普通样式
export let optionCurves = {
  color: colorPalette,
  title: {
    show: false,
  },
  legend: [{
    // align: "left",
    right: '0',
    type: 'plain',
    textStyle: {
      color: '#7EC7FF',
      fontSize: fontSize12
    },
    icon: 'rect',
    itemWidth: 13,
    itemHeight: 3,
    itemGap: 13,
    data: [],
  }],
  tooltip: {
    trigger: "axis",
    axisPointer: {
      lineStyle: {
        color: "#57617B",
      },
    },
    backgroundColor: 'rgba(4, 13, 40, 0.5)',
    borderColor: '#0095FF',
    textStyle: {
      color: '#DEF1FD',
      fontSize: fontSize12
    },
    padding: 5,
  },
  grid: {
    left: '12%',
    right: '3%',
    top: '15%',
    bottom: '30%',
  },
  xAxis: [{
    type: 'category',
    // boundaryGap: false,
    data: [],
    axisLine: {
      show: true,
      lineStyle: {
        color: "#306269",
      },
    },
    axisTick: {
      show: false,
    },
    boundaryGap: false,
    axisLabel: {
      show: true,
      // interval: 3,
      formatter: '{value}',
      color: "#DEF1FD",
      fontSize: fontSize12
    }
  }],
  yAxis: [{
    name: '',
    type: 'value',
    scale: true,
    axisLine: {
      show: true,
      lineStyle: {
        color: '#233653',
      },
    },
    axisLabel: {
      show: true,
      formatter: '{value}',
      color: "#DEF1FD",
      fontSize: fontSize12
    },
    nameTextStyle: {
      color: '#DEF1FD',
      fontSize: fontSize12,
      fontWeight: 400,
      align: 'right',
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: "#192A44"
      }
    },
    axisTick: {
      show: false,
    },
  }],
  series: [],
}

// 饼图option 普通样式
export let optionPieNormal = {
  title: {
    text: '{c|}\n{a|}',
    x: 'center',
    y: 'center',
    textStyle: {
      rich: {
        a: {
          fontSize: fontSize22,
          color: colorFont,
          fontWeight: 400
        },
        c: {
          fontSize: fontSize16,
          width: 31,
          height: 15,
          color: colorFont
        }
      }
    }
  },
  legend: {
    top: '5%',
    left: 'center',
    textStyle: {
      color: colorFont
    }
  },
  series: [{
    name: 'Access From',
    type: 'pie',
    radius: ['40%', '60%'],
    avoidLabelOverlap: true,
    label: {
      show: true,
      position: 'inner',
      textStyle: {
        fontWeight: 300,
        fontSize: fontSize14
      },
      formatter: '{c}'

    },
    itemStyle: {
      borderRadius: 5,
      borderColor: colorFont,
      borderWidth: 2
    },
    emphasis: {
      label: {
        show: true,
        fontSize: fontSize14,
        fontWeight: 'bold'
      }
    },
    labelLine: {
      show: true
    },
    data: []
  }]
}

// 饼图option 样式二
export let optionPie = {
  title: {
    text: '{a|}\n{b|}',
    // left: "center",
    top: 'center',
    left: '32%',
    textAlign: 'center',
    textStyle: {
      rich: {
        a: {
          fontSize: fontSize14,
          fontWeight: 'normal',
          color: colorFont,
          lineHeight: 20
        },
        b: {
          fontSize: fontSize16,
          fontWeight: 'bold',
          color: colorFont,
          lineHeight: 20
        }
      }
    }
  },
  tooltip: {
    trigger: "item",
    // axisPointer: {
    //     lineStyle: {
    //         color: "#57617B",
    //     },
    // },
    backgroundColor: 'rgba(4, 13, 40, 0.5)',
    borderColor: '#0095FF',
    textStyle: {
      color: '#DEF1FD',
      fontSize: fontSize14
    },
    padding: 5,
  },
  legend: {
    type: 'plain',
    icon: 'circle',
    show: true,
    orient: 'vertical',
    top: 'center',
    left: '60%',
    textStyle: {
      align: 'left',
      verticalAlign: 'middle',
      rich: {
        name: {
          color: 'rgb(255,255,255)',
          fontSize: fontSize14,
          padding: [0, 10, 0, 0],
          width: 50,
        },
        value: {
          color: 'rgb(1, 147, 249)',
          fontSize: fontSize14,
          width: 50,
          align: 'right',
        }
      }
    },
    formatter: (text) => {
      text = JSON.parse(text)
      return `{name|${text.name}} {value|${text.value}}`
    }
  },
  series: [{
    type: 'pie',
    center: ['33%', '50%'],
    radius: ['58%', '70%'],
    z: 10,
    avoidLabelOverlap: false,
    itemStyle: {
      color: (params) => {
        return colorList[params.dataIndex]
      },
      borderColor: '#040a21',
      borderWidth: 8
    },
    label: {
      show: false,
      position: 'outer',
      alignTo: 'labelLine',
      formatter: '{a|{b}：}{b|{d}%}',
      padding: [0, -90],
      rich: {
        a: {
          padding: [20, 0, 0, 25]
        },
        b: {
          padding: [20, 0, 0, 0]
        }
      }
    },
    labelLine: {
      show: false
    },
    emphasis: {
      label: {
        show: false,
        fontSize: fontSize14,
        fontWeight: 'bold',
        color: '#505050'
      },
      labelLine: {
        lineStyle: {
          color: '#ccc'
        }
      }
    },
    data: []
  },
    {
      // 外环阴影
      name: '',
      type: 'pie',
      radius: ['50%', '60%'],
      center: ['33%', '50%'],
      z: 11,
      label: {
        show: false
      },
      silent: true,
      itemStyle: {
        shadowBlur: 10,
        shadowColor: 'rgba(24,219,159,0.1)',
        color: 'rgba(4, 39, 80,0.8)'
      },
      emphasis: {
        scale: false
      },
      hoverOffset: 5,
      data: [100]
    },
    {
      // 内一层
      type: 'pie',
      startAngle: 220,
      endAngle: -40,
      emphasis: {
        scale: false
      },
      silent: true,
      radius: '33%',
      center: ['33%', '50%'],
      avoidLabelOverlap: false,
      label: {
        show: false
      },
      labelLine: {
        show: false
      },
      itemStyle: {
        color: 'rgba(2, 44, 86,0.8)'
      },
      data: [100]
    },
    // {
    //     type: 'pie',
    //     radius: '34%',
    //     center: ['33%', '50%'],
    //     avoidLabelOverlap: false,
    //     z: 0,
    //     hoverAnimation: false,
    //     label: {
    //         show: false
    //     },
    //     labelLine: {
    //         show: false
    //     },
    //     data: [{
    //         value: 1,
    //         itemStyle: {
    //             normal: {
    //                 color: '#0b5263'
    //             }
    //         }
    //     }]
    // },
    {
      //内二层圈
      type: 'pie',
      radius: '33%',
      center: ['33%', '50%'],
      avoidLabelOverlap: false,
      z: 0,
      emphasis: {
        scale: false
      },
      silent: true,
      label: {
        show: false
      },
      labelLine: {
        show: false
      },
      itemStyle: {
        color: 'rgb(3, 17, 44)',
        shadowBlur: 10,
        shadowColor: 'rgba(2, 148, 254, 0.8)',
        // color: 'rgba(4, 39, 80,0.8)'
      },
      data: [100]
    },
  ]
}

// 曲线option 带小圆点单线样式
export let optionSymbolCurves_L = {
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
    align: "left",
    // right: "5%",
    top: "5%",
    type: "plain",
    textStyle: {
      color: "#7EC7FF",
      fontSize: fontSize16,
    },
    icon: "rect",
    itemWidth: 10,
    itemHeight: 10,
    itemGap: 13,
    data: [],
  },
  grid: {
    top: "18%",
    left: "5%",
    right: "5%",
    bottom: "15%",
    // containLabel: true
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
      color: "#7EC7FF",
    },
    splitLine: {
      show: false,
      lineStyle: {
        color: "#192A44",
      },
    },
    axisTick: {
      show: false,
    },
    data: [],
  },],
  yAxis: [{
    nameTextStyle: {
      color: "#7EC7FF",
    },
    min: 0,
    splitLine: {
      show: true,
      lineStyle: {
        color: "#192A44",
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
      color: "#7EC7FF",
    },
    axisTick: {
      show: false,
    },
  },],
  series: [{
    name: "功率因数",
    type: "line",
    symbol: "circle", // 默认是空心圆（中间是白色的），改成实心圆
    showSymbol: true,
    smooth: false,
    lineStyle: {
      // width: 5,
      color: "rgba(25,163,223,1)", // 线条颜色
      borderColor: "rgba(0,0,0,.4)",
    },
    itemStyle: {
      color: "rgba(25,163,223,1)",
      borderColor: "#646ACE",
      borderWidth: 2,
    },
    tooltip: {
      show: true,
    },
    data: [],
  }],
}

// 曲线option 带小圆点多曲线样式
export let optionMostCurves = {
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
    align: "left",
    // right: "5%",
    top: "5%",
    type: "plain",
    textStyle: {
      color: "#7ec7ff",
      fontSize: fontSize16,
    },
    icon: 'rect',
    itemGap: 13,
    itemWidth: 10,
    itemHeight: 10,
    data: [],
  },
  grid: {
    top: "20%",
    left: "5%",
    right: "5%",
    bottom: "5%",
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
      color: "#7ec7ff",
      fontSize: fontSize14,
      formatter: function (data) {
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
    data: [],
  },],
  yAxis: [],
  series: [],
}

// 柱状图
export let optionBar = {
  colors: colorPalette,
  tooltip: {
    // 提示框组件
    trigger: 'axis',
    backgroundColor: colorBackground,
    borderColor: colorBorder, // 边框颜色
    axisPointer: {
      type: 'shadow',
      label: {
        // backgroundColor: 'rgba(17, 27, 54, 1)',
        // backgroundColor: colorBackground
      },
    },
    textStyle: {
      color: colorFont,
      fontStyle: 'normal',
      fontSize: fontSize14,
    },
  },
  grid: {
    left: '2%',
    right: '2%',
    bottom: '5%',
    top: '15%',
    containLabel: true,
  },
  legend: {
    // 图例组件，颜色和名字
    right: 0,
    top: '5%',
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
    type: 'category',
    // 	boundaryGap: true,//坐标轴两边留白
    data: [],
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
        color: colorSplitLine,
        opacity: 0.3,
      },
    },
  },],
  yAxis: [{
    type: 'value',
    name: "kgCO₂",
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
        color: colorSplitLine,
        opacity: 0.3,
      },
    },
    axisTick: {
      show: false,
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: colorSplitLine,
        opacity: 0.3,
      },
    },
  },],
  series: [],
}

// 仪表盘Option
export let optionPanel = {
  tooltip: {
    formatter: '{b} <br/> {c}%',
    backgroundColor: colorBackground,
    borderColor: colorBorder, // 边框颜色
    textStyle: {
      color: colorFont,
      fontSize: fontSize14,
    }
  },
  title: {
    text: '{a|}\n{b|}',
    left: "50%",
    bottom: '7%',
    textAlign: 'center',
    textStyle: {
      rich: {
        a: {
          fontSize: fontSize14,
          fontWeight: 'normal',
          color: colorFont,
          lineHeight: 20
        },
        b: {
          fontSize: fontSize16,
          fontWeight: 'bold',
          color: colorFont,
          lineHeight: 20
        }
      }
    }
  },
  series: [{
    type: 'gauge',
    min: 0,
    max: 100,
    splitNumber: 10,
    axisLine: {
      lineStyle: {
        width: 10,
        color: [
          [0.2, colorPalette[3]],
          [0.8, colorPalette[2]],
          [1, colorPalette[1]]
        ]
      }
    },
    pointer: {
      icon: 'path://M2090.36389,615.30999 L2090.36389,615.30999 C2091.48372,615.30999 2092.40383,616.194028 2092.44859,617.312956 L2096.90698,728.755929 C2097.05155,732.369577 2094.2393,735.416212 2090.62566,735.56078 C2090.53845,735.564269 2090.45117,735.566014 2090.36389,735.566014 L2090.36389,735.566014 C2086.74736,735.566014 2083.81557,732.63423 2083.81557,729.017692 C2083.81557,728.930412 2083.81732,728.84314 2083.82081,728.755929 L2088.2792,617.312956 C2088.32396,616.194028 2089.24407,615.30999 2090.36389,615.30999 Z',
      width: 8,
      offsetCenter: [0, 0],
      itemStyle: {
        color: '#3BE9FE'
      }
    },
    axisTick: {
      length: 8,
      distance: 0,
      lineStyle: {
        color: '#3BE9FE',
        width: 1
      }
    },
    splitLine: {
      length: 8,
      distance: 0,
      lineStyle: {
        color: '#3BE9FE',
        width: 1
      }
    },
    axisLabel: {
      color: '#3BE9FE',
      fontSize: fontSize14,
      distance: 20,
    },
    title: {
      show: false,
    },
    detail: {
      fontSize: fontSize14,
      valueAnimation: true,
      offsetCenter: [0, '60%'],
      formatter: '{value}%',
      color: '#6fe1e2'
    },
    data: []
  }]
}

// 雷达图
export let optionRadar = {
  color: colorPaletteOptimization,
  tooltip: {
    trigger: 'item',
    backgroundColor: colorBackground,
    borderColor: colorBorder, // 边框颜色
    axisPointer: {
      type: 'shadow',
      label: {
        // backgroundColor: 'rgba(17, 27, 54, 1)',
        // backgroundColor: colorBackground
      },
    },
    textStyle: {
      color: colorFont,
      fontStyle: 'normal',
      fontSize: fontSize14,
    },
  },
  legend: {
    // orient: 'vertical',
    icon: 'circle', // 图例形状
    data: [],
    top: 15,
    right: 0,
    itemWidth: 14, // 图例标记的图形宽度[ default: 25 ]
    itemHeight: 14, // 图例标记的图形高度[ default: 14 ]
    itemGap: 21, // 图例每项之间的间隔。[ default: 10 ]横向布局时为水平间隔，纵向布局时为纵向间隔
    textStyle: {
      fontSize: fontSize14,
      color: colorFont,
      opacity: 0.75,
    },
  },
  textStyle: {
    color: colorFont,
    fontSize: fontSize14,
  },
  radar: {
    // shape: 'circle',
    axisName: {
      textStyle: {
        fontSize: fontSize16,
        color: colorFont75,
      },
    },
    indicator: [],
    radius: 85, // 缩放
    splitArea: {
      // 坐标轴在 grid 区域中的分隔区域，默认不显示
      show: true,
      areaStyle: {
        // 分隔区域的样式设置
        color: ['rgba(255,255,255,0)', 'rgba(255,255,255,0)'], // 分隔区域颜色。分隔区域会按数组中颜色的顺序依次循环设置颜色。默认是一个深浅的间隔色
      }
    },
    axisLine: {
      // 指向外圈文本的分隔线样式
      lineStyle: {
        color: '#1D6B86'
      }
    },
    splitLine: {
      lineStyle: {
        color: '#1D6B86', // 分隔线颜色
        width: 1, // 分隔线线宽
      }
    },
  },
  series: [{
    type: 'radar',
    symbolSize: 8,
    // symbol: 'angle',
    data: []
  }]
}
