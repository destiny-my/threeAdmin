<template>
  <!-- 力调分析 -->
  <div class="container">
    <div class="box-left">
      <dv-border-box-12 class="card-box">
        <div class="left-card">
          <div class="card-title">运行建议</div>
          <div class="block">
            <el-timeline>
              <el-timeline-item v-for="(item, index) in suggest" :key="index" :timestamp="item.updateTime" color="#45AEF5" placement="top">
                <span v-html="suggestStyle(item.runAdvice)"></span>
              </el-timeline-item>
            </el-timeline>
          </div>
          <div class="title-fifth explain">
            <span>说明: 标准功率因数为0.9。功率因数奖、罚规定：每低于标准0.01时，从电费总额罚款0.5%，以此递增，低于0.7每一级提高到1%，低于0.65每级提高到2%；每高于标准0.01时，从电费总额奖0.15%，以此类推，以0.75%封顶。</span>
          </div>
        </div>
      </dv-border-box-12>
      <dv-border-box-12 class="card-box1">
        <div class="left-card">
          <div class="card-title">功率因数排名</div>
          <div class="tableSource">
            <Regions2 class="rank-card-content" :ratio="100" :progressData="tableData" :titleData="headerData"/>
          </div>
        </div>
      </dv-border-box-12>
    </div>
    <div class="box-right">
      <dv-border-box-12 class="card-box">
        <div class="right-card">
          <div class="card-title">楼宇功率因数分析</div>
          <PieChart pId="chartCurvesBuilding" pStyle="width: 100%; height: 100%;" :pOption="optionCurvesBuilding"></PieChart>
        </div>
      </dv-border-box-12>
      <dv-border-box-12 class="card-box1">
        <div class="right-card">
          <div style="display: flex; justify-content: space-between">
            <span class="card-title">设备功率因数分析</span>
          </div>
          <div style="display: flex; padding: 10px 0">
            <div class="demo-input-suffix title-fifth">
              配电室：
              <el-select v-model="distributionRoom" placeholder="请选择" size="mini" @change="updateTransformer">
                <el-option v-for="item in optionDistributionRoom" :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue"></el-option>
              </el-select>
            </div>
            <div class="demo-input-suffix title-fifth">
              变压器：
              <el-select v-model="transformerId" placeholder="请选择" size="mini">
                <el-option label="全部" value="-1"></el-option>
                <el-option v-for="item in optionsTransformer" :key="item.id" :label="item.deviceName" :value="item.id"></el-option>
              </el-select>
            </div>
            <div class="demo-input-suffix title-fifth">
              开始时间：
              <el-date-picker v-model="dtStart" type="date" size="mini" placeholder="选择日期"></el-date-picker>
            </div>
            <div class="demo-input-suffix title-fourth">
              结束时间：
              <el-date-picker v-model="dtEnd" type="date" size="mini" placeholder="选择日期"></el-date-picker>
            </div>
            <div>
              <el-button class="height-28p ml-20" type="primary" size="mini" :loading="false" @click="updateCurvesDev">查询</el-button>
              <el-button class="height-28p ml-20" type="primary" size="mini" :loading="false" @click="resetForm">重置</el-button>
            </div>
          </div>
          <PieChart pId="chartCurvesDev" pStyle="width: 100%; height: calc(100% - 30px);" :pOption="optionCurvesDev"></PieChart>
        </div>
      </dv-border-box-12>
    </div>
  </div>
</template>
<script>
import PieChart from "./components/pieChart.vue";
import Regions2 from "./components/regions2.vue";
import Analyse from "@/api/carbon/analyse";
import {parseTime,suggestStyle} from "@/utils/cem";
import {colorBaseLine, colorMeasurement, optionCurves,} from "@/api/carbon/option";

