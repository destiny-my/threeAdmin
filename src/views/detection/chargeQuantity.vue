<template>
  <!-- 电费分析 -->
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
            <span>说明: 电费结构分为基本电费、电度电费及力调电费。基本电费按申报方式计算所得；电度电费为高峰、谷段、平段电费之和；力调电费为功率因数对应奖惩因数乘以基本电费计算所得。</span>
          </div>
        </div>
      </dv-border-box-12>
      <dv-border-box-12 class="margin-card-box">
        <div class="left-card">
          <div class="card-title">月度电费分析</div>
          <PieChart pId="chartBarMonthly" pStyle="width: 100%; height: 100%;" :pOption="optionMonthly"></PieChart>
        </div>
      </dv-border-box-12>
    </div>
    <div class="box-right">
      <dv-border-box-12 class="card-box">
        <div class="right-card">
          <div>
          </div>
          <div class="card-title">
            <span>本月电费分析</span>
            <span style="float:right;" class="opacity-75 title-fifth fr">单位：元</span>
          </div>
          <div style="display: flex; height: 100%">
            <PieChart pId="chartPieChargeTotal" pStyle="width: 48%; height: 100%;" :pOption="optionChargeTotal"></PieChart>
            <PieChart pId="chartPieChargeElect" pStyle="width: 48%; height: 100%;" :pOption="optionChargeElect"></PieChart>
          </div>
        </div>
      </dv-border-box-12>
      <dv-border-box-12 class="margin-card-box">
        <div class="right-card">
          <div>
            <span class="card-title">月度电费账单</span>
            <span class="opacity-75 title-fifth fr">单位：元</span>
          </div>
          <div class="table-box title-fifth">
            <div><span>总消费： </span><span class="price title-fourth">{{ summarySum }}</span><span> 元</span></div>
            <div class="demo-input-suffix title-fifth">
              月份：
              <el-date-picker v-model="dtMonthlyBill" type="month" size="mini" placeholder="选择月份" @change="updateMonthlyBill"></el-date-picker>
            </div>
          </div>
          <div class="table">
            <ChargeTable :billData="chargeData" :summarySumVal="summarySum"></ChargeTable>
          </div>
        </div>
      </dv-border-box-12>
    </div>
  </div>
</template>
<script>
import PieChart from "./components/pieChart.vue";
import ChargeTable from "./components/chargeTable.vue";
import {colorTimeSharing_L, colorTimeSharing_R, optionBar, optionPie} from "@/api/carbon/option";
import {parseTime,suggestStyle} from "@/utils/cem";
import Analyse from "@/api/carbon/analyse";

