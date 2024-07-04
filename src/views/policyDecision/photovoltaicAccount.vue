<template xmlns="http://www.w3.org/1999/html">
  <!-- 光伏台账 -->
  <div class="container title-fourth">
    <el-row class="height-50" :gutter="10">
      <!-- 光伏减排效益 -->
      <dv-border-box-12 class="pv-card height-25">
        <el-row class="card-title"><span>光伏减排效益</span></el-row>
        <PieChart pId="chartCurvesCarbon" :pResize="chartResize" pStyle="width: 100%; height: 100%;" :pOption="optionCurvesCarbon"></PieChart>
      </dv-border-box-12>
    </el-row>
    <el-row class="height-50 mt-10" :gutter="10">
      <!-- 光伏台账 -->
      <dv-border-box-12 class="pv-card height-25">
        <el-row class="card-title"><span>光伏台账</span></el-row>
        <el-row class="title-fifth color-white opacity-75 mt-10">
          <el-form ref="formSearch" :model="formSearch" label-width="100px" size="mini">
            <el-row>
              <el-col :span="4">
                <el-form-item label="设备名称:">
                  <el-input v-model="formSearch.deviceName" clearable placeholder="请输入设备名称"/>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="资产编号:">
                  <el-input v-model="formSearch.assetNumber" clearable placeholder="请输入资产编号"/>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="设备型号:">
                  <el-input v-model="formSearch.equipmentModel" clearable placeholder="请输入设备型号"/>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="设备编号:">
                  <el-input v-model="formSearch.factoryNo" clearable placeholder="请输入设备编号"/>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="生产厂家:">
                  <el-input v-model="formSearch.factory" clearable placeholder="请输入生产厂家"/>
                </el-form-item>
              </el-col>
              <el-button class="height-28p ml-20" type="primary" size="mini" :loading="false" @click="updateTablePVAccount">查询</el-button>
              <el-button class="height-28p ml-20" type="primary" size="mini" :loading="false" @click="resetForm">重置</el-button>
            </el-row>
          </el-form>
        </el-row>
        <el-row class="pv-table">
          <TableSource pShowNumber="true" :tableData="tablePVAccount" :header="headerPVAccount" :pStyle="showPage" :total="page.total"></TableSource>
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
import {nextDay, parseTime} from "@/utils/cem";

export default {
  components: {PieChart, TableSource},
  data() {
    return {
      chartResize: 1, // 更新chart的size
      xAxis: [], // X轴坐标
      optionCurvesCarbon: JSON.parse(JSON.stringify(optionCurves)),
      formSearch: {deviceName: '', assetNumber: '', equipmentModel: '', factoryNo: '', factory: '',},
      headerPVAccount: [
        {id: 'deviceName', name: '设备名称'},
        {id: 'assetNumber', name: '资产编号'},
        {id: 'equipmentModel', name: '设备型号'},
        {id: 'factoryNo', name: '设备编号'},
        {id: 'factory', name: '生产厂家'},
        {id: 'productionDate', name: '出厂日期'},
        {id: 'commissioningDate', name: '投产日期'},
        {id: 'power', name: '最大功率(kW)'},
        {id: 'workTemperature', name: '额定工作温度(℃)'},
        {id: 'workElectricity', name: '工作电流(A)'},
        {id: 'workVoltage', name: '工作电压(V)'},
      ],
      showPage: '0',
      page: {
        total: null
      },
      tablePVAccount: [],
    }
  },
  mounted() {
    this.initXAxis()

    this.optionCurvesCarbon.color = [colorPaletteOptimization[1]]
    this.optionCurvesCarbon.grid = {top: '15%', right: '3%', bottom: '10%', left: '3%',}
    this.optionCurvesCarbon.xAxis[0].axisLabel.interval = 0
    this.optionCurvesCarbon.xAxis[0].boundaryGap = false
    this.optionCurvesCarbon.legend[0].right = '1%'
    // this.optionCurvesCarbon.legend[0].data = ['等效减排']
    this.optionCurvesCarbon.yAxis[0].name = 'kgCO₂'
    this.optionCurvesCarbon.yAxis[0].scale = true

    this.updateCurvesCarbon() // 更新光伏减排效益曲线
    this.updateTablePVAccount() // 更新光伏台账信息
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
    updateCurvesCarbon: function () {
      let _query = {startTime: parseTime(nextDay(-7, new Date()), '{y}-{m}-{d}'), endTime: parseTime(nextDay(-1, new Date()), '{y}-{m}-{d}')}
      Monitor.getPVData(_query).then(res => {
        // 更新光伏减排效益曲线
        // Monitor.getPVData().then(res => {
        if (res === undefined || res === null || res['code'] !== 200) {
          return
        }

        let _data = res['data']
        if (_data === undefined || _data === null) {
          return
        }
        let _series = {
          name: _data['yAxis'].name,
          type: 'line',
          smooth: true,
          smoothMonotone: 'x',
          cursor: 'pointer',
          showSymbol: false,
          data: _data['yAxis'].value,
          lineStyle: {
            shadowColor: 'rgba(126,199,255,1)',
            shadowBlur: 10,
          },
        }

        this.optionCurvesCarbon.xAxis[0].data = this.resetXAxis(_data['xAxis'])
        this.optionCurvesCarbon.series[0] = _series
        this.optionCurvesCarbon.legend[0].data = ['等效减排']

      })
    },
    updateTablePVAccount: function () {
      // 更新光伏台账信息
      Monitor.getPVAccount(this.formSearch).then(res => {
        if (res === undefined || res === null) {
          return
        }

        let data = res['rows']
        if (data === undefined || data === null) {
          return
        }

        // 组织各用电类型表格数据
        this.tablePVAccount = data
        this.page.total = res['total']
      })
    },
    resetForm: function () {
      // 重置搜索条件
      this.formSearch = {deviceName: '', assetNumber: '', equipmentModel: '', factoryNo: '', factory: '',}
      this.updateTablePVAccount()
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
    height: calc(50% - 5px);
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
