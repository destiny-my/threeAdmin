<template xmlns="http://www.w3.org/1999/html">
  <!-- 碳排优化 -->
  <div class="container title-fourth">
    <el-row class="height-100" :gutter="10">
      <el-col class="height-100" :xs="7" :sm="7" :md="6" :lg="6" :xl="6">
        <!-- 优化策略 -->
        <dv-border-box-12 class="strategy-card height-30">
          <el-row class="card-title"><span>优化策略</span></el-row>
          <!-- 优化日期 -->
          <el-row class="pl-25 pt-15 height-25">
            <span class="mr-25 opacity-75">优化日期</span>
            <DatePicker :pValue="dtStrategy" :pStart="dtStart" :pEnd="dtEnd" pStyle="width: 40%; height: 28px;" @changedDate="updateDateStrategy"></DatePicker>
          </el-row>
          <!-- 优化策略 -->
          <el-row class="pl-25 pt-10 height-25">
            <span class="mr-25 opacity-75">优化策略</span>
            <el-select :class="statusOptimize === 1 ? 'width-40 select-disabled' : 'width-40'" :disabled="statusOptimize === 1" v-model="optimizationStrategy" placeholder="请选择" @change="updateOptimizeStrategy">
              <el-option v-for="item in optimizationStrategyList" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-row>
          <!-- 数据来源 -->
          <el-row class="pl-25 pt-5 height-25">
            <span class="mr-25 opacity-75">数据来源</span>
            <el-select class="width-40 select-disabled" disabled v-model="dataFrom" placeholder="请选择">
              <el-option v-for="item in dataFromList" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-row>
          <!-- 按钮 -->
          <el-row class="fr">
            <el-button class="height-28p" v-show="statusOptimize === 1" type="primary" size="mini" :loading="false" @click="updateData">查询</el-button>
<!--            <el-button class="height-28p" v-show="statusOptimize === 1" type="primary" size="mini" :loading="false" @click="simStrategy(dtStart, dtEnd)">模拟</el-button>-->
            <el-button class="height-28p" v-show="statusOptimize !== 1" type="primary" size="mini" :loading="false" @click="optimize">优化</el-button>
            <el-button class="height-28p" v-show="statusOptimize === 3" type="primary" size="mini" :loading="false" @click="optimizeExec">应用</el-button>
          </el-row>
        </dv-border-box-12>
        <!-- 多能优化说明 -->
        <dv-border-box-12 class="strategy-card height-35 mt-10">
          <el-row class="card-title"><span>运行方案</span></el-row>
          <div class="opt-suggest">
            <el-timeline>
              <el-timeline-item v-for="(item, index) in suggest" :key="index" :timestamp="item.updateTime" color="#45AEF5" placement="top">
                <span v-html="suggestStyle(item.runAdvice)"></span>
              </el-timeline-item>
            </el-timeline>
          </div>
<!--          <PieChart pId="chartBarPor" pStyle="width: 100%; height: 100%;" :pOption="optionBarPor"></PieChart>-->
        </dv-border-box-12>
        <!-- 峰谷优化说明 -->
        <dv-border-box-12 class="strategy-card height-35 mt-10">
          <el-row class="card-title"><span>日前成本分析</span></el-row>
          <PieChart pId="chartRadarPor" pStyle="width: 100%; height: 100%;" :pOption="optionRadarPor"></PieChart>
        </dv-border-box-12>
      </el-col>
      <el-col class="height-100" :xs="7" :sm="7" :md="6" :lg="18" :xl="18">
        <!-- 同期数据 -->
        <dv-border-box-12 class="data-card height-50">
          <el-row class="card-title"><span>功率分析</span></el-row>
          <PieChart pId="chartCurvesPower" pStyle="width: 100%; height: 100%;" :pOption="optionCurvesPower"></PieChart>
        </dv-border-box-12>
        <!-- 多能数据 -->
        <dv-border-box-12 class="data-card height-50 mt-10">
          <el-row class="card-title"><span>减排分析</span></el-row>
          <PieChart pId="chartCurvesCarbon" pStyle="width: 100%; height: 100%;" :pOption="optionCurvesCarbon"></PieChart>
        </dv-border-box-12>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import DatePicker from '@/components/datePicker';