export default {
  components: {PieChart, Regions2,},
  data() {
    return {
      suggest: [], // 运行建议
      headerData: [
        {spanData: 6, name: '名称'},
        {spanData: 12, name: '功率因数'},
        {spanData: 6, name: '奖惩因数'},
      ],
      tableData: [], // 功率因数排名
      optionCurvesBuilding: JSON.parse(JSON.stringify(optionCurves)), // 楼宇功率因数分析
      optionCurvesDev: JSON.parse(JSON.stringify(optionCurves)), // 设备功率因数分析
      optionDistributionRoom: [], // 配电室下拉
      distributionRoom: '',
      optionsTransformer: [], // 变压器下拉
      transformerId: '-1',
      dtStart: '', // 开始日期
      dtEnd: '', // 结束日期
    };
  },
  created() {
  },
  mounted() {
    // 设置楼宇功率因数分析曲线样式
    this.optionCurvesBuilding.grid = {top: '16%', right: '5%', bottom: '12%', left: '5%',}
    this.optionCurvesBuilding.legend[0].top = '0'
    this.optionCurvesBuilding.legend[0].right = '0'
    this.optionCurvesBuilding.xAxis[0].boundaryGap = false
    this.optionCurvesBuilding.xAxis[0].axisLabel.interval = 0
    this.optionCurvesBuilding.yAxis.push(JSON.parse(JSON.stringify(this.optionCurvesBuilding.yAxis[0])))
    // this.optionCurvesBuilding.yAxis[0].interval = 0.04
    this.optionCurvesBuilding.yAxis[0].scale = true
    this.optionCurvesBuilding.yAxis[0].max = 1
    this.optionCurvesBuilding.yAxis[0].name = '功率因数'
    this.optionCurvesBuilding.yAxis[1].scale = true
    this.optionCurvesBuilding.yAxis[1].name = '奖惩因数'

    // 设置设备功率因数分析曲线样式
    this.optionCurvesDev.grid = {top: '20%', right: '5%', bottom: '20%', left: '5%',}
    this.optionCurvesDev.legend[0].top = '0'
    this.optionCurvesDev.legend[0].right = '0'
    this.optionCurvesDev.xAxis[0].boundaryGap = false
    this.optionCurvesDev.yAxis.push(JSON.parse(JSON.stringify(this.optionCurvesDev.yAxis[0])))
    // this.optionCurvesDev.yAxis[0].interval = 0.04
    this.optionCurvesDev.yAxis[0].scale = true
    this.optionCurvesDev.yAxis[0].max = 1
    this.optionCurvesDev.yAxis[0].name = '功率因数'
    this.optionCurvesDev.yAxis[1].scale = true
    this.optionCurvesDev.yAxis[1].name = '奖惩因数'

    this.resetForm() // 初始化设备功率因数分析表单
    this.updateSuggest() // 更新运行建议
    this.updateCapacityRank() // 更新功率因数排名
    this.updateCurvesBuilding() // 更新楼宇功率因数分析
  },
  methods: {
    updateSuggest: function () {
      // 更新运行建议
      Analyse.optSuggest({dataType: 'forceAnalysis'}).then((res) => {
        if (res === undefined || res === null || res['code'] !== 200 || res['data'] === undefined) {
          return
        }

        this.suggest = res['data']
      });
    },
    suggestStyle: function (val) {
      // 告警、建议格式样式
      return suggestStyle(val)
    },
    updateCapacityRank: function () {
      // 更新功率因数排名
      Analyse.capacityRank({dataType: 'powerFactor', recordDate: parseTime(new Date(), '{y}-{m}-{d}')}).then((res) => {
        if (res === undefined || res === null || res['code'] !== 200 || res['data'] === undefined) {
          return
        }

        let _data = res['data']
        this.tableData = _data.map(item => {
          let _pVal = parseFloat(this.$numToFixed(item['proportionVal'])) * 100.0
          return {name: item['deviceName'], pVal: _pVal, val: this.$numToFixed(item['val'] * 100) + '%'}
        })
      });
    },
    updateCurvesBuilding: function () {
      // 更新楼宇功率因数分析
      this.optionCurvesBuilding.series = []
      Analyse.capacityCurvesBuilding({dataType: 'powerFactor', belongId: this.$buildingNo}).then((res) => {
        if (res === undefined || res === null || res['code'] !== 200 || res['data'] === undefined) {
          return
        }

        this.updateCurves(res, this.optionCurvesBuilding)
      });
    },
    updateCurvesDev: function () {
      // 更新设备功率因数分析
      // 1. 组织参数
      let _query = {dataType: 'powerFactor', distributionRoom: this.distributionRoom, startRecordDate: this.dtStart, endRecordDate: this.dtEnd}
      if (this.transformerId !== undefined && this.transformerId !== null && this.transformerId !== '-1') {
        _query.deviceId = this.transformerId
      }

      // 2. 请求数据
      this.optionCurvesDev.series = []
      Analyse.capacityCurvesDev(_query).then((res) => {
        if (res === undefined || res === null || res['code'] !== 200 || res['data'] === undefined) {
          return
        }

        this.updateCurves(res, this.optionCurvesDev)
      });
    },
    updateCurves: function (res, option) {
      // 更新曲线公共方法
      let _names = []
      let _data = res['data']
      let _yAxis = _data['yAxis']
      let _colors = []
      let _min = []
      let _max = []
      option.xAxis[0].data = _data['xAxis']
      for (let index = 0; index < _yAxis.length; ++index) {
        let _value = _yAxis[index]
        if (_value === undefined || _value === null) {
          continue
        }

        _min.push(Math.min.apply(null, _value.value))
        _max.push(Math.max.apply(null, _value.value))

        let _indexYAxis = 0
        let _name = _value.name
        if (_name === '力调标准') {
          _name = '奖惩因数'
          _indexYAxis = 1
          _colors.push(colorMeasurement[1])
        } else {
          _colors.push(colorMeasurement[0])
        }

        _names.push(_name)
        let _ser = {
          name: _name,
          type: 'line',
          // smooth: true,
          showSymbol: false,
          yAxisIndex: _indexYAxis,
          lineStyle: {
            color: _colors[index], // 线条颜色
            // shadowColor: 'rgba(126,199,255,1)',
            // shadowBlur: 8,
          },
          data: _value.value,
        }

        option.series.push(_ser)
      }

      let _minV = this.$numToFixed(_min[0] - 0.05)
      let _maxV = this.$numToFixed(_max[0] + 0.05)

      option.color = _colors
      option.legend[0].data = ['功率因数', '奖惩因数']
      // option.yAxis[0].min = _minV < 0 ? 0 : _minV
      // option.yAxis[0].max = _maxV > 1 ? 1 : _maxV
      // option.yAxis[1].min = this.$numToFixed(_min[1] - 0.002, 4)
      // option.yAxis[1].max = this.$numToFixed(_max[1] + 0.003, 4)

      // 安全基线
      option.series[0]['markLine'] = {
        silent: true,
        symbol: 'none',
        data: [
          {name: '力调标准', yAxis: 0.9, lineStyle: {color: colorBaseLine[0], width: 3}, label: {formatter: '力调标准', color: colorBaseLine[0]},},
        ],
      }
    },
    updateDistributionRoom: function () {
      // 配电室下拉选择
      Analyse.selectDictDataByDictType({dictType: 'lt_transformer_room'}).then((res) => {
        if (res === undefined || res === null || res['code'] !== 0 || res['data'] === undefined) {
          return
        }

        this.optionDistributionRoom = res.data
        if (res.data.length !== 0) {
          this.distributionRoom = res.data[0].dictValue
          this.distributionRoom = res.data[0].dictValue
        } else {
          this.distributionRoom = ''
        }

        this.updateTransformer(this.distributionRoom) // 更新变压器下拉
      })
    },
    updateTransformer: function (val) {
      // 更新变压器下拉
      this.transformerId = '-1'
      Analyse.transformerByRoom({distributionRoom: val}).then((res) => {
        if (res === undefined || res === null || res['code'] !== 200 || res['data'] === undefined) {
          return
        }

        this.optionsTransformer = res.data

        this.updateCurvesDev() // 更新设备功率因数分析
      })
    },
    resetForm: function () {
      // 初始化设备功率因数分析表单
      this.dtStart = new Date()
      this.dtStart.setMonth(this.dtStart.getMonth() - 1)
      this.dtEnd = new Date()
      this.updateDistributionRoom()
    },
  },
};
</script>
<style lang="less" scoped>
.card-title {
  height: 16px;
  margin-left: 10px;
  color: #fff;
  line-height: 16px;
  padding-left: 10px;
  border-left: 4px solid #308ec1;
}