export default {
  components: {PieChart, ChargeTable},
  data() {
    return {
      suggest: [], // 运行建议
      optionMonthly: JSON.parse(JSON.stringify(optionBar)), // 月度电费分析
      optionChargeTotal: JSON.parse(JSON.stringify(optionPie)), // 总电费
      optionChargeElect: JSON.parse(JSON.stringify(optionPie)), // 电度电费
      dtMonthlyBill: '', // 月度电费账单日期
      summarySum: '', // 总消费
      chargeData: [],
    };
  },
  created() {
    this.dtMonthlyBill = new Date()
    this.dtMonthlyBill.setMonth(this.dtMonthlyBill.getMonth() - 1)
  },
  mounted() {
    // 设置总电费样式
    this.optionChargeTotal.legend.textStyle.rich.name.width = 80
    this.optionChargeTotal.legend.formatter = (text) => {
      text = JSON.parse(text)
      return `{name|${text.name}} {value|${text.value}}`
    }

    // 设置总电费样式
    this.optionChargeElect.legend.textStyle.rich.name.width = 80
    this.optionChargeElect.legend.formatter = (text) => {
      text = JSON.parse(text)
      return `{name|${text.name}} {value|${text.value}}`
    }

    this.updateSuggest() // 更新运行建议
    this.updateMonthly() // 更新月度电费分析
    this.updateCharge() // 更新总电费、电度电费
    this.updateMonthlyBill(this.dtMonthlyBill) // 更新月度电费账单
  },
  methods: {
    updateSuggest: function () {
      // 更新运行建议
      Analyse.optSuggest({dataType: 'electricityAnalysis'}).then((res) => {
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
    updateMonthly: function () {
      // 更新月度电费分析
      Analyse.chargeMonthly({area: this.$buildingNo}).then((res) => {
        if (res === undefined || res === null || res['code'] !== 200 || res['data'] === undefined) {
          return
        }

        let _xAxis = res['data']['xAxis']
        let _yAxis = res['data']['yAxis']
        this.optionMonthly.legend.data = [_yAxis[0].name, _yAxis[1].name, _yAxis[2].name]
        this.optionMonthly.xAxis[0].data = _xAxis
        this.optionMonthly.yAxis[0].name = '元'
        this.optionMonthly.series = _yAxis.map((item) => {
          let _name = item.name
          let _color = colorTimeSharing_R[0]
          if (_name === '电度电费') {
            _color = colorTimeSharing_R[1]
          } else if (_name === '力调电费') {
            _color = colorTimeSharing_R[2]
          }

          return {
            name: _name,
            type: 'bar',
            data: item.value,
            barWidth: 10,
            barGap: 0.5, // 柱间距离
            itemStyle: {
                show: true,
                color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: _color,
                  },
                  {
                    offset: 1,
                    color: '#FFF',
                  },
                ]),
                opacity: 0.8,
                borderRadius: [5, 5, 0, 0],
            },
          }
        })
      })
    },
    updateCharge: function () {
      // 更新总电费、电度电费
      Analyse.electricalBill({area: this.$buildingNo, monthDate: parseTime(new Date(), '{y}-{m}')}).then((res) => {
        if (res === undefined || res === null || res['code'] !== 200 || res['data'] === undefined) {
          return
        }

        // 组织数据
        let _eTotal = 0 // 电度电费
        let _total = [{name: '基本电费', value: 0}, {name: '电度电费', value: 0}, {name: '力调电费', value: 0}] // 总电费
        let _electrical = [{name: '高峰电费', value: 0}, {name: '平段电费', value: 0}, {name: '低谷电费', value: 0}] // 电度电费
        let _data = res['data']
        for (let index = 0; index < _data.length; ++index) {
          let _val = _data[index].sumVal
          if (index === 0 || index === 1) {
            // 基本电费
            if (_total[0].value === 0) {
              _total[0].value = _val
            }
          } else if (index === 2) {
            // 尖峰电费
            _eTotal += _val
          } else if (index === 3) {
            // 高峰电费
            _eTotal += _val
            _electrical[0].value = _val
          } else if (index === 4) {
            // 平谷电费
            _eTotal += _val
            _electrical[2].value = _val
          } else if (index === 5) {
            // 平段电费
            _eTotal += _val
            _electrical[1].value = _val
          } else if (index === 6) {
            // 力调电费
            _total[2].value = _val
          }
        }

        _total[1].value = _eTotal
        this.updateChargeHelper('总电费', colorTimeSharing_R, _total, this.optionChargeTotal)
        this.updateChargeHelper('总电度电费', colorTimeSharing_L, _electrical, this.optionChargeElect)
      })
    },
    updateChargeHelper: function (titile, colors, data, option) {
      // 更新电费
      let _total = 0;
      option.series[0].data = data.map((item, index) => {
        let _val = this.$numToFixed(item.value)
        _total += item.value
        return {
          name: JSON.stringify({name: item.name, value: _val}),
          value: _val,
        }
      })
        option.tooltip.formatter = (params) => {
          let str = `${params.marker}${JSON.parse(params.name)['name']}  ${JSON.parse(params.name)['value'] + '元'}`
          return str
        };
      option.title.text = '{a|' + titile + '}\n{b|' + this.$numToFixed(_total) + '}'
      option.series[0].itemStyle.color = (params) => {
        return colors[params.dataIndex]
      }
    },
    updateMonthlyBill: function (dt) {
      // 更新月度电费账单
      this.dtMonthlyBill = dt
      Analyse.electricalBill({area: this.$buildingNo, monthDate: parseTime(this.dtMonthlyBill, '{y}-{m}')}).then((res) => {
        if (res === undefined || res === null || res['code'] !== 200 || res['data'] === undefined) {
          return
        }

        // 保留两位小数
        let _data = res['data']
        for (let _item of _data) {
          _item['sumVal'] = this.$numToFixed(_item['sumVal'])
          _item['num'] = this.$numToFixed(_item['num'])
        }

        // 组织数据
        this.summarySum = this.$numToFixed(res['summarySumVal'])
        this.chargeData = _data
        this.chargeData.splice(0, 0, {name: '*基本电费', desc: '*基本电费', price: '', num: '', sumVal: '',})
        this.chargeData.splice(3, 1, {name: '*电度电费', desc: '*电度电费', price: '', num: '', sumVal: '',})
        this.chargeData.map((item) => {
          if (item.name === '力调电费') {
            item.desc = '*力调电费'
            item.name = '*力调电费'
          }
        })

        this.chargeData.pop()
      })
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

  .box-left {
    width: 40%;

    .card-box {
      height: 50%;
      padding: 15px 20px;
      margin: 0;
    }

    .margin-card-box {
      margin-top: 12px;
      height: calc(50% - 12px);
      padding: 16px;
      // margin: 0;
    }

    .left-card {
      height: 100%;


      .block {
        margin: 10px auto;
        height: calc(100% - 80px);
        overflow-y: scroll;

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
  }

  .box-right {
    margin-left: 12px;
    width: calc(60% - 12px);

    .card-box {
      height: 50%;
      padding: 15px 20px;
      margin: 0;
    }

    .margin-card-box {
      margin-top: 12px;
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

      .table-box {
        display: flex;
        padding: 10px 20px;
        justify-content: space-between;
        align-items: center;

        .price {
          color: #02b8ff;
          font-weight: bold;
        }
      }

      .table {
        height: calc(100% - 60px);
        padding: 0 20px 10px;

        /deep/ .el-table,
        /deep/ .el-table__expanded-cell {
          color: #fff;
          // border: 1px solid #0E68A6;
          background: transparent;
        }

        /deep/ .el-table th,
        /deep/ .el-table tr,
        /deep/ .el-table td {
          color: #c0d5eb;
          // border: 1px solid #0E68A6;
          background: transparent;
        }

        /deep/ .el-table__header thead tr {
          background: rgba(0, 59, 100, 0.7);
        }

        /deep/ .el-table__header thead th {
          color: #41a6eb;
        }

        /deep/ .el-table--striped .el-table__body tr.el-table__row--striped td {
          background: rgba(0, 59, 100, 0.7);
        }

        /deep/ .el-table--enable-row-hover .el-table__body tr:hover > td {
          background: transparent;
        }

        // 去掉最下面的那一条线
        /deep/ .el-table::before {
          height: 0;
        }
      }
    }
  }
}

.el-date-editor.el-input,
.el-date-editor.el-input__inner {
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