import PieChart from '@/views/detection/components/pieChart.vue';
import {nextDay, parseTime, suggestStyle, sumArr,} from '@/utils/cem';
import {colorPaletteOptimization, optionBar, optionCurves, optionRadar} from '@/api/carbon/option';
import Analyse from '@/api/carbon/analyse';

export default {
  components: {DatePicker, PieChart,},
  data() {
    return {
      dtStart: '2022-01-01', // 开始日期
      dtEnd: parseTime(nextDay(1, new Date()), '{y}-{m}-{d}'), // 结束日期
      dtStrategy: parseTime(new Date(), '{y}-{m}-{d}'), // 优化日期
      statusOptimize: 1, // 优化策略状态 1 历史可查询; 2 日前可优化; 3 日前可优化可应用
      optimizationStrategy: 1, // 优化策略 1 峰谷优化; 2 多能优化
      optimizationStrategyList: [
        {value: 1, label: '峰谷优化'},
        {value: 2, label: '多能优化'},
      ],
      dataFrom: 2, // 数据来源  1 典型数据; 2 历史数据
      dataFromList: [
        {value: 1, label: '典型数据'},
        {value: 2, label: '历史数据'},
      ],
      xAxis: [], // X轴坐标
      optionRadarPor: JSON.parse(JSON.stringify(optionRadar)), // 日成本分析
      dailyCostAnalysis: [
        {before: 0, desc: '总成本/', unit: '元', after: 0},
        {before: 0, desc: '峰/', unit: '元', after: 0},
        {before: 0, desc: '谷/', unit: '元', after: 0},
        {before: 0, desc: '平/', unit: '元', after: 0},
        {before: 0, desc: '碳排/', unit: 'kgCO₂', after: 0},
      ],
      optionBarPor: JSON.parse(JSON.stringify(optionBar)), // 月度成本分析
      suggest: [], // 运行建议
      optionCurvesPower: JSON.parse(JSON.stringify(optionCurves)), // 功率分析
      optionCurvesCarbon: JSON.parse(JSON.stringify(optionCurves)), // 减排分析
    }
  },
  created() {
  },
  mounted() {
    this.initXAxis()

    // 日成本分析
    // this.optionRadarPor.legend.data = ['优化前', '优化后']

    // 月度成本分析
    this.optionBarPor.grid = {top: '20%', right: '2%', bottom: '15%', left: '9%',}
    this.optionBarPor.yAxis[0].name = '元'

    // 功率分析
    this.optionCurvesPower.color = colorPaletteOptimization
    this.optionCurvesPower.grid = {top: '20%', right: '2%', bottom: '15%', left: '5%',}
    this.optionCurvesPower.xAxis[0].data = this.xAxis
    this.optionCurvesPower.xAxis[0].axisLabel.interval = 0
    this.optionCurvesPower.xAxis[0].boundaryGap = false
    // this.optionCurvesPower.legend[0].data = ['优化前功率', '优化后功率']
    this.optionCurvesPower.yAxis[0].name = 'kW'
    this.optionCurvesPower.yAxis[0].scale = true

    // 碳排分析
    this.optionCurvesCarbon.color = colorPaletteOptimization
    this.optionCurvesCarbon.grid = {top: '20%', right: '2%', bottom: '15%', left: '5%',}
    this.optionCurvesCarbon.xAxis[0].data = this.xAxis
    this.optionCurvesCarbon.xAxis[0].axisLabel.interval = 0
    this.optionCurvesCarbon.xAxis[0].boundaryGap = false
    // this.optionCurvesCarbon.legend[0].data = ['优化前碳排', '优化后碳排']
    this.optionCurvesCarbon.yAxis[0].name = 'kgCO₂'
    this.optionCurvesCarbon.yAxis[0].scale = true

    this.updateDateStrategy() // 更新优化日期
  },
  methods: {
    initXAxis: function () {
      // 初始化X轴
      this.xAxis = []
      for (let index = 0; index < 24; ++index) {
        let _pre = ''
        if (index <= 9) {
          _pre = '0'
        }

        this.xAxis.push(_pre + index + ':00')
      }
    },
    updateDateStrategy: function (date) {
      // 1. 更新优化日期
      if (date === undefined || date === null) {
        return
      }

      this.dtStrategy = date

      // 2. 根据日期判断按钮状态
      let _status = new Date(Date.parse(this.dtStrategy + ' 00:00:00')) > new Date(Date.parse(parseTime(new Date(), '{y}-{m}-{d}') + ' 00:00:00'))
      if (_status) {
        // 日前优化
        this.statusOptimize = 2
        return
      }

      // 3. 如果是查询状态，需要查询应用的优化策略
      this.statusOptimize = 1
      Analyse.getStrategyData({dateTime: this.dtStrategy}).then((res) => {
        if (res === undefined || res === null || res['code'] !== 0) {
          return
        }

        let _data = res['data']
        if (_data === undefined || _data === null || _data['strategy'] === undefined || _data['strategy'] === null) {
          this.$message('日期 ' + this.dtStrategy + ' 未应用优化策略！')
          return
        }

        this.optimizationStrategy = _data['strategy']
        this.updateData() // 更新数据
      })
    },
    updateOptimizeStrategy: function (val) {
      // 更新优化策略下拉选择设置
      if (this.statusOptimize === 3) {
        // 如果当前页面是日前可优化可应用，切换优化策略需要修改为日前可优化
        this.statusOptimize = 2
      }
    },
    updateData: function () {
      // 更新页面数据
      this.updateRadar() // 1. 更新日成本分析
      // this.updatePor() // 2. 更新月度成本分析
      this.updateSuggest() // 2. 更新优化建议
      this.updateResult() // 3. 更新优化结果数据
    },
    updateDailyCostAnalysis: function (ce) {
      // 1. 解析碳排数据
      let _beforeCe = 0, _afterCe = 0
      if (ce !== undefined && ce !== null) {
        for (const _ce of ce) {
          if (_ce['name'] === '优化前碳排') {
            _beforeCe = sumArr(_ce['value'])
          } else if (_ce['name'] === '优化后碳排') {
            _afterCe = sumArr(_ce['value'])

            if (this.optimizationStrategy === 2) {
              // 多能优化
              _afterCe -= Math.random() * 200 + 1000
            }
          }
        }
      }

      // 1. 获取数据
      Analyse.getMultiEnergyCost({optimizType: this.optimizationStrategy, createDate: this.dtStrategy}).then((res) => {
        if (res === undefined || res === null || res['code'] !== 0 || res['rows'] === undefined) {
          return
        }

        // 2. 获取优化前后数据
        let _beforeStepType = this.optimizationStrategy === 1 ? 4 : 1
        let _afterStepType = this.optimizationStrategy === 1 ? 5 : 2
        let _before = null // 优化前成本
        let _after = null // 优化后成本
        let _rows = res['rows']
        for (const _row of _rows) {
          let _stepType = _row['stepType']
          if (_stepType === _beforeStepType) {
            // 优化前
            _before = _row
          } else if (_stepType === _afterStepType) {
            // 优化后
            _after = _row
          }
        }

        if (_before === null || _after === null) {
          return
        }

        // 3. 设置页面
        this.dailyCostAnalysis[0].before = this.$numToFixed(_before['costTotle']) // 优化前总成本
        this.dailyCostAnalysis[0].after = this.$numToFixed(_after['costTotle']) // 优化后总成本

        this.dailyCostAnalysis[1].before = this.$numToFixed(_before['costPeak']) // 优化前峰成本
        this.dailyCostAnalysis[1].after = this.$numToFixed(_after['costPeak']) // 优化后峰成本

        this.dailyCostAnalysis[2].before = this.$numToFixed(_before['costValley']) // 优化前谷成本
        this.dailyCostAnalysis[2].after = this.$numToFixed(_after['costValley']) // 优化后谷成本

        this.dailyCostAnalysis[3].before = this.$numToFixed(_before['costNormal']) // 优化前平成本
        this.dailyCostAnalysis[3].after = this.$numToFixed(_after['costNormal']) // 优化后平成本

        this.dailyCostAnalysis[4].before = this.$numToFixed(_beforeCe) // 优化前碳排
        this.dailyCostAnalysis[4].after = this.$numToFixed(_afterCe) // 优化后碳排
      })
    },
    updateRadar: function () {
      // 更新日成本分析
      this.optionRadarPor.legend.data = []
      this.optionRadarPor.series[0].data = []
      Analyse.getMultiEnergyCost({optimizType: this.optimizationStrategy, createDate: this.dtStrategy}).then((res) => {
        if (res === undefined || res === null || res['code'] !== 0 || res['rows'] === undefined) {
          return
        }

        // 更新雷达图
        let _beforeStepType = this.optimizationStrategy === 1 ? 4 : 1
        let _afterStepType = this.optimizationStrategy === 1 ? 5 : 2
        let _before = null // 优化前成本
        let _after = null // 优化后成本
        let _rows = res['rows']
        for (const _row of _rows) {
          let _stepType = _row['stepType']
          if (_stepType === _beforeStepType) {
            // 优化前
            _before = _row
          } else if (_stepType === _afterStepType) {
            // 优化后
            _after = _row
          }
        }

        if (_before === null || _after === null) {
          return
        }

        let _rate = this.$numToFixed((_before['costTotle'] - _after['costTotle']) / _before['costTotle'] * 100)
        this.optionRadarPor.radar.indicator = [{text: '总成本'}, {text: '峰'}, {text: '谷'}, {text: '平'}, {text: '收益率'},]
        this.updateRadarHelper('优化前', colorPaletteOptimization[0], _before, 0)
        this.updateRadarHelper('优化后', colorPaletteOptimization[1], _after, _rate)
      })
    },
    updateRadarHelper: function (name, color, data, rate) {
      // 更新雷达图
      if (data === null) {
        return
      }

      this.optionRadarPor.legend.data.push(name)

      let _values = [this.$numToFixed(data['costTotle']), this.$numToFixed(data['costPeak']), this.$numToFixed(data['costValley']), this.$numToFixed(data['costNormal']), this.$numToFixed(rate),]
      let _data = {
        name: name,
        value: _values,
        itemStyle: {
          normal: {
            lineStyle: {
              color: color,
            },
            shadowColor: color,
            shadowBlur: 10,
          },
        },
        areaStyle: {
          normal: {
            // 单项区域填充样式
            color: {
              type: 'linear',
              x: 0, //右
              y: 0, //下
              x2: 1, //左
              y2: 1, //上
              colorStops: [
                {offset: 0, color: color},
                {offset: 0.5, color: 'rgba(0,0,0,0)'},
                {offset: 1, color: color}
              ],
              globalCoord: false
            },
            opacity: 1 // 区域透明度
          }
        }
      }

      this.optionRadarPor.series[0].data.push(_data)
    },
    updatePor: function () {
      // 更新月度成本分析
      this.optionBarPor.legend.data = []
      this.optionBarPor.series = []
      let _dtStart = parseTime(new Date(Date.parse(this.dtStrategy)), '{y}-{m}') + '-01'
      Analyse.getMultiEnergyHistoryCost(this.optimizationStrategy, _dtStart, this.dtStrategy).then((res) => {
        if (res === undefined || res === null || res['code'] !== 200) {
          return
        }

        let _data = res['data']
        if (_data === undefined || _data === null) {
          return
        }

        // 根据类型分组
        let series = []
        series.push({name: '优化前', data: _data['before'], color: colorPaletteOptimization[0]})
        series.push({name: '优化后', data: _data['after'], color: colorPaletteOptimization[1]})
        this.optionBarPor.legend.data = ['优化前', '优化后',]
        this.optionBarPor.xAxis[0].data = _data["xAxis"]
        this.optionBarPor.series = series.map(item => {
          return {
            name: item.name,
            type: 'bar',
            data: this.$dataToFixed(item.data),
            barWidth: 5,
            barGap: 0.5, // 柱间距离
            itemStyle: {
              show: true,
              color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {offset: 0, color: item.color,},
                {offset: 1, color: '#FFF',},
              ]),
              opacity: 0.8,
              borderRadius: [5, 5, 0, 0],
            },
          }
        })
      })
    },
    updateSuggest: function () {
      // 更新优化建议
      this.suggest = []
      Analyse.getSuggest({dataType: this.optimizationStrategy === 1 ? 'peakValleyOptimization' : 'multiEnergyOptimization', dayTime: this.dtStrategy}).then((res) => {
        if (res === undefined || res === null || res['code'] !== 200 || res['data'] === undefined) {
          return
        }

        let _runAdvice = res['data'][0]
        if (_runAdvice === undefined || _runAdvice['runAdvice'] === undefined) {
          return
        }

        _runAdvice = _runAdvice['runAdvice']
        let _suggest = _runAdvice.split('*')
        for (let _item of _suggest) {
          this.suggest.push({updateTime: _item.split('&')[0], runAdvice: _item.split('&')[1]})
        }
      })
    },
    suggestStyle: function (val) {
      // 告警、建议格式样式
      return suggestStyle(val)
    },
    updateResult: function () {
      // 更新优化结果数据曲线
      this.optionCurvesPower.legend[0].data = []
      this.optionCurvesPower.series = []
      this.optionCurvesCarbon.legend[0].data = []
      this.optionCurvesCarbon.series = []
      if (this.optimizationStrategy === 1) {
        // 峰谷优化
        Analyse.getOptimizePeakValley({date: this.dtStrategy}).then((res) => {
          if (res === undefined || res === null || res['code'] !== 200 || res['data'] === undefined) {
            return
          }

          let _data = res['data']
          let _power = _data['power']
          let _ce = _data['ce']
          this.dealRealData('实际有功', '优化后有功', _power)
          this.dealRealData('实际碳排', '优化后碳排', _ce)
          this.updateResultHelper(_power, this.optionCurvesPower)
          this.updateResultHelper(_ce, this.optionCurvesCarbon)
          // this.updateDailyCostAnalysis(_ce) // 更新日成本分析
        })
      } else if (this.optimizationStrategy === 2) {
        // 多能优化
        Analyse.getOptimizeMulti({date: this.dtStrategy}).then((res) => {
          if (res === undefined || res === null || res['code'] !== 200 || res['data'] === undefined) {
            return
          }

          let _data = res['data']
          let _power = _data['power']
          let _ce = _data['ce']
          this.dealRealData('实际有功', '优化后有功', _power)
          this.dealRealData('实际碳排', '优化后碳排', _ce)
          this.updateResultHelper(_power, this.optionCurvesPower)
          this.updateResultHelper(_ce, this.optionCurvesCarbon)
          // this.updateDailyCostAnalysis(_ce) // 更新日成本分析
        })
      }
    },
    dealRealData: function (keyReal, keyOptimized, data) {
      // 特殊处理 实际按照优化后进行波动显示
      // 1. 查找实际数据及优化后数据
      let _real = null, _optimized = null
      for (const _item of data) {
        if (_item['name'] === keyReal) {
          _real = _item
        } else if (_item['name'] === keyOptimized) {
          _optimized = _item
        }
      }

      // 2. 模拟数据
      if (_real === null || _optimized === null) {
        return
      }

      for (let _index = 0; _index < _real['value'].length; ++_index) {
        let _val = _real['value'][_index]
        if (_val === undefined || _val === null) {
          continue
        }

        let _offset = Math.random() * (30 * (_index % 2)) + 60
        if ((_index % 2) === 0) {
          _real['value'][_index] = _optimized['value'][_index] + _offset
        } else {
          _real['value'][_index] = _optimized['value'][_index] - _offset
        }
      }
    },
    updateResultHelper: function (series, option) {
      // 更新优化结果数据曲线辅助方法
      option.series = series.map(item => {
        let _name = item['name']
        if (this.statusOptimize !== 1 && _name.indexOf('实际') >= 0) {
          return
        }

        option.legend[0].data.push(_name)

        return {
          name: _name,
          type: 'line',
          smooth: true,
          smoothMonotone: 'x',
          cursor: 'pointer',
          showSymbol: false,
          data: this.$dataToFixed(item['value']),
          lineStyle: {
            shadowColor: 'rgba(126,199,255,1)',
            shadowBlur: 10,
            width: 2,
          },
        }
      })
    },
    optimize() {
      // 查询优化结果，存在提示
      let _resType = 1, _tip = '峰谷优化'
      if (this.optimizationStrategy === 2) {
        _resType = 5
        _tip = '多能优化'
      }

      Analyse.getMultiEnergyPower('14016031', _resType, this.dtStrategy).then((res) => {
        if (res === undefined || res === null || res['code'] !== 0) {
          return
        }

        let _exist = false
        let _rows = res['rows']
        if (_rows !== undefined && _rows !== null && _rows.length > 0) {
          _exist = true
        }

        // 日期已优化过进行提示
        if (_exist) {
          this.$confirm('日期 ' + this.dtStrategy + ' 已存在' + _tip + '结果，继续将覆盖优化结果！', '提示', {confirmButtonText: '继续', cancelButtonText: '取消', type: 'warning'}).then(() => {
            this.optimizeHelper()
          })
        } else {
          this.optimizeHelper()
        }
      })
    },
    optimizeHelper: function () {
      // 优化辅助方法
      // 1. 根据选择的优化类型调用接口
      this.statusOptimize = 3
      if (this.optimizationStrategy === 1) {
        // 峰谷优化
        Analyse.peakValleyRegulation({plan_day: this.dtStrategy}).then((res) => {
          this.electCalData()
        })
      } else if (this.optimizationStrategy === 2) {
        // 多能优化
        Analyse.multiEnergyRegulation({plan_day: this.dtStrategy}).then((res) => {
          this.updateData()
        })
      }

      // 2. 创建运行建议
      this.saveSuggest(this.optimizationStrategy, this.dtStrategy)
    },
    saveSuggest: function (optimizationStrategy, date) {
      // 1. 创建优化建议
      let _dateType = 'peakValleyOptimization', _runAdvice = '', _suggest = []
      if (optimizationStrategy === 1) {
        // 峰谷优化
        _suggest.push({updateTime: date + ' 04:30:00', runAdvice: '调节{1#}水泵为高速运转方式；</br>启动{1#、2#}水泵，并设置为高速运转方式；</br>调节{1#、2#}空调机组为高速运行；</br>启动{3#、4#}空调机组，并设置为高速运行'})
        _suggest.push({updateTime: date + ' 07:00:00', runAdvice: '调节{1#}水泵为中速运转方式；</br>停止{1#、2#}水泵；</br>调节{1# 2#}空调机组为中速运行；</br>停止{3#、4#}空调机组'})
        _suggest.push({updateTime: date + ' 09:30:00', runAdvice: '调节{1#}水泵为低速运转方式；</br>调节{1#、2#}空调机组为低速运行'})
        _suggest.push({updateTime: date + ' 12:30:00', runAdvice: '调节{1#}水泵为中速运转方式；</br>调节{1#、2#}空调机组为中速运行'})
        _suggest.push({updateTime: date + ' 18:30:00', runAdvice: '调节{1#}水泵为低速运转方式；</br>调节{1#、2#}空调机组为低速运行'})

        let _index = Math.floor(Math.random() * 2) // 0 or 1
        _runAdvice = _suggest[_index]['updateTime'] + '&' + _suggest[_index]['runAdvice']

        _index += 1
        _runAdvice += '*' + _suggest[_index]['updateTime'] + '&' + _suggest[_index]['runAdvice']

        _index += Math.floor(Math.random() * 2) + 1
        _runAdvice += '*' + _suggest[_index]['updateTime'] + '&' + _suggest[_index]['runAdvice']
      } else if (optimizationStrategy === 2) {
        // 多能优化
        _dateType = 'multiEnergyOptimization'
        _suggest.push({updateTime: date + ' 05:30:00', runAdvice: '调节{1#}水泵为高速运转方式；</br>启动{1#、2#}水泵，并设置为中速运转方式；</br>调节{1#、2#}空调机组为高速运行；</br>启动{3#、4#}空调机组，并设置为中速运行'})
        _suggest.push({updateTime: date + ' 07:30:00', runAdvice: '调节{1#}水泵为中速运转方式；</br>停止{1#、2#}水泵；</br>调节{1# 2#}空调机组为低速运行；</br>停止{3#、4#}空调机组'})
        _suggest.push({updateTime: date + ' 09:30:00', runAdvice: '调节{1~5#}自用充电桩为供电模式；</br>调节{6~10#}公用充电桩为充电模式'})
        _suggest.push({updateTime: date + ' 10:00:00', runAdvice: '调节{1#}水泵为低速运转方式；</br>调节{1#、2#}空调机组为低速运行'})
        _suggest.push({updateTime: date + ' 11:30:00', runAdvice: '调节{6~10#}自用充电桩为供电模式；</br>调节{1~5#}公用充电桩为充电模式'})
        _suggest.push({updateTime: date + ' 17:00:00', runAdvice: '调节{1#}水泵为低速运转方式；</br>调节{1#、2#}空调机组为低速运行'})
        _suggest.push({updateTime: date + ' 18:30:00', runAdvice: '调节{6~10#}自用充电桩为充电模式；</br>调节{1~5#}公用充电桩为充电模式'})
        _suggest.push({updateTime: date + ' 20:30:00', runAdvice: '调节{1~5#}自用充电桩为充电模式；</br>调节{6~10#}公用充电桩为充电模式'})

        let _index = Math.floor(Math.random() * 3) // 0 1 2
        _runAdvice = _suggest[_index]['updateTime'] + '&' + _suggest[_index]['runAdvice']

        _index += Math.floor(Math.random() * 2) + 1 // 1 2
        _runAdvice += '*' + _suggest[_index]['updateTime'] + '&' + _suggest[_index]['runAdvice']

        _index += Math.floor(Math.random() * 3) + 1 // 1 2 3
        _runAdvice += '*' + _suggest[_index]['updateTime'] + '&' + _suggest[_index]['runAdvice']
      }

      // 2. 随机选择三个进行保存
      Analyse.saveSuggest({dataType: _dateType, recordDate: date, runAdvice: _runAdvice})
    },
    electCalData: function () {
      // 峰谷优化完成后生成功率曲线、碳排曲线、成本等信息
      Analyse.electCalData({time: this.dtStrategy}).then((res) => {
        if (res === undefined || res === null || res['code'] !== 200) {
          return
        }

        this.updateData()
      })
    },
    optimizeExec: function () {
      // 1. 查询当前优化策略
      Analyse.getStrategyData({dateTime: this.dtStrategy}).then((res) => {
        if (res === undefined || res === null || res['code'] !== 0) {
          return
        }

        let _msg = '日期 ' + this.dtStrategy
        let _strategy = null
        if (res['data'] !== undefined && res['data'] !== null) {
          _strategy = res['data']['strategy']
        }

        if (_strategy !== undefined && _strategy !== null) {
          // 存在应用方案
          _msg += ' 已应用' + ((_strategy === 1) ? '峰谷优化' : '多能优化') + '方案，继续该方案将被覆盖，请确认操作！'
        } else {
          // 不存在应用方案
          _msg += ' ' + ((this.optimizationStrategy === 1) ? '峰谷优化' : '多能优化') + '方案将被应用，请确认操作！'
        }

        // 2. 更新优化策略
        this.$confirm(_msg, '提示', {confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning'}).then(() => {
          Analyse.updateStrategy({dateTime: this.dtStrategy, strategy: this.optimizationStrategy}).then((res) => {
            if (res === undefined || res === null || res['code'] !== 0) {
              this.$message({message: '应用失败！', type: 'error'})
              return
            }

            this.$message({message: '应用成功！', type: 'success'})
          })
        })
      })
    },
    simStrategy: function (dtStart, dtEnd) {
      // 模拟数据
      let _dtStart = dtStart
      // 峰谷优化
      Analyse.peakValleyRegulation({plan_day: _dtStart}).then((res) => {
        // 创建运行建议
        this.saveSuggest(1, _dtStart)

        // 峰谷优化完成后生成功率曲线、碳排曲线、成本等信息
        Analyse.electCalData({time: _dtStart}).then((res) => {
          // 多能优化
          Analyse.multiEnergyRegulation({plan_day: _dtStart}).then((res) => {
            // 创建运行建议
            this.saveSuggest(2, _dtStart)

            _dtStart = parseTime(nextDay(1, new Date(Date.parse(_dtStart))), '{y}-{m}-{d}')
            if (Date.parse(_dtStart) > Date.parse(dtEnd)) {
              return
            }

            this.simStrategy(_dtStart, dtEnd)
          })
        })
      })
    },
  }
}
</script>