.container {
  display: flex;
  width: 100%;
  height: 100%;
  color: #fff;

  .box-left {
    width: 30%;

    .card-box {
      height: 50%;
      padding: 15px 20px;
      margin: 0;
    }

    .card-box1 {
      margin-top: 12px;
      height: calc(50% - 12px);
      padding: 15px 20px;
    }

    .left-card {
      height: 100%;

      .tableSource {
        margin-top: 10px;
      }
    }

    .block {
      margin: 10px auto;
      height: calc(100% - 95px);
      overflow-y: scroll;
      // padding-top: 13px;

      /deep/ .el-timeline-item__content {
        color: #c0d5eb;
        line-height: 20px;
      }
      /deep/.el-timeline-item__timestamp.is-top {
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
  }

  .box-right {
    margin-left: 12px;
    width: calc(70% - 12px);

    .card-box {
      height: 50%;
      padding: 15px 20px;
      color: #fff;
    }

    .card-box1 {
      margin-top: 12px;
      // height: 50%;
      height: calc(50% - 12px);
      padding: 16px;
    }

    .right-card {
      height: 100%;

      .demo-input-suffix {
        display: flex;
        align-items: center;
        margin-left: 10px;
      }

      .height-28p {
        height: 28px;
      }
    }
  }
}

/deep/ .el-date-editor.el-input,
/deep/ .el-date-editor.el-input__inner {
  width: 130px;
}

/deep/ .el-input__inner {
  background-color: rgba(222, 241, 253, 0.1);
  border: 1px solid #0095ff;
  color: #fff;
}

/deep/ .el-input__prefix,
.el-input__suffix {
  color: #0095ff;
}
</style>
