<template xmlns="http://www.w3.org/1999/html">
  <!-- 用电分析 -->
  <div class="container">
    <el-row class="running" :gutter="12">
      <!-- 运行建议 -->
      <el-col :xs="7" :sm="7" :md="24" :lg="24" :xl="24">
        <dv-border-box-12 class="running-card-box">
          <el-row class="card-title"><span>控制指令</span></el-row>
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
    </el-row>
    <!-- 历史数据 -->
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
import {colorElecProp, optionCurves, optionPie,} from "@/api/carbon/option";
export default {
  name:"electricQuantity",
  components: {DatePicker, PieChart, ChartCurves, TableSource},
  data() {
    return {
      annotation:[],
      warningCount: [
        {level: '异常', count: 0, style: 'color-urgent', img: require('../../assets/image/urgent.png')},
        {level: '告警', count: 0, style: 'color-important', img: require('../../assets/image/important.png')},
        {level: '预警', count: 0, style: 'color-tips', img: require('../../assets/image/tips.png')},
      ],
      warningInfo: [],
      warningSuggest: [],
      dateRatio: parseTime(new Date(), '{y}-{m}-{d}'), // 用电类型占比日期选择
      optionPieRatio: JSON.parse(JSON.stringify(optionPie)),
      headerRatio: [
        {id: "name", name: "名称"},
        {id: "consumption", name: "耗电(kW·h)", width: "120"},
        {id: "ceValue", name: "碳排(kgCO₂)", width: "140"},
        {id: "proportionVal", name: "占比(%)"},
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
      tableHistory: {fields: [], tableData: []},
      page: {
        total: null,
      },
    };
  },
  computed: {
    // 消息轮播
     classOption () {
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

    // this.optionCurvesHistory.yAxis[0].interval = 10

    this.updateWarn() // 更新碳排警告
    // this.updateRatio(this.dateRatio) // 更新用电类型碳占比
    // this.updateNames() // 更新名称列表
    // this.AlarmConfigList()
  },
  methods: {
    updateWarn() {
      // 更新碳排警告
      this.$httpGet(window.api.getEnergyConsumptionAlarmData).then((res)=>{
        console.log(res)
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
    AlarmConfigList(){
      Analyse.getAlarmConfigList({dataType:"electric"}).then((res) => {
        var arr_annotation=[]
        res.rows.map((item) => {
          if(item.dataType == "electric"){
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
      height: 78vh;
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
        margin-top:10px;
        height: 40%;
        overflow-y: scroll;
        .seamless-warp{
          width: 100%;
          height: calc(100% - 16px);
          overflow: hidden;
        }
        .marquee_top {
          transition:all 0.5s;
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