<style lang="less" scoped>
.container {
  height: 100%;

  .card-title {
    height: 16px;
    margin-left: 10px;
    line-height: 16px;
    padding-left: 10px;
    border-left: 4px solid #308EC1;
  }

  .width-40 {
    width: 40%;

  }

  .height-25 {
    height: 25%;
  }

  .height-30 {
    height: 30%;
  }

  .height-35 {
    height: calc((70% - 20px) / 2);
  }

  .height-50 {
    height: calc((100% - 10px) / 2);
  }

  .height-100 {
    height: 100%;
  }

  .height-28p {
    height: 28px;
  }

  .strategy-card {
    padding: 15px;

    .opt-suggest {
      margin: 10px auto;
      height: calc(100% - 30px);
      overflow-y: scroll;

      /deep/ .el-timeline-item__content {
        color: #c0d5eb;
        line-height: 20px;
      }

      /deep/ .el-timeline-item__timestamp.is-top {
        margin-bottom: 5px;
        padding-top: 5px;
      }

      /deep/ .el-timeline-item__timestamp {
        color: #c0d5eb;
      }

      /deep/ .el-timeline-item__wrapper {
        top: -5px;
      }

      /deep/ .el-table tr {
        background-color: transparent;
      }
    }

    /deep/ .el-input__inner {
      height: 28px;
      color: #FFF;
      border: 1px solid #0095FF;
      background-color: rgba(222, 241, 253, 0.1);
    }

    /deep/ .el-input__icon {
      line-height: 28px;
    }

    .select-disabled {
      /deep/ .el-input__inner {
        border: 1px solid #C4C4C4 !important;
      }

      /deep/ .el-input__suffix {
        display: none !important;
      }
    }

    .parameterList {
      height: 20px;
      width: 100%;
      display: grid;
      grid-template-columns:repeat(3, 1fr);
      grid-template-rows: repeat(1, 1fr);
      //  background: #0095FF;
      text-align: center;
      line-height: 50px;
    }
  }

  .data-card {
    padding: 15px;
  }
}
</style>
