<template xmlns="http://www.w3.org/1999/html">
  <!-- 用电分析 -->
  <div class="container">
    <!-- 历史数据 -->
    <el-row class="history">
      <dv-border-box-12 class="history-card-box">
        <el-row class="card-title"><span>供热数据</span></el-row>
        <!-- 筛选条件 -->
        <el-row class="pt-10 pl-10 title-fifth" :gutter="15">
          <el-col class="history-card-box-filter" :xs="4" :sm="4" :md="4" :lg="4" :xl="4">
            <span class="opacity-75">类型：</span>
            <el-radio-group v-model="radioType" @change="updateRadioType">
              <el-radio label="15min">瞬时供热量</el-radio>
              <el-radio label="hour">供热量</el-radio>
            </el-radio-group>
          </el-col>
          <el-col class="history-card-box-filter" :xs="3" :sm="3" :md="3" :lg="3" :xl="3">
            <DatePicker class="ml-15" :pValue="dateCycle" @changedDate="updateDateCycle"></DatePicker>
          </el-col>
          <el-col :xs="2" :sm="2" :md="2" :lg="4" :xl="4">
            <el-button type="primary" size="mini" :loading="false" @click="updateCurves()">查询</el-button>
            <!-- <el-button type="primary" size="mini" :loading="false" round @click="resetForm()">重置</el-button> -->
          </el-col>
        </el-row>
        <!-- <el-row class="pl-10 title-fifth history-checkbox" :gutter="0">
            <el-col :span="1"><span class="opacity-75">选择对象：</span></el-col>
            <el-col :span="22">
              <el-checkbox-group v-model="checkedNames" @change="handleCheckedCitiesChange">
                <el-checkbox v-for="(item, index) in names" :key="index" :label="item.dictValue" v-if="index < 2">{{ index?"B座":"A座" }}</el-checkbox>
              </el-checkbox-group>
            </el-col>
          </el-row> -->
        <el-row :gutter="0" class="history-data mt-5">
          <PieChart pId="chartCurvesHistory" pStyle="width: 100%; height: 100%;" :pOption="optionCurvesHistory">
          </PieChart>
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
import { parseTime, suggestStyle } from "@/utils/cem";
import { colorElecProp, optionCurves, optionPie, } from "@/api/carbon/option";
export default {
  name: "electricQuantity",
  components: { DatePicker, PieChart, ChartCurves, TableSource },
  data() {
    return {
      annotation: [],
      warningCount: [
        { level: '异常', count: 0, style: 'color-urgent', img: require('../../assets/image/urgent.png') },
        { level: '告警', count: 0, style: 'color-important', img: require('../../assets/image/important.png') },
        { level: '预警', count: 0, style: 'color-tips', img: require('../../assets/image/tips.png') },
      ],
      warningInfo: [],
      warningSuggest: [],
      dateRatio: parseTime(new Date(), '{y}-{m}-{d}'), // 用电类型占比日期选择
      optionPieRatio: JSON.parse(JSON.stringify(optionPie)),
      headerRatio: [
        { id: "name", name: "名称" },
        { id: "consumption", name: "耗电(kW·h)", width: "120" },
        { id: "ceValue", name: "碳排(kgCO₂)", width: "140" },
        { id: "proportionVal", name: "占比(%)" },
      ],
      tableRatio: [],
      showPage: '0', // 是否显示分页:'1'显示；'0'不显示
      radioDivisionMode: 'area', // 历史数据-划分方式
      radioData: '2', // 历史数据-数据类型
      radioCycle: 'day', // 历史数据-周期类型
      dateCycle: '', // 历史数据日期选择
      names: [], // 历史数据-选择对象
      checkedNames: [], // 历史数据-选中的对象列表
      checkAll: true,
      isIndeterminate: false,
      optionCurvesHistory: JSON.parse(JSON.stringify(optionCurves)),
      tableHistory: { fields: [], tableData: [] },
      page: {
        total: null,
      },
      radioType: '15min',
      businessDate: false
    };
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
  created() {
  },
  mounted() {
    // 使用JSON.parse(JSON.stringify(xx)深copy对象，方法不会生效，需要再次设置
    this.optionPieRatio.legend.formatter = (text) => {
      text = JSON.parse(text)
      return `{name|${text.name}} {value|${text.value}%}`
    }
    // 设置历史数据曲线样式
    this.optionCurvesHistory.grid = {
      left: "2%",
      right: "3%",
      top: "10%",
      bottom: "1%",
      containLabel: true
    }
    this.optionCurvesHistory.xAxis[0].axisLabel.fontSize = 14;
    this.optionCurvesHistory.yAxis[0].axisLabel.fontSize = 14;
    this.optionCurvesHistory.legend[0].textStyle.fontSize = 14;
    this.updateCurves()
  },
  methods: {
    updateWarn() {
      // 更新碳排警告
      Analyse.EnergyConsumptionAlarmData({ dataType: 'electric' }).then((res) => {
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
    AlarmConfigList() {
      Analyse.getAlarmConfigList({ dataType: "electric" }).then((res) => {
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
    suggestStyle: function (val) {
      // 告警、建议格式样式
      return suggestStyle(val)
    },
    updateRatio: function (date) {
      // 更新用电类型碳占比
      let cycleType = 'day', dataType = 'electric', returnDatatype = 2, dayTime = null
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

        // 组织各用电类型饼图数据
        let _total = 0
        this.$prop100('proportionVal', _data)
        this.optionPieRatio.series[0].data = _data.map((item, index) => {
          let _ceVal = item['ceValue']
          _total += _ceVal

          let _val = this.$numToFixed(item['proportionVal'])
          _data[index]['consumption'] = this.$numToFixed(item['consumption'])
          _data[index]['ceValue'] = this.$numToFixed(_ceVal)
          _data[index]['proportionVal'] = _val
          return { name: JSON.stringify({ name: item.name, value: _val }), value: _val, }
        })

        this.optionPieRatio.title.text = '{a|总碳排}\n{b|' + this.$numToFixed(_total) + '}'
        this.optionPieRatio.series[0].itemStyle.color = (params) => {
          return colorElecProp[params.dataIndex]
        }

        this.optionPieRatio.tooltip.formatter = (params) => {
          return `${params.marker}${JSON.parse(params.name)['name']}  ${JSON.parse(params.name)['value']}%`
        }

        // 组织各用电类型表格数据
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
        this.checkedNames = ["3#B1", "3#F1"]
        //   _data.map((item) => {
        //     this.checkedNames.push(item.dictValue)
        //   })

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

      this.checkedNames = val ? ["3#B1", "3#F1"] : []
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
      this.updateCurves()
    },
    updateCurves: async function () {
      // 更新曲线数据
      let date = this.dateCycle
      // 管网温度、瞬时流量、阀门开度，11月8日到14日，实际去查11月25日到12月1日的数据
      if (this.radioType == '15min' || this.radioType == 'hour') {
        if (new Date(date).getTime() >= 1699401600000 && new Date(date).getTime() <= 1699920000000) {
          this.businessDate = true
          date = parseTime(new Date(date).getTime() + 17 * 24 * 60 * 60 * 1000, "{y}-{m}-{d}")
        } else {
          this.businessDate = false
        }
      }
      let hour = parseTime(new Date(), '{h}:{i}:{s}')
      if (this.radioType == '15min') {
        if (this.businessDate) {
          $.when(
            this.getByCodeTimeData({ code: 'G33-2nd-supply-per-hour', startTime: date + ' 00:00:00', endTime: date + ' ' + hour, cycle: '15min', companyId: '1' }),
            // this.getByCodeTimeData({ code: 'cp-2nd-total-supply-per-hour', startTime: date + ' 00:00:00', endTime: date + ' ' + hour, cycle: '15min', companyId: '1' }),
            // this.getByCodeTimeData({ code: 'cp-2nd-g22-supply-per-hour', startTime: date + ' 00:00:00', endTime: date + ' ' + hour, cycle: '15min', companyId: '1' }),
            // this.getByCodeTimeData({ code: 'cp-2nd-g23-supply-per-hour', startTime: date + ' 00:00:00', endTime: date + ' ' + hour, cycle: '15min', companyId: '1' }),
            // this.getByCodeTimeData({ code: 'G33-2nd-supply-per-hour', startTime: date + ' 00:00:00', endTime: date + ' ' + hour, cycle: '15min', companyId: '1' }),
          ).done(async (res1, res2, res3, res4, res5) => {
            res1 = await res1
            res1[0].lblName = '一次侧小时供热量'
            // res2 = await res2
            // res3 = await res3
            // res4 = await res4
            // res5 = await res5
            let arr = [res1]
            this.setCurvesOption(arr)
          })
        } else {
          $.when(
            this.getByCodeTimeData({ code: 'cp-1st-total-supply-per-hour', startTime: date + ' 00:00:00', endTime: date + ' ' + hour, cycle: '15min', companyId: '1' }),
          ).done(async (res1) => {
            res1 = await res1
            let arr = [res1]
            this.setCurvesOption(arr)
          })
        }
      } else if (this.radioType == 'hour') {
        if (this.businessDate) {
          $.when(
            this.getByCodeTimeData({ code: 'cp-g33-2nd-supply', startTime: date + ' 00:00:00', endTime: date + ' ' + hour, cycle: 'hour', companyId: '1' }),
            // this.getByCodeTimeData({ code: 'cp-2nd-total-supply', startTime: date + ' 00:00:00', endTime: date + ' ' + hour, cycle: 'hour', companyId: '1' }),
            // this.getByCodeTimeData({ code: 'cp-g22-supply', startTime: date + ' 00:00:00', endTime: date + ' ' + hour, cycle: 'hour', companyId: '1' }),
            // this.getByCodeTimeData({ code: 'cp-g23-supply', startTime: date + ' 00:00:00', endTime: date + ' ' + hour, cycle: 'hour', companyId: '1' }),
            // this.getByCodeTimeData({ code: 'cp-g33-2nd-supply', startTime: date + ' 00:00:00', endTime: date + ' ' + hour, cycle: 'hour', companyId: '1' }),
          ).done(async (res1, res2, res3, res4, res5) => {
            res1 = await res1
            res1[0].lblName = '总供热量（一次）'
            // res2 = await res2
            // res3 = await res3
            // res4 = await res4
            // res5 = await res5
            let arr = [res1]
            this.setCurvesOption(arr)
          })
        } else {
          $.when(
            this.getByCodeTimeData({ code: 'cp-1st-total-supply', startTime: date + ' 00:00:00', endTime: date + ' ' + hour, cycle: 'hour', companyId: '1' })
          ).done(async (res1) => {
            res1 = await res1
            let arr = [res1]
            this.setCurvesOption(arr)
          })
        }

      }

    },
    /**
     * @Author: ybf
     * @LastEditTime: 
     * @description: 更新曲线数据
     * @param {*} arr
     * @return {*}
     */
    setCurvesOption(arr) {
      let excelExportMap = { tHeader: [], keys: [], table: [] }
      let series = [], lblUnit = '', xAxis = [], legend = []
      arr.forEach((res, i) => {
        let data = res["result"], serData = []
        let ser = {
          name: '',
          type: "line",
          smooth: true,
          smoothMonotone: "x",
          cursor: "pointer",
          showSymbol: false,
          data: [],
          // lineStyle: {
          //   shadowColor: "rgba(126,199,255,1)",
          //   shadowBlur: 10,
          // },
        }
        data.forEach((item, j) => {
          if (j == 0) {
            item.lblName ? legend.push(item.lblName) : ''
            item.lblUnit ? lblUnit = item.lblUnit : ''
            ser.name = item.lblName
          }
          if (i == 0) {
            xAxis.push(parseTime(item.statStartTime, '{h}:{i}'))
            excelExportMap.tHeader.push(item.lblName)
            excelExportMap.keys.push(item.lblName)
          }
          serData.push(item.statValue)
        })
        ser.data = serData
        series.push(ser)
      })
      // 随机颜色
      for (let i = 0; i < series.length; i++) {
        series[i].color = colorElecProp[i]
      }
      this.optionCurvesHistory.series = series
      this.optionCurvesHistory.xAxis[0].data = xAxis
      this.optionCurvesHistory.legend[0].data = legend
      this.optionCurvesHistory.yAxis[0].name = lblUnit
    },
    updateRadioType() {
      this.updateCurves()
    },
    /**
    * @Author: ybf
    * @LastEditTime: 
    * @description: 获取统计数据
    * @return {*}
    */
    getByCodeTimeData(params) {
      return new Promise((resolve, reject) => {
        this.$httpGet(window.api.byCodeTime, params).then((res) => {
          resolve(res)
        })
      })
    },
    resetForm: function () {
      // 初始化历史数据查询表单
      this.radioDivisionMode = 'electric' // 历史数据-划分方式
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

        .seamless-warp {
          width: 100%;
          height: calc(100% - 16px);
          overflow: hidden;
        }

        .marquee_top {
          transition: all 0.5s;
        }

        .isRoll {
          transition: all 0.5s;
          margin-top: -30px;
        }
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

          /deep/ .el-timeline-item__timestamp {
            color: #c0d5eb;
          }

          /deep/ .el-timeline-item__timestamp.is-top {
            margin-bottom: 4px;
          }

          /deep/ .el-timeline-item {
            padding-bottom: 0;
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
    height: 100%;
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
  