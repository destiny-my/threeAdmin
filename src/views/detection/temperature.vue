<template xmlns="http://www.w3.org/1999/html">
  <!-- 用电分析 -->
  <div class="container">
    <!-- 历史数据 -->
    <el-row class="history">
      <dv-border-box-12 class="history-card-box">
        <el-row class="card-title"><span>历史数据</span></el-row>
        <!-- 筛选条件 -->
        <el-row class="pt-10 pl-10 title-fifth" :gutter="15">
          <el-col class="history-card-box-filter" :xs="11" :sm="11" :md="11" :lg="11" :xl="11">
            <span class="opacity-75">类型：</span>
            <el-radio-group v-model="radioType" @change="updateRadioType">
              <el-radio label="outdoor">室外温度</el-radio>
              <el-radio label="temp">室内温度</el-radio>
              <el-radio label="pipe">管网温度</el-radio>
              <el-radio label='flow'>瞬时流量</el-radio>
              <el-radio label='degree'>阀门开度</el-radio>
              <!-- <el-radio label='pres'>供水压力</el-radio>
              <el-radio label='waterPump'>运行频率</el-radio> -->
            </el-radio-group>
          </el-col>

          <el-col class="history-card-box-filter" :xs="3" :sm="3" :md="3" :lg="3" :xl="3">
            <DatePicker class="ml-15" :pValue="dateCycle" @changedDate="updateDateCycle"></DatePicker>
          </el-col>
          <el-col :xs="2" :sm="2" :md="2" :lg="4" :xl="4">
            <el-button type="primary" size="mini" :loading="false" @click="getDataByAtrbIds()">查询</el-button>
            <el-button type="primary" size="mini" :loading="false" @click="ecxelSave()">导出</el-button>
            <!-- <el-button type="primary" size="mini" :loading="false" round @click="resetForm()">重置</el-button> -->
          </el-col>
        </el-row>
        <!-- <el-row class="pl-10 title-fifth history-checkbox" :gutter="0">
          <el-col :span="1"><span class="opacity-75">选择对象：</span></el-col>
          <el-col :span="1">
            <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll"
              @change="handleCheckAllChange">全选</el-checkbox>
          </el-col>
          <el-col :span="22">
            <el-checkbox-group v-model="checkedNames" @change="handleCheckedCitiesChange">
              <el-checkbox v-for="(item, index) in names" :key="index" :label="item.dictValue">{{ item.dictLable
              }}</el-checkbox>
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
import { colorElecProp, optionCurves, optionPie } from "@/api/carbon/option";
import { excelExport } from 'pikaz-excel-js'
export default {
  name: "electricQuantity",
  components: { DatePicker, PieChart, ChartCurves, TableSource },
  data() {
    return {
      annotation: [],
      warningCount: [
        {
          level: "异常",
          count: 0,
          style: "color-urgent",
          img: require("../../assets/image/urgent.png"),
        },
        {
          level: "告警",
          count: 0,
          style: "color-important",
          img: require("../../assets/image/important.png"),
        },
        {
          level: "预警",
          count: 0,
          style: "color-tips",
          img: require("../../assets/image/tips.png"),
        },
      ],
      warningInfo: [],
      warningSuggest: [],
      dateRatio: parseTime(new Date(), "{y}-{m}-{d}"), // 用电类型占比日期选择
      optionPieRatio: JSON.parse(JSON.stringify(optionPie)),
      headerRatio: [
        { id: "name", name: "名称" },
        { id: "consumption", name: "耗电(kW·h)", width: "120" },
        { id: "ceValue", name: "碳排(kgCO₂)", width: "140" },
        { id: "proportionVal", name: "占比(%)" },
      ],
      tableRatio: [],
      showPage: "0", // 是否显示分页:'1'显示；'0'不显示
      radioDivisionMode: "electric", // 历史数据-划分方式
      radioData: "2", // 历史数据-数据类型
      radioCycle: "day", // 历史数据-周期类型
      dateCycle: "", // 历史数据日期选择
      names: [], // 历史数据-选择对象
      checkedNames: [], // 历史数据-选中的对象列表
      checkAll: true,
      isIndeterminate: false,
      optionCurvesHistory: JSON.parse(JSON.stringify(optionCurves)),
      tableHistory: { fields: [], tableData: [] },
      page: {
        total: null,
      },
      tempIdList: [],
      nameMap: {},
      excelExportMap: { tHeader: [], keys: [], table: [] },
      radioType: 'outdoor',
      loading: null,
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
        waitTime: 1000, // 单步运动停止的时间(默认值1000ms)
      };
    },
  },
  created() { },
  mounted() {
    // 使用JSON.parse(JSON.stringify(xx)深copy对象，方法不会生效，需要再次设置
    this.optionPieRatio.legend.formatter = (text) => {
      text = JSON.parse(text);
      return `{name|${text.name}} {value|${text.value}%}`;
    };
    // 设置历史数据曲线样式
    this.optionCurvesHistory.grid = {
      left: "1%",
      right: "3%",
      top: "10%",
      bottom: "1%",
      containLabel: true
    };
    // this.optionCurvesHistory.xAxis[0].axisLabel.interval = 3;
    this.optionCurvesHistory.xAxis[0].axisLabel.fontSize = 14;
    this.optionCurvesHistory.yAxis[0].axisLabel.fontSize = 14;
    this.optionCurvesHistory.legend[0].textStyle.fontSize = 14;
    // this.updateCurves();
    this.getObject()
    // this.updateWarn() // 更新碳排警告
    // this.updateRatio(this.dateRatio) // 更新用电类型碳占比
    // this.updateNames() // 更新名称列表
    // this.AlarmConfigList()
  },
  methods: {
    updateWarn() {
      // 更新碳排警告
      Analyse.EnergyConsumptionAlarmData({ dataType: "electric" }).then(
        (res) => {
          if (res === undefined || res === null || res["code"] !== 200) {
            return;
          }

          let _alarmInfo = res["data"]["alarmInfo"];
          this.warningCount[0].count = _alarmInfo["exceptionNum"];
          this.warningCount[1].count = _alarmInfo["alarmNum"];
          this.warningCount[2].count = _alarmInfo["warnNum"];

          let _alarmData = res["data"]["alarmData"];
          _alarmData.map((item) => {
            if (item.alarmType === "异常") {
              item.style = "color-urgent color-bg-urgent";
            } else if (item.alarmType === "告警") {
              item.style = "color-important color-bg-important";
            } else {
              item.style = "color-tips color-bg-tips";
            }
          });

          this.warningInfo = _alarmData;
          this.warningSuggest = _alarmData;
        }
      );
    },
    AlarmConfigList() {
      Analyse.getAlarmConfigList({ dataType: "electric" }).then((res) => {
        var arr_annotation = [];
        res.rows.map((item) => {
          if (item.dataType == "electric") {
            arr_annotation.push(item);
          }
        });
        arr_annotation[0].remark = "预警";
        arr_annotation[1].remark = "告警";
        arr_annotation[2].remark = "异常阀值";
        this.annotation = arr_annotation;
      });
    },
    suggestStyle: function (val) {
      // 告警、建议格式样式
      return suggestStyle(val);
    },
    updateRatio: function (date) {
      // 更新用电类型碳占比
      let cycleType = "day",
        dataType = "electric",
        returnDatatype = 2,
        dayTime = null;
      if (date !== undefined && date !== null && date !== "") {
        cycleType = null;
        dayTime = date;
        this.dateRatio = date;
      }

      Monitor.getSpaceRatioData(
        cycleType,
        dataType,
        returnDatatype,
        dayTime
      ).then((res) => {
        if (res === undefined || res === null || res["code"] !== 200) {
          return;
        }

        let _data = res["data"];
        if (_data === undefined || _data === null) {
          return;
        }

        // 组织各用电类型饼图数据
        let _total = 0;
        this.$prop100("proportionVal", _data);
        this.optionPieRatio.series[0].data = _data.map((item, index) => {
          let _ceVal = item["ceValue"];
          _total += _ceVal;

          let _val = this.$numToFixed(item["proportionVal"]);
          _data[index]["consumption"] = this.$numToFixed(item["consumption"]);
          _data[index]["ceValue"] = this.$numToFixed(_ceVal);
          _data[index]["proportionVal"] = _val;
          return {
            name: JSON.stringify({ name: item.name, value: _val }),
            value: _val,
          };
        });

        this.optionPieRatio.title.text =
          "{a|总碳排}\n{b|" + this.$numToFixed(_total) + "}";
        this.optionPieRatio.series[0].itemStyle.color = (params) => {
          return colorElecProp[params.dataIndex];
        };

        this.optionPieRatio.tooltip.formatter = (params) => {
          return `${params.marker}${JSON.parse(params.name)["name"]}  ${JSON.parse(params.name)["value"]
            }%`;
        };

        // 组织各用电类型表格数据
        this.tableRatio = _data;
        this.page.total = this.tableRatio.length;
      });
    },
    updateNames: function () {
      // 更新名称列表
      // 根据names判断是不是第一次
      let _update = this.names.length === 0;

      this.checkedNames = [];
      this.names = [];

      Analyse.getDictTypeData(this.radioDivisionMode).then((res) => {
        if (res === undefined || res === null || res["code"] !== 200) {
          return;
        }

        let _data = res["data"];
        if (_data === undefined || _data === null) {
          return;
        }

        this.names = _data;
        _data.map((item) => {
          this.checkedNames.push(item.dictValue);
        });

        if (_update) {
          // this.updateCurves(); // 更新曲线数据
        }
      });
    },
    handleCheckAllChange(val) {
      // 全选
      let allNames = [];
      this.names.map((item) => {
        allNames.push(item.dictValue);
      });

      this.checkedNames = val ? allNames : [];
      this.isIndeterminate = false;
    },
    handleCheckedCitiesChange(value) {
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.names.length;
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.names.length;
    },
    updateDateCycle: function (date) {
      // 更新日期
      this.dateCycle = date;
      this.getObject()
    },
    updateRadioType() {
      this.getObject()
    },
    /**
     * @Author: ybf
     * @LastEditTime: 
     * @description: 获取所有测温点id
     * @return {*}
     */
    getObject: async function () {
      // 管网温度、瞬时流量、阀门开度，11月8日到14日，实际去查11月25日到12月1日的数据
      if (this.radioType == 'pipe' || this.radioType == 'flow' || this.radioType == 'degree') {
        if (new Date(this.dateCycle).getTime() >= 1699401600000 && new Date(this.dateCycle).getTime() <= 1699920000000) {
          this.businessDate = true
        } else {
          this.businessDate = false
        }
      }
      this.loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      let idMap = {}
      let id1Map = {}
      let atrbCode = this.radioType
      this.nameMap = {}
      let httpArr = [], httpRes = []
      if (atrbCode == 'temp') {
        this.optionCurvesHistory.grid = {
          left: "1%",
          right: "3%",
          top: "20%",
          bottom: "1%",
          containLabel: true
        };
        let tempRes = await this.$httpGet(window.api.getObject, { tmplId: "58", offset: 1, size: 999 })
        // let g33tempRes = await this.$httpGet(window.api.getObject, { tmplId: "57", offset: 1, size: 999 })
        for (let i of tempRes.result.data) {
          if (i.objName.indexOf('供水') < 0 && i.objName.indexOf('g33 1楼西南角') < 0 && i.objName.indexOf('g33 7楼西南角') < 0) {
            this.nameMap[i.id] = i
            httpArr.push(this.$httpGet(window.api.byType, { objId: i.id, type: "2" }))
            httpRes.push(i)
          }
        }
        // for (let i of g33tempRes.result.data) {
        //   if (i.objCode == 'g33_1st_floor' || i.objCode == 'g33_7th_floor') {
        //     this.nameMap[i.id] = i
        //     httpArr.push(this.$httpGet(window.api.byType, { objId: i.id, type: "2" }))
        //     httpRes.push(i)
        //   }
        // }
        $.when(...httpArr).done(async (...httpRes) => {
          for (var i = 0; i < httpRes.length; i++) {
            let a = await httpRes[i]
            a.result.forEach(item => {
              if (item.template.atrbCode.indexOf(atrbCode) > -1) {
                idMap[item.id] = item
              }
            })
          }
          this.tempIdList = idMap
          this.getDataByAtrbIds()
        })
      } else {
        this.optionCurvesHistory.grid = {
          left: "1%",
          right: "3%",
          top: "10%",
          bottom: "1%",
          containLabel: true
        };
        let heatRes = await this.$httpGet(window.api.getObject, { tmplId: "59", offset: 1, size: 999 })

        for (let i of heatRes.result.data) {
          this.nameMap[i.id] = i
          httpArr.push(this.$httpGet(window.api.byType, { objId: i.id, type: "2" }))
          httpRes.push(i)
        }
        if (atrbCode == 'pipe') {
          let tempRes = await this.$httpGet(window.api.getObject, { tmplId: "57", offset: 1, size: 999 })
          for (let i of tempRes.result.data) {
            if (i.objName.indexOf('G33二次供热') > -1) {
              this.nameMap[i.id] = i
              httpArr.push(this.$httpGet(window.api.byType, { objId: i.id, type: "2" }))
              httpRes.push(i)
            }
          }
        }
        $.when(...httpArr).done(async (...httpRes) => {
          for (var i = 0; i < httpRes.length; i++) {
            let a = await httpRes[i]
            a.result.forEach(item => {
              if (atrbCode == 'outdoor') {
                if (item.template.atrbCode.indexOf('m_outdoor_temp') > -1) {
                  id1Map[item.id] = item
                }
              } else if (atrbCode == 'pipe') {
                if (!this.businessDate) {
                  // m_g_three_three_out_temp g33供水温度
                  // if (item.template.atrbCode == 'm_g_two_two_in_temp' || item.template.atrbCode == 'm_g_two_three_in_temp' || item.template.atrbCode == 'm_g_two_three_out_temp'
                  //   || item.template.atrbCode == 'm_g_two_two_out_temp' || item.template.atrbCode == 'm_total_supply_temp' || item.template.atrbCode == 'm_total_back_temp'
                  //   || item.template.atrbCode == 'm_g_third_park_out_temp' || item.template.atrbCode == 'm_g_third_park_in_temp'
                  //   || item.template.atrbCode == 'm_g_three_three_in_temp' || item.template.atrbCode == 'temp'
                  // ) {
                  //   id1Map[item.id] = item
                  // }
                  if (item.template.atrbCode == 'm_g_two_three_out_temp' || item.template.atrbCode == 'm_g_two_two_in_temp' || item.template.atrbCode == 'm_g_two_two_out_temp'
                    || item.template.atrbCode == 'm_g_two_three_in_temp'
                  ) {
                    id1Map[item.id] = item
                  }
                } else {
                  if (item.template.atrbCode == 'temp' || item.template.atrbCode == 'm_g_three_three_in_temp'
                  ) {
                    let map = {
                      '温度': '2号地平均供水温度',
                      'g33回水温度': '2号地平均回水温度',
                    }
                    item.template.atrbName = map[item.template.atrbName]
                    id1Map[item.id] = item
                  }
                }
              } else if (atrbCode == 'waterPump') {
                if (item.template.atrbName.indexOf('泵运行频率') > -1) {
                  id1Map[item.id] = item
                }
              } else if (atrbCode == 'degree') {
                if (!this.businessDate) {
                  if (item.template.atrbCode == 'm_g_two_two_valve_open_degree' || item.template.atrbCode == 'm_g_two_three_valve_open_degree') {
                    id1Map[item.id] = item
                  }
                } else {
                  if (item.template.atrbCode == 'm_g_three_three_t_one_op_degree' || item.template.atrbCode == 'm_g_three_three_t_two_op_degree') {
                    let map = {
                      'g33_t1阀门开度': 'g22阀门开度',
                      'g33_t2阀门开度': 'g23阀门开度',
                    }
                    item.template.atrbName = map[item.template.atrbName]
                    id1Map[item.id] = item
                  }
                }
              } else if (atrbCode == 'flow') {
                if (!this.businessDate) {
                  if (item.template.atrbCode == 'm_g_two_two_flow' || item.template.atrbCode == 'm_g_two_three_flow') {
                    id1Map[item.id] = item
                  }
                } else {
                  if (item.template.atrbCode == 'm_g_three_three_flow') {
                    let map = {
                      'g33瞬时流量': '2号地平均瞬时流量',
                    }
                    item.template.atrbName = map[item.template.atrbName]
                    id1Map[item.id] = item
                  }
                }
              } else if (item.template.atrbCode.indexOf(atrbCode) > -1) {
                id1Map[item.id] = item
              }
            })
          }
          this.tempIdList = id1Map
          this.getDataByAtrbIds()
        })
      }
    },
    /**
     * @Author: ybf
     * @LastEditTime: 
     * @description: 根据温度id获取折线图数据
     * @return {*}
     */
    getDataByAtrbIds() {
      let date = this.dateCycle
      if (this.radioType == 'pipe' || this.radioType == 'flow' || this.radioType == 'degree') {
        if (new Date(date).getTime() >= 1699401600000 && new Date(date).getTime() <= 1699920000000) {
          date = parseTime(new Date(date).getTime() + 17 * 24 * 60 * 60 * 1000, "{y}-{m}-{d}")
        }
      }
      let params = { beginDate: date + ' 00:00:00', endDate: date + ' 23:59:59', atrbIds: Object.keys(this.tempIdList).join(',') }
      this.$httpGet(window.api.getDataByAtrbIds, params).then((res) => {
        if (res.successful) {
          if (res.hasOwnProperty('result')) {
            this.updateCurves(res.result)
          } else {
            this.updateCurves([])
          }
        } else {
          this.updateCurves([])
        }
        this.loading.close();
      })
    },
    updateCurves: function (data) {
      // 更新曲线数据
      let unit = {
        temp: '℃',
        outdoor: '℃',
        flow: 'm³/h',
        degree: '%',
        pressure: 'Pa',
        pipe: '℃',
        waterPump: 'HZ'
      }
      this.optionCurvesHistory.yAxis[0].name = '单位：' + unit[this.radioType]

      this.optionCurvesHistory.tooltip = {
        // 提示框
        trigger: "axis",
        axisPointer: {
          lineStyle: {
            color: "#57617B",
          },
        },
        backgroundColor: "rgba(4, 13, 40, 0.5)",
        borderColor: "#0095FF",
        textStyle: {
          color: "#DEF1FD",
          fontSize: 14,
        },
        padding: 5,
        formatter: function (params) {
          let astr = ``
          if (params.length > 10) {
            astr += ` <div style="display: block;height:20px;width: 100%;float:left;">
            ${params[0].axisValue}
          </div>
          `
            params.forEach((ele) => {
              const data = ele.data;
              if (ele.seriesName) {
                astr += `
                            <div style="display: block;height:20px;width: 50%;float:left;">
                              <i style="width: 10px;height: 10px;display: inline-block;background: ${ele.color};border-radius: 10px;"></i>
                              <span>${ele.seriesName}: ${data}</span>
                            </div>
                        `;
              }
            });
            const b = '<div style="width:550px">' + astr + "<div>";
            return b;
          } else {
            astr += `
            ${params[0].axisValue}
          `
            params.forEach((ele) => {
              const data = ele.data;
              if (ele.seriesName) {
                astr += `
                            <div style="display: block;height:20px;margin: 10px;">
                              <i style="width: 10px;height: 10px;display: inline-block;background: ${ele.color};border-radius: 10px;"></i>
                              <span>${ele.seriesName}: ${data}</span>
                            </div>
                        `;
              }
            });
            const b = '<div style="width:auto">' + astr + "<div>";
            return b;
          }
        },
        position: function (point, params, dom, rect, size) {
          // 获取可视区域的宽度和高度
          const viewWidth = size.viewSize[0];
          const viewHeight = size.viewSize[1];

          // 获取提示框内容的宽度和高度
          const tooltipWidth = dom.offsetWidth;
          const tooltipHeight = dom.offsetHeight;

          // 设置提示框的位置
          let left = point[0];
          let top = point[1];

          // 判断提示框是否超出可视范围，如果超出则调整位置
          if (left + tooltipWidth > viewWidth) {
            left = viewWidth - tooltipWidth;
          }
          if (top + tooltipHeight > viewHeight) {
            top = viewHeight - tooltipHeight;
          }

          return [left, top];
        },
      };
      let series = [],
        legend = [], xAxis = []
      let excelExportMap = { tHeader: [], keys: [], table: [] }
      let tableMap = {}
      let xA = null
      for (const k in data) {
        let arr = data[k], serData = []
        arr.forEach((item, i) => {
          // item.name = new Date(item.gmtCreate).toLocaleString();
          item.name = this.dateCycle + ' ' + parseTime(new Date(item.gmtCreate), "{h}:{i}:{s}");
          if (!xA || xA == k) {
            xAxis.push(item.name)
            xA = k
          }
          item.value = Math.round(item.atrbValue * 100) / 100
          serData.push(item.value)
          if (tableMap[i]) {
            tableMap[i][k] = item.value
          } else {
            tableMap[i] = { date: item.name }
            tableMap[i][k] = item.value
          }
        })
        // serData = serData.map(val => {
        //   return Math.round(val * 100) / 100
        // })
        let name = this.nameMap[this.tempIdList[k].objId].objName + '-' + this.tempIdList[k].template.atrbName
        excelExportMap.tHeader.push(name)
        excelExportMap.keys.push(k)
        let ser = {
          name: name,
          type: "line",
          smooth: true,
          // smoothMonotone: "x",
          cursor: "pointer",
          showSymbol: false,
          data: serData,
        };
        series.push(ser);
        legend.push(name);
      }
      excelExportMap.table = Object.values(tableMap)
      this.excelExportMap = excelExportMap
      // 随机颜色
      for (let i = 0; i < series.length; i++) {
        if (this.radioDivisionMode === "electric") {
          series[i].color = colorElecProp[i];
        } else {
          series[i].color =
            "#" +
            Math.floor(Math.random() * (256 * 256 * 256 - 1)).toString(16);
        }
      }
      // 4. 更新曲线数据
      this.optionCurvesHistory.xAxis[0].data = xAxis;
      this.optionCurvesHistory.xAxis[0].axisLabel.formatter = function (value) {
        function p(s) {
          return s < 10 ? '0' + s : s;
        }
        let time = new Date(value);
        // let year = time.getFullYear();
        // let month = time.getMonth() + 1;
        // let date = time.getDate();
        let hours = time.getHours();
        let minutes = time.getMinutes();
        let seconds = time.getSeconds();
        return p(hours) + ':' + p(minutes) + ':' + p(seconds);
      }
      this.optionCurvesHistory.series = series;
      this.optionCurvesHistory.legend[0].data = legend;
    },
    /**
     * @Author: ybf
     * @LastEditTime: 
     * @description: 导出数据
     * @return {*}
     */
    ecxelSave() {
      if (!this.excelExportMap.table.length) {
        this.$message({ showClose: true, message: '请先查询数据', type: 'warning' })
        return
      }
      excelExport({
        sheet: [{
          title: "",
          // 表头
          tHeader: ["时间", ...this.excelExportMap.tHeader],
          // 数据键名
          keys: ["date", ...this.excelExportMap.keys],
          // 表格数据
          table: this.excelExportMap.table,
          sheetName: "sheet",
        }],
        filename: '历史数据'
      })
    },
    resetForm: function () {
      // 初始化历史数据查询表单
      this.radioDivisionMode = "electric"; // 历史数据-划分方式
      this.radioData = "2"; // 历史数据-数据类型
      this.radioCycle = "day"; // 历史数据-周期类型
      this.dateCycle = parseTime(new Date(), "{d}"); // 历史数据日期选择
      this.names = [];
      this.checkedNames = [];
      // this.updateNames(); // 更新名称列表
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
