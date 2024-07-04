<template xmlns="http://www.w3.org/1999/html">
  <!-- 用气分析 -->
  <div class="container">
    <el-row class="running" :gutter="12">
      <!-- 碳排警告 -->
      <el-col :xs="7" :sm="7" :md="6" :lg="6" :xl="6">
        <dv-border-box-12 class="running-card-box">
          <el-row class="card-title">
            <span>碳排告警</span>
            <el-tooltip class="item" effect="dark" placement="top">
              <div slot="content" class="config">
                <span class="title-fourth">碳排告警</span>
                <div :style="{ display: 'block' }" class="title-fourth" v-for="(item, index) in annotation" :key="index">
                  <span class="annotation_title" style="display: inline-block;width: 100px;line-height: 24px;">{{ item.remark }}</span>
                  <span class="annotation_num">{{ item.baseRatio }}</span>
                </div>
              </div>
              <img class="image" src="../../assets/image/icon-question.png" alt=""/>
            </el-tooltip>
          </el-row>
          <el-row class="card-box-warning">
            <el-col class="text-center" :span="4" v-for="(item, index) in warningCount" :key="index">
              <div class="card-box-warning-img">
                <img :src="item.img" alt=""/>
              </div>
              <span :class="'title-second ' + item.style">{{ item.count }}</span>
              <br/>
              <span :class="'title-title-fifth ' + item.style">{{ item.level }}</span>
            </el-col>
          </el-row>
          <div class="warning-box">
            <vue-seamless-scroll :data="warningInfo" class="seamless-warp" :class-option="classOption">
              <el-row class="mt-5" :gutter="0" v-for="(item, index) in warningInfo" :key="index">
                <el-col class="mr-15" :span="2"><span :class="'title-fifth bg-carbon-warning ' + item.style">{{ item.alarmType }}</span></el-col>
                <el-col :span="12"><span v-html="suggestStyle(item.alarmInfo)" class="title-fifth opacity-75"></span></el-col>
                <el-col :span="9"><span class="title-fifth opacity-75">{{ item.createTime }}</span></el-col>
              </el-row>
            </vue-seamless-scroll>
          </div>
        </dv-border-box-12>
      </el-col>
      <!-- 运行建议 -->
      <el-col :xs="7" :sm="7" :md="6" :lg="6" :xl="6">
        <dv-border-box-12 class="running-card-box">
          <el-row class="card-title"><span>运行建议</span></el-row>
          <el-row class="card-box-suggest">
            <div class="block">
              <el-timeline>
                <el-timeline-item placement="top" v-for="(item, index) in warningSuggest" :key="index" :timestamp="item.updateTime" color="#45AEF5">
                  <span v-html="suggestStyle(item.runAdvice)"></span>
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-row>
        </dv-border-box-12>
      </el-col>
      <!-- 各用气类型占比 -->
      <el-col :xs="10" :sm="10" :md="12" :lg="12" :xl="12">
        <dv-border-box-12 class="running-card-box">
          <el-row :gutter="0" style="height:100%;">
            <div class="card-box-power">
              <div class="card-title"><span>各用气类型占比</span></div>
              <DatePicker ref="dataValue" :pValue="dateRatio" @changedDate="updateRatio"></DatePicker>
            </div>
            <el-row :gutter="0" style="height:80%;">
              <el-col :span="11">
                <PieChart pId="chartRatio" pStyle="width: 100%; height: 200px;" :pOption="optionPieRatio"></PieChart>
              </el-col>
              <el-col :span="13">
                <TableSource :tableData="tableRatio" :header="headerRatio" :pStyle="showPage" :total="page.total" style="margin-top: 12.5%;"></TableSource>
              </el-col>
            </el-row>
          </el-row>
        </dv-border-box-12>
      </el-col>
    </el-row>
    <!-- 历史数据 -->
    <el-row class="history">
      <dv-border-box-12 class="history-card-box">
        <el-row class="card-title"><span>历史数据</span></el-row>
        <!-- 筛选条件 -->
        <el-row class="pt-10 pl-10 title-fifth" :gutter="15">
          <el-col class="history-card-box-filter" :xs="4" :sm="4" :md="4" :lg="4" :xl="4">
            <span class="opacity-75">划分方式：</span>
            <el-radio-group v-model="radioDivisionMode" @change="updateNames">
              <el-radio label="area">按区域</el-radio>
              <el-radio label='gas'>按用气类型</el-radio>
            </el-radio-group>
          </el-col>
          <el-col class="history-card-box-filter" :xs="4" :sm="4" :md="4" :lg="4" :xl="4">
            <span class="opacity-75">数据类型：</span>
            <el-radio-group v-model="radioData">
              <el-radio label="1">用气量</el-radio>
              <el-radio label="2">碳排放量</el-radio>
            </el-radio-group>
          </el-col>
          <el-col class="history-card-box-filter" :xs="7" :sm="7" :md="7" :lg="7" :xl="7">
            <span class="opacity-75">周期类型：</span>
            <el-radio-group v-model="radioCycle">
              <el-radio label="day">日</el-radio>
              <el-radio label="week">周</el-radio>
              <el-radio label="month">月</el-radio>
            </el-radio-group>
            <DatePicker class="ml-15" :pValue="dateCycle" @changedDate="updateDateCycle"></DatePicker>
          </el-col>
          <el-col :xs="2" :sm="2" :md="2" :lg="4" :xl="4">
            <el-button type="primary" size="mini" :loading="false" @click="updateCurves()">查询</el-button>
            <el-button type="primary" size="mini" :loading="false" round @click="resetForm()">重置</el-button>
          </el-col>
        </el-row>
        <el-row class="pl-10 title-fifth history-checkbox" :gutter="0">
          <el-col :span="1"><span class="opacity-75">选择对象：</span></el-col>
          <el-col :span="1">
            <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
          </el-col>
          <el-col :span="22">
            <el-checkbox-group v-model="checkedNames" @change="handleCheckedCitiesChange">
              <el-checkbox v-for="(item, index) in names" :key="index" :label="item.dictValue">{{ item.dictLable }}</el-checkbox>
            </el-checkbox-group>
          </el-col>
        </el-row>
        <el-row :gutter="0" class="history-data mt-5">
          <PieChart pId="chartCurvesHistory" pStyle="width: 100%; height: 100%;" :pOption="optionCurvesHistory"></PieChart>
          <!--          <TableSource :tableData="tableHistory.tableData" :header="tableHistory.fields" :pStyle="showPage" :total="page.total" :show="true" style="height: 19%"></TableSource>-->
        </el-row>
      </dv-border-box-12>
    </el-row>
  </div>
</template>
<script>
import DatePicker from "@/components/datePicker.vue";
import PieChart from "./components/pieChart.vue";
import TableSource from "./components/table.vue";
import ChartCurves from "./components/chartCurves";
import Monitor from "@/api/carbon/monitor";
import Analyse from "@/api/carbon/analyse";
import {parseTime, suggestStyle} from "@/utils/cem";
import {colorGasProp, optionCurves, optionPie,} from "@/api/carbon/option";

export default {
  components: {DatePicker, PieChart, ChartCurves, TableSource,},
  data() {
    return {
      annotation: [],
      warningCount: [
        {level: '异常', count: 0, style: 'color-urgent', img: require('../../assets/image/urgent.png')},
        {level: '告警', count: 0, style: 'color-important', img: require('../../assets/image/important.png')},
        {level: '预警', count: 0, style: 'color-tips', img: require('../../assets/image/tips.png')},
      ],
      warningInfo: [],
      warningSuggest: [],
      dateRatio: parseTime(new Date(), '{y}-{m}-{d}'), // 用气类型占比日期选择
      optionPieRatio: JSON.parse(JSON.stringify(optionPie)),
      headerRatio: [
        {id: "name", name: "名称"},
        {id: "consumption", name: "耗气(m³)", width: "120"},
        {id: "ceValue", name: "碳排(kgCO₂)", width: "140"},
        {id: "proportionVal", name: "占比(%)"},
      ],
      tableRatio: [],
      showPage: '0', // 是否显示分页:'1'显示；'0'不显示
      radioDivisionMode: 'gas', // 历史数据-划分方式
      radioData: '2', // 历史数据-数据类型
      radioCycle: 'day', // 历史数据-周期类型
      dateCycle: '', // 历史数据日期选择
      names: [], // 历史数据-选择对象
      checkedNames: [], // 历史数据-选中的对象列表
      checkAll: true,
      isIndeterminate: false,
      optionCurvesHistory: JSON.parse(JSON.stringify(optionCurves)),
      tableHistory: {fields: [], tableData: []},
      page: {
        total: null,
      },
    };
  },
  created() {
  },
  computed: {
    // 消息轮播
    classOption() {
      return {
        step: 0.4, // 数值越大速度滚动越快
        limitMoveNum: 2, // 开始无缝滚动的数据量 this.dataList.length
        hoverStop: true, // 是否开启鼠标悬停stop
        direction: 1, // 0向下 1向上 2向左 3向右
        openWatch: true, // 开启数据实时监控刷新dom
        singleHeight: 0, // 单步运动停止的高度(默认值0是无缝不停止的滚动) direction => 0/1
        singleWidth: 0, // 单步运动停止的宽度(默认值0是无缝不停止的滚动) direction => 2/3
        waitTime: 1000 // 单步运动停止的时间(默认值1000ms)
      }
    }
  },
  mounted() {
    // 使用JSON.parse(JSON.stringify(xx)深copy对象，方法不会生效，需要再次设置
    this.optionPieRatio.legend.formatter = (text) => {
      text = JSON.parse(text)
      return `{name|${text.name}} {value|${text.value}%}`
    }

    // 设置历史数据曲线样式
    this.optionCurvesHistory.grid = {left: "3%", right: "1%", top: "13%", bottom: "8%",}
    this.optionCurvesHistory.xAxis[0].axisLabel.interval = 3
    // this.optionCurvesHistory.yAxis[0].interval = 10

    this.updateWarn() // 更新碳排警告
    this.updateRatio(this.dateRatio) // 更新用气类型碳占比
    this.updateNames() // 更新名称列表
    this.AlarmConfigList()
  },
  methods: {
    AlarmConfigList() {
      Analyse.getAlarmConfigList({dataType: "gas"}).then((res) => {
        var arr_annotation = []
        res.rows.map((item) => {
          if (item.dataType == "electric") {
            arr_annotation.push(item)
          }
        })
        arr_annotation[0].remark = '预警'
        arr_annotation[1].remark = '告警'
        arr_annotation[2].remark = '异常阀值'
        this.annotation = arr_annotation
      })
    },
    updateWarn() {
      // 更新碳排警告
      Analyse.EnergyConsumptionAlarmData({dataType: 'gas'}).then((res) => {
        if (res === undefined || res === null || res['code'] !== 200) {
          return
        }

        let _alarmInfo = res['data']['alarmInfo']
        this.warningCount[0].count = _alarmInfo['exceptionNum']
        this.warningCount[1].count = _alarmInfo['alarmNum']
        this.warningCount[2].count = _alarmInfo['warnNum']

        let _alarmData = res['data']['alarmData']
        _alarmData.map((item) => {
          if (item.alarmType === '异常') {
            item.style = "color-urgent color-bg-urgent"
          } else if (item.alarmType === '告警') {
            item.style = "color-important color-bg-important"
          } else {
            item.style = "color-tips color-bg-tips"
          }
        })

        this.warningInfo = _alarmData
        this.warningSuggest = _alarmData
      });
    },
    suggestStyle: function (val) {
      // 告警、建议格式样式
      return suggestStyle(val)
    },
    updateRatio: function (date) {
      // 更新用气类型碳占比
      let cycleType = 'day', dataType = 'gas', returnDatatype = 4, dayTime = null
      if (date !== undefined && date !== null && date !== '') {
        cycleType = null
        dayTime = date
        this.dateRatio = date
      }

      Monitor.getSpaceRatioData(cycleType, dataType, returnDatatype, dayTime).then((res) => {
        if (res === undefined || res === null || res['code'] !== 200) {
          return
        }

        let _data = res['data'];
        if (_data === undefined || _data === null) {
          return
        }

        // 组织各用气类型饼图数据
        let _total = 0
        this.$prop100('proportionVal', _data)
        this.optionPieRatio.series[0].data = _data.map((item, index) => {
          let _ceVal = item['ceValue']
          _total += _ceVal

          let _val = this.$numToFixed(item['proportionVal'])
          _data[index]['consumption'] = this.$numToFixed(item['consumption'])
          _data[index]['ceValue'] = this.$numToFixed(_ceVal)
          _data[index]['proportionVal'] = _val
          return {name: JSON.stringify({name: item.name, value: _val}), value: _val,}
        })

        this.optionPieRatio.title.text = '{a|总碳排}\n{b|' + this.$numToFixed(_total) + '}'
        this.optionPieRatio.series[0].itemStyle.color = (params) => {
          return colorGasProp[params.dataIndex]
        }

        this.optionPieRatio.tooltip.formatter = (params) => {
          return `${params.marker}${JSON.parse(params.name)['name']}  ${JSON.parse(params.name)['value']}%`
        }

        // 组织各用气类型表格数据
        this.tableRatio = _data
        this.page.total = this.tableRatio.length
      })
    },
    updateNames: function () {
      // 更新名称列表
      // 根据names判断是不是第一次
      let _update = (this.names.length === 0)

      this.checkedNames = []
      this.names = []

      Analyse.getDictTypeData(this.radioDivisionMode).then((res) => {
        if (res === undefined || res === null || res['code'] !== 200) {
          return
        }

        let _data = res['data']
        if (_data === undefined || _data === null) {
          return
        }

        this.names = _data
        _data.map((item) => {
          this.checkedNames.push(item.dictValue)
        })

        if (_update) {
          this.updateCurves() // 更新曲线数据
        }
      })
    },
    handleCheckAllChange(val) {
      // 全选
      let allNames = [];
      this.names.map((item) => {
        allNames.push(item.dictValue)
      })

      this.checkedNames = val ? allNames : []
      this.isIndeterminate = false
    },
    handleCheckedCitiesChange(value) {
      let checkedCount = value.length
      this.checkAll = checkedCount === this.names.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.names.length
    },
    updateDateCycle: function (date) {
      // 更新日期
      this.dateCycle = date
    },
    updateCurves: function () {
      // 更新曲线数据
      this.optionCurvesHistory.yAxis[0].name = this.radioData === '2' ? 'kgCO₂' : 'm³'

      if (this.checkedNames.length === 0) {
        return
      }

      let data = {
        cycleType: this.radioCycle,
        dataTypes: this.checkedNames,
        recordDate: this.dateCycle,
        returnDataType: this.radioData,
        selectType: 'gas',
      }

      Analyse.getCurvesData(data).then((res) => {
        // 1. 判断返回值
        if (res === undefined || res === null || res['code'] !== 200) {
          return
        }

        let data = res['data']
        if (data === undefined || data === null) {
          return
        }

        // 2. 组织表格头数据
        let headers = [{id: 'name', name: '名称'}]
        for (const header of data.xAxis) {
          headers.push({id: header, name: header})
        }

        // 3. 组织曲线、表格数据
        let series = [], legend = [], tableData = []
        let yAxis = data.yAxis
        for (const val of yAxis) {
          let name = val.name
          let ser = {
            name: name,
            type: "line",
            smooth: true,
            smoothMonotone: "x",
            cursor: "pointer",
            showSymbol: false,
            data: this.$dataToFixed(val.values),
            // lineStyle: {
            //   shadowColor: "rgba(126,199,255,1)",
            //   shadowBlur: 10,
            // },
          }

          series.push(ser)
          legend.push(name)

          // 随机颜色
          for (let i = 0; i < series.length; i++) {
            if (this.radioDivisionMode === 'gas') {
              series[i].color = colorGasProp[i]
            } else {
              series[i].color = '#' + Math.floor(Math.random() * (256 * 256 * 256 - 1)).toString(16)
            }
          }

          let tD = {}
          for (let index = 0; index < headers.length; ++index) {
            let header = headers[index]
            if (header.id === 'name') {
              tD[header.id] = name
            } else {
              tD[header.id] = val.values[index - 1]
            }
          }

          tableData.push(tD)
        }

        // 4. 更新曲线数据
        this.optionCurvesHistory.xAxis[0].data = data.xAxis
        this.optionCurvesHistory.series = series
        this.optionCurvesHistory.legend[0].data = legend

        // 5. 更新表格
        // this.tableHistory = {fields: headers, tableData: tableData}
        this.$set(this.tableHistory, 'fields', headers)
        this.$set(this.tableHistory, 'tableData', tableData)
      })
    },
    resetForm: function () {
      // 初始化历史数据查询表单
      this.radioDivisionMode = 'gas' // 历史数据-划分方式
      this.radioData = '2' // 历史数据-数据类型
      this.radioCycle = 'day' // 历史数据-周期类型
      this.dateCycle = parseTime(new Date(), '{y}-{m}-{d}') // 历史数据日期选择
      this.names = []
      this.checkedNames = []
      this.updateNames() // 更新名称列表
    },
  },
};
</script>
<style lang="less" scoped>
.container {
  height: 100%;

  .card-title {
    height: 16px;
    margin-left: 10px;
    line-height: 16px;
    padding-left: 10px;
    border-left: 4px solid #308ec1;
  }

  .running {
    .running-card-box {
      height: 280px;
      padding: 15px;
      margin-bottom: 0;

      .card-box-warning {
        display: flex;
        justify-content: space-around;
        text-align: center;

        .card-box-warning-img {
          display: flex;
          justify-content: center;
          align-items: center;
          background: url(../../assets/image/carbon-warning-bg.png);
          background-size: 100% 100%;

          img {
            width: 58px;
            height: 58px;
            margin: 15px 25px;
          }
        }
      }

      .warning-box {
        margin-top: 10px;
        height: 40%;
        overflow-y: scroll;
      }

      .card-box-suggest {
        height: 100%;
        display: flex;
        align-items: center;
        // margin-top: 20px;
        // margin-left: 20px;

        span {
          height: 25px;
          margin-right: 15px;
          font-size: 14px;
          color: #c0d5eb;
          line-height: 30px;
        }

        .block {
          margin: 10px 0;
          height: calc(100% - 30px);
          overflow-y: scroll;

          /deep/ .el-timeline-item__content {
            color: #c0d5eb;
            line-height: 20px;
          }

          /deep/ .el-timeline-item {
            padding-bottom: 0px;
          }

          /deep/ .el-timeline-item__timestamp {
            color: #c0d5eb;
          }

          /deep/ .el-timeline-item__timestamp.is-top {
            margin-bottom: 4px;
          }

          /deep/ .el-timeline-item__wrapper {
            top: -5px;
          }
        }
      }

      .card-box-power {
        display: flex;
        justify-content: space-between;
        margin-bottom: 7px;
      }
    }
  }

  .history {
    height: calc(100% - 295px);
    margin-top: 0;

    .history-card-box {
      height: 100%;
      padding: 15px;
      margin-top: 15px;
      margin-bottom: 0;

      .history-content {
        height: 70px;
      }

      .history-card-box-filter {
        display: flex;
        align-items: center;
        height: 30px;
      }

      .history-data {
        padding: 0 5px;
        height: calc(100% - 100px);
        //overflow: scroll;

        ::-webkit-scrollbar {
          width: 8px;
          height: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background-color: rgba(0, 59, 100, 0.9);
          transition: all 0.2s;
          border-radius: 6px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background-color: rgba(0, 59, 100, 0.9);
        }
      }

      .el-button {
        width: 65px;
        height: 28px;
      }

      /deep/ .el-radio {
        color: #c0d5eb;
      }

      .history-checkbox {
        // margin-top: 20px;
        line-height: 30px;

        /deep/ .el-checkbox {
          color: #c0d5eb;
          margin-right: 15px;
          width: 55px;

          /deep/ .el-checkbox__label {
            padding-left: 5px !important;
          }
        }
      }
    }
  }
}
</style>
