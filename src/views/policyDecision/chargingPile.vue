<template xmlns="http://www.w3.org/1999/html">
  <!-- 充电桩台账 -->
  <div class="container title-fourth">
    <el-row class="height-50" :gutter="10">
      <!-- 自用桩减排效益 -->
      <el-col class="height-100" :span="12" style="padding-left: 0;">
        <dv-border-box-12 class="pv-card">
          <el-row class="card-title"><span>自用桩减排效益</span></el-row>
          <PieChart pId="chartCurvesSelf" :pResize="chartResize" pStyle="width: 100%; height: 100%;" :pOption="optionCurvesSelf"></PieChart>
        </dv-border-box-12>
      </el-col>
      <!-- 公用桩收益 -->
      <el-col class="height-100" :span="12" style="padding-right: 0;">
        <dv-border-box-12 class="pv-card">
          <el-row class="card-title"><span>公用桩收益</span></el-row>
          <PieChart pId="chartCurvesCommon" :pResize="chartResize" pStyle="width: 100%; height: 100%;" :pOption="optionCurvesCommon"></PieChart>
        </dv-border-box-12>
      </el-col>
    </el-row>
    <el-row class="height-50" :gutter="10">
      <!-- 充电桩台账 -->
      <dv-border-box-12 class="pv-card">
        <el-row class="card-title"><span>充电桩台账</span></el-row>
        <el-row class="title-fifth color-white opacity-75 mt-10">
          <el-form ref="formSearch" :model="formSearch" label-width="100px" size="mini">
            <el-row>
              <el-col :span="3">
                <el-form-item label="设备名称:">
                  <el-input v-model="formSearch.deviceName" clearable placeholder="请输入设备名称"/>
                </el-form-item>
              </el-col>
              <el-col :span="3">
                <el-form-item label="充电桩类型:">
                  <el-select v-model="formSearch.chargingPileType" placeholder="请选择充电桩类型">
                    <el-option label="全部" value="全部"></el-option>
                    <el-option label="自用桩" value="1801"></el-option>
                    <el-option label="公用桩" value="1802"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="3">
                <el-form-item label="资产编号:">
                  <el-input v-model="formSearch.assetNumber" clearable placeholder="请输入资产编号"/>
                </el-form-item>
              </el-col>
              <el-col :span="3">
                <el-form-item label="设备型号:">
                  <el-input v-model="formSearch.equipmentModel" clearable placeholder="请输入设备型号"/>
                </el-form-item>
              </el-col>
              <el-col :span="3">
                <el-form-item label="设备编号:">
                  <el-input v-model="formSearch.equipmentType" clearable placeholder="请输入设备编号"/>
                </el-form-item>
              </el-col>
              <el-col :span="3">
                <el-form-item label="生产厂家:">
                  <el-input v-model="formSearch.factory" clearable placeholder="请输入生产厂家"/>
                </el-form-item>
              </el-col>
              <el-button class="height-28p ml-20" type="primary" size="mini" :loading="false" @click="updateTablePileAccount">查询</el-button>
              <el-button class="height-28p ml-20" type="primary" size="mini" :loading="false" @click="resetForm">重置</el-button>
            </el-row>
          </el-form>
        </el-row>
        <el-row class="pv-table">
          <TableSource pShowNumber="true" :tableData="tablePileAccount" :header="headerPileAccount" :pStyle="showPage" :total="page.total"></TableSource>
        </el-row>
      </dv-border-box-12>
    </el-row>
  </div>
</template>

<script>
import PieChart from '@/views/detection/components/pieChart.vue';
import Monitor from '@/api/carbon/monitor';
import {colorPaletteOptimization, optionCurves} from "@/api/carbon/option";
import TableSource from "@/views/detection/components/table";
import {monthStartDay, parseTime,nextDay} from "@/utils/cem";

export default {
  components: {PieChart, TableSource},
  data() {
    return {
      chartResize: 1, // 更新chart的size
      xAxis: [], // X轴坐标
      optionCurvesSelf: JSON.parse(JSON.stringify(optionCurves)),
      optionCurvesCommon: JSON.parse(JSON.stringify(optionCurves)),
      formSearch: {deviceName: '', chargingPileType: '全部', assetNumber: '', equipmentModel: '', equipmentType: '', factory: '',},
      headerPileAccount: [
        {id: 'deviceName', name: '设备名称'},
        {id: 'chargingPileType', name: '充电桩类型'},
        {id: 'assetNumber', name: '资产编号'},
        {id: 'equipmentModel', name: '设备型号'},
        {id: 'equipmentType', name: '设备编号'},
        {id: 'factory', name: '生产厂家'},
        {id: 'productionDate', name: '出厂日期'},
        {id: 'commissioningDate', name: '投产日期'},
        {id: 'accElec', name: '累计电量(kW·h)'},
        {id: 'elecCharge', name: '累计电费(kW·h)'},
        {id: 'ceValue', name: '累计碳排(kgCO₂)'},
        {id: 'accRevenue', name: '累计营收(元)'},
        {id: 'ceReduction', name: '累计减排(kgCO₂)'},
      ],
      showPage: '0',
      page: {
        total: null
      },
      tablePileAccount: [],
    }
  },
  mounted() {
    this.initXAxis()

    // 自用桩减排
    this.optionCurvesSelf.color = [colorPaletteOptimization[1]]
    this.optionCurvesSelf.grid = {top: '15%', right: '5%', bottom: '10%', left: '5%',}
    this.optionCurvesSelf.xAxis[0].data = this.xAxis
    this.optionCurvesSelf.xAxis[0].axisLabel.interval = 1
    this.optionCurvesSelf.xAxis[0].boundaryGap = false
    this.optionCurvesSelf.legend[0].right = '1%'
    // this.optionCurvesSelf.legend[0].data = ['等效减排']
    this.optionCurvesSelf.yAxis[0].name = 'kgCO₂'
    this.optionCurvesSelf.yAxis[0].scale = true

    // 公用桩收益
    this.optionCurvesCommon.color = [colorPaletteOptimization[2]]
    this.optionCurvesCommon.grid = {top: '15%', right: '5%', bottom: '10%', left: '5%',}
    this.optionCurvesCommon.xAxis[0].data = this.xAxis
    this.optionCurvesCommon.xAxis[0].boundaryGap = false
    this.optionCurvesCommon.xAxis[0].axisLabel.interval = 1
    this.optionCurvesCommon.legend[0].right = '1%'
    // this.optionCurvesCommon.legend[0].data = ['公共桩收益']
    this.optionCurvesCommon.yAxis[0].name = '元'
    this.optionCurvesCommon.yAxis[0].scale = true

    this.updateCurves() // 更新自用桩减排效益、公用桩收益曲线
    this.updateTablePileAccount() // 更新光伏台账信息
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
    resetXAxis: function (xAxis) {
      // 重新组织X轴数据，将2022-02-01修改为01显示
      let x = []
      for (let day of xAxis) {
        // let keys = day.split('-')
        // if (keys.length === 3) {
        //   keys = keys[1] + '-' + keys[2]
        // }

        x.push(day)
      }

      return x
    },
    updateCurves: function () {
      let _query = {startTime: parseTime(nextDay(-7, new Date()), '{y}-{m}-{d}'), endTime: parseTime(nextDay(-1, new Date()), '{y}-{m}-{d}')}
      // 更新自用桩减排效益、公用桩收益曲线
      Monitor.getPileData(_query).then(res => {
        if (res === undefined || res === null || res['code'] !== 200) {
          return
        }

        let _data = res['data']
        if (_data === undefined || _data === null) {
          return
        }

        let _seriesZ = {
          name: _data['yAxisZ'].name,
          type: 'line',
          smooth: true,
          smoothMonotone: 'x',
          cursor: 'pointer',
          showSymbol: false,
          data: _data['yAxisZ'].value,
          lineStyle: {
            shadowColor: 'rgba(126,199,255,1)',
            shadowBlur: 10,
          },
        }

        this.optionCurvesSelf.xAxis[0].data = this.resetXAxis(_data['xAxis'])
        this.optionCurvesSelf.series[0] = _seriesZ
        this.optionCurvesSelf.legend[0].data = ['等效减排']

        let _seriesG = {
          name: _data['yAxisG'].name,
          type: 'line',
          smooth: true,
          smoothMonotone: 'x',
          cursor: 'pointer',
          showSymbol: false,
          data: _data['yAxisG'].value,
          lineStyle: {
            shadowColor: 'rgba(126,199,255,1)',
            shadowBlur: 10,
          },
        }

        this.optionCurvesCommon.xAxis[0].data = this.resetXAxis(_data['xAxis'])
        this.optionCurvesCommon.series[0] = _seriesG
        this.optionCurvesCommon.legend[0].data = ['公共桩收益']
      })
    },
    updateTablePileAccount: function () {
      // 更新充电桩台账信息
      let _formSearch = JSON.parse(JSON.stringify(this.formSearch))
      if (_formSearch.chargingPileType === '全部') {
        _formSearch.chargingPileType = ''
      }

      Monitor.getPileAccount(_formSearch).then(res => {
        if (res === undefined || res === null) {
          return
        }

        let data = res['rows']
        if (data === undefined || data === null) {
          return
        }

        // 组织各用电类型表格数据
        this.tablePileAccount = data
        this.page.total = res['total']
      })
    },
    resetForm: function () {
      // 重置搜索条件
      this.formSearch = {deviceName: '', chargingPileType: '全部', assetNumber: '', equipmentModel: '', equipmentType: '', factory: '',}
      this.updateTablePileAccount()
    },
  }
}
</script>
<style lang="less" scoped>
.container {
  height: 100%;

  .height-28p {
    height: 28px;
  }

  .height-50 {
    height: calc(50% - 0px);
  }

  .height-100 {
    height: calc(100% - 10px);
  }

  .card-title {
    height: 16px;
    margin-left: 10px;
    line-height: 16px;
    padding-left: 10px;
    border-left: 4px solid #308EC1;
  }

  .pv-card {
    padding: 15px;
  }

  .pv-table {
    height: calc(100% - 60px);
  }

  /deep/ .el-input__inner {
    height: 28px;
    color: #FFF;
    padding-left: 5px;
    font-family: PingFangSC-Regular, serif;
    border: 1px solid #0095FF;
    background-color: rgba(222, 241, 253, 0.1);
  }

  /deep/ .el-input__icon {
    line-height: 28px;
  }

  /deep/ .el-form-item__label {
    color: #FFF;
    font-weight: 500;
    font-family: PingFangSC-Regular, serif;
  }
}
</style>
