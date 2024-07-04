<template>
  <!-- 总览 -->
  <div class="container">
    <!-- 总览信息 -->
    <el-row :gutter="12" class="overview">
      <!-- 能耗总览信息 -->
      <el-col :span="18">
        <el-row :gutter="12">
          <el-col :span="6">
            <dv-border-box-12 class="overview-card">
              <div class="card-title">总碳排</div>
              <div class="content-text">
                <span class="color-carbon title-second">{{ energyOverview.summary.ceVal | keepDecimal }}</span>
                <span class="title-fifth opacity-75"> kgCO₂</span>
              </div>
              <div class="card-content">
                <div>
                  <div>今日累计</div>
                  <div><span class="title-fifth opacity-75">环比</span><span class="ml-10 color-mom">{{ energyOverview.summary.mom | keepDecimal }}%</span></div>
                  <div><span class="title-fifth opacity-75">同比</span><span class="ml-10 color-yoy">{{ energyOverview.summary.yoy | keepDecimal }}%</span></div>
                </div>
              </div>
            </dv-border-box-12>
          </el-col>
          <el-col :span="6">
            <dv-border-box-12 class="overview-card">
              <div class="card-title">用电</div>
              <div class="content-text">
                <span class="color-val title-second">{{ energyOverview.electric.tVal | keepDecimal }}</span>
                <span class="title-fifth opacity-75"> kW·h</span>
              </div>
              <div class="card-content">
                <div>
                  <span>等效碳排 </span><br/>
                  <span class="color-carbon title-second">{{ energyOverview.electric.ceVal | keepDecimal }}</span>
                  <span class="title-fifth opacity-75"> kgCO₂</span>
                </div>
                <div class="right">
                  <div>今日累计</div>
                  <div><span class="title-fifth opacity-75">环比</span><span class="ml-10 color-mom">{{ energyOverview.electric.mom | keepDecimal }}%</span></div>
                  <div><span class="title-fifth opacity-75">同比</span><span class="ml-10 color-yoy">{{ energyOverview.electric.yoy | keepDecimal }}%</span></div>
                </div>
              </div>
            </dv-border-box-12>
          </el-col>
          <el-col :span="6">
            <dv-border-box-12 class="overview-card">
              <div class="card-title">用水</div>
              <div class="content-text">
                <span class="color-val title-second">{{ energyOverview.water.tVal | keepDecimal }}</span>
                <span class="title-fifth opacity-75"> m³</span>
              </div>
              <div class="card-content">
                <div>
                  <span>等效碳排 </span><br/>
                  <span class="color-carbon title-second">{{ energyOverview.water.ceVal | keepDecimal }}</span>
                  <span class="title-fifth opacity-75"> kgCO₂</span>
                </div>
                <div class="right">
                  <div>今日累计</div>
                  <div><span class="title-fifth opacity-75">环比</span><span class="ml-10 color-mom">{{ energyOverview.water.mom | keepDecimal }}%</span></div>
                  <div><span class="title-fifth opacity-75">同比</span><span class="ml-10 color-yoy">{{ energyOverview.water.yoy | keepDecimal }}%</span></div>
                </div>
              </div>
            </dv-border-box-12>
          </el-col>
          <el-col :span="6">
            <dv-border-box-12 class="overview-card">
              <div class="card-title">用气</div>
              <div class="content-text">
                <span class="color-val title-second">{{ energyOverview.gas.tVal | keepDecimal }}</span>
                <span class="title-fifth opacity-75"> m³</span>
              </div>
              <div class="card-content">
                <div>
                  <span>等效碳排 </span><br/>
                  <span class="color-carbon title-second">{{ energyOverview.gas.ceVal | keepDecimal }}</span>
                  <span class="title-fifth opacity-75"> kgCO₂</span>
                </div>
                <div class="right">
                  <div>今日累计</div>
                  <div><span class="title-fifth opacity-75">环比</span><span class="ml-10 color-mom">{{ energyOverview.gas.mom | keepDecimal }}%</span></div>
                  <div><span class="title-fifth opacity-75">同比</span><span class="ml-10 color-yoy">{{ energyOverview.gas.yoy | keepDecimal }}%</span></div>
                </div>
              </div>
            </dv-border-box-12>
          </el-col>
        </el-row>
      </el-col>
      <!-- 占比分析 -->
      <el-col :span="6">
        <dv-border-box-12 class="overview-card">
          <div class="card-title">占比分析</div>
          <PieChart pId="chartRatio" pStyle="width: 100%; height: 120%; margin-top: -20px;" :pOption="optionRatio"></PieChart>
        </dv-border-box-12>
      </el-col>
    </el-row>
    <!-- 月度分析、定额指标信息 -->
    <el-row :gutter="12" class="monthly">
      <!-- 月度分析 -->
      <el-col class="height-100" :span="12">
        <dv-border-box-12 class="monthly-card">
          <div class="card-title">月度分析</div>
          <PieChart pId="chartMonthly" pStyle="width: 100%; height: 100%;" :pOption="optionMonthly"></PieChart>
        </dv-border-box-12>
      </el-col>
      <!-- 碳排额定 -->
      <el-col class="height-100" :span="12">
        <dv-border-box-12 class="monthly-card">
          <div class="card-title">
            <span>定额指标</span>
            <span class="opacity-75 title-fifth fr ml-10">单位：kgCO₂</span>
            <el-radio-group class="fr" v-model="quotaCycle" @change="updateQuota">
              <el-radio class="mr-5 pr-5 color-white" label='day'>日</el-radio>
              <el-radio class="mr-5 pr-5 color-white" label="week">周</el-radio>
              <el-radio class="mr-5 pr-5 color-white" label="month">月</el-radio>
            </el-radio-group>
          </div>
          <el-col class="height-100" :span="8">
            <PieChart pId="chartQuotaElectric" pStyle="width: 100%; height: 100%;" :pOption="optionQuotaElectric"></PieChart>
          </el-col>
          <el-col class="height-100" :span="8">
            <PieChart pId="chartQuotaWater" pStyle="width: 100%; height: 100%;" :pOption="optionQuotaWater"></PieChart>
          </el-col>
          <el-col class="height-100" :span="8">
            <PieChart pId="chartQuotaGas" pStyle="width: 100%; height: 100%;" :pOption="optionQuotaGas"></PieChart>
          </el-col>
        </dv-border-box-12>
      </el-col>
    </el-row>
    <!-- 排名信息 -->
    <el-row class="rank" :gutter="12">
      <el-col class="height-100" :span="6" v-for="(item, index) in rankData" :key="index">
        <dv-border-box-12 class="rank-card">
          <div class="card-title">
            <span>{{ item.name }}</span>
            <span class="opacity-75 title-fifth fr">单位：kgCO₂</span>
            <el-radio-group class="fr" v-model="item.radioModel" @change="updateRank(item.dataType, item.rDataType)">
              <el-radio class="mr-5 pr-5 color-white" label='day'>日</el-radio>
              <el-radio class="mr-5 pr-5 color-white" label="week">周</el-radio>
              <el-radio class="mr-5 pr-5 color-white" label="month">月</el-radio>
            </el-radio-group>
          </div>
          <Regions class="rank-card-content" :progressData="item.data" :titleData="item.title"/>
        </dv-border-box-12>
      </el-col>
    </el-row>
  </div>
</template>
<script>

import Regions from "./components/regions.vue";
import Monitor from "@/api/carbon/monitor";
import Analyse from "@/api/carbon/analyse";
import PieChart from "./components/pieChart.vue";
import {colorAllProp, colorPalette, optionBar, optionPanel, optionPie} from "@/api/carbon/option";
import {compareData} from "@/utils/cem";

export default {
  components: {Regions, PieChart},
  data() {
    return {
      energyOverview: {
        summary: {yoy: 0, mom: 0, ceVal: 0, tVal: 0,},
        electric: {yoy: 0, mom: 0, ceVal: 0, tVal: 0,},
        water: {yoy: 0, mom: 0, ceVal: 0, tVal: 0,},
        gas: {yoy: 0, mom: 0, ceVal: 0, tVal: 0,},
      }, // 总览
      optionRatio: JSON.parse(JSON.stringify(optionPie)), // 占比
      optionMonthly: JSON.parse(JSON.stringify(optionBar)), // 月度分析
      quotaCycle: 'day', // 定额周期
      optionQuotaElectric: JSON.parse(JSON.stringify(optionPanel)), // 电定额
      optionQuotaWater: JSON.parse(JSON.stringify(optionPanel)), // 水定额
      optionQuotaGas: JSON.parse(JSON.stringify(optionPanel)), // 气定额
      rankData: [
        {name: '各区域用电排名', dataType: 'area', rDataType: 2, radioModel: 'day', data: [], title: []},
        {name: '各区域用水排名', dataType: 'area', rDataType: 3, radioModel: 'day', data: [], title: []},
        {name: '各区域用气排名', dataType: 'area', rDataType: 4, radioModel: 'day', data: [], title: []},
        {name: '各用电类型排名', dataType: 'electric', rDataType: 2, radioModel: 'day', data: [], title: []},
      ], // 排名
    };
  },
  mounted() {
    // 使用JSON.parse(JSON.stringify(xx)深copy对象，方法不会生效，需要再次设置
    this.optionRatio.legend.formatter = (text) => {
      text = JSON.parse(text)
      return `{name|${text.name}} {value|${text.value}}`
    }

    this.updateEnergyOverview(); // 更新能耗总览数据
    this.updateMonthly(); // 更新月度数据
    this.updateQuota(); // 更新定额指标
    this.updateRank('area', 2); // 更新区域用电排名数据
    this.updateRank('area', 3); // 更新区域用水排名数据
    this.updateRank('area', 4); // 更新区域用气排名数据
    this.updateRank('electric', 2); // 更新用电类型排名数据
  },
  methods: {
    updateEnergyOverview: function () {
      // 更新能耗总览数据
      Analyse.getEnergyData(this.$buildingNo).then((res) => {
        if (res === undefined || res === null || res['code'] !== 200) {
          return;
        }

        let data = res['data'];
        if (data === undefined || data === null) {
          return;
        }

        // 更新总览数据
        this.energyOverview = data
        this.energyOverview.summary.mom = compareData(this.energyOverview.summary.mom)
        this.energyOverview.summary.yoy = compareData(this.energyOverview.summary.yoy)

        this.energyOverview.electric.mom = compareData(this.energyOverview.electric.mom)
        this.energyOverview.electric.yoy = compareData(this.energyOverview.electric.yoy)

        this.energyOverview.water.mom = compareData(this.energyOverview.water.mom)
        this.energyOverview.water.yoy = compareData(this.energyOverview.water.yoy)

        this.energyOverview.gas.mom = compareData(this.energyOverview.gas.mom)
        this.energyOverview.gas.yoy = compareData(this.energyOverview.gas.yoy)

        // 更新占比分析
        let _prop = data['proportionAnalysis']
        this.$prop100('value', _prop)
        this.optionRatio.legend.textStyle.rich.value.color = '#47E5AF'
        this.optionRatio.legend.textStyle.rich.name.width = '40'
        this.optionRatio.series[0].data = _prop.map((item, index) => {
          let _val = this.$numToFixed(item['value'])
          return {name: JSON.stringify({name: item['name'], value: _val + '%'}), value: _val}
        })

        this.optionRatio.series[0].itemStyle.color = (params) => {
          return colorAllProp[params.dataIndex]
        }

        this.optionRatio.title.text = '{a|总碳排}\n{b|' + this.$numToFixed(data.summary.ceVal) + '}'
        this.optionRatio.tooltip.formatter = (params) => {
          return `${params.marker}${JSON.parse(params.name)['name']}  ${JSON.parse(params.name)['value']}`
        }
      });
    },
    updateMonthly() {
      // 更新月度数据
      Analyse.getMonthlyData(this.$buildingNo).then((res) => {
        if (res === undefined || res === null || res['code'] !== 200) {
          return;
        }

        let data = res['data'];
        if (data === undefined || data === null) {
          return;
        }

        let series = []
        series.push({name: '电', data: data['electricYAxis'], color: colorPalette[1]})
        series.push({name: '水', data: data['waterYAxis'], color: colorPalette[2]})
        series.push({name: '气', data: data['gasYAxis'], color: colorPalette[3]})
        // this.optionMonthly.legend.data = ['电', '水', '气']
        this.optionMonthly.xAxis[0].data = data['xAxis']
        this.optionMonthly.yAxis[0].name = 'kgCO₂'
        this.optionMonthly.series = series.map(item => {
          return {
            name: item.name,
            type: 'bar',
            data: this.$dataToFixed(item.data),
            barWidth: 10,
            barGap: 0.5, //柱间距离
            itemStyle: {
              show: true,
              color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: item.color,
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
      });
    },
    updateQuota() {
      // 更新定额指标
      Analyse.getRateData(this.$buildingNo, this.quotaCycle).then((res) => {
        if (res === undefined || res === null || res['code'] !== 200) {
          return;
        }

        let data = res['data'];
        if (data === undefined || data === null) {
          return
        }

        let _val = this.$numToFixed(data.electric)
        this.optionQuotaElectric.title.text = '{a|电累计等效碳排}\n{b|' + _val + '}'
        this.optionQuotaElectric.series[0].data = [{name: '电累计等效碳排 ' + _val, value: this.$numToFixed(data.electricRate)}]

        _val = this.$numToFixed(data.water)
        this.optionQuotaWater.title.text = '{a|水累计等效碳排}\n{b|' + _val + '}'
        this.optionQuotaWater.series[0].data = [{name: '水累计等效碳排 ' + _val, value: this.$numToFixed(data.waterRate)}]

        _val = this.$numToFixed(data.gas)
        this.optionQuotaGas.title.text = '{a|气累计等效碳排}\n{b|' + _val + '}'
        this.optionQuotaGas.series[0].data = [{name: '气累计等效碳排 ' + _val, value: this.$numToFixed(data.gasRate)}]
      });
    },
    updateRank(dataType, rDataType) {
      // 1. 根据类型获取选择的周期值
      let _cycleType = 'day'
      if (dataType === 'area' && rDataType === 2) {
        _cycleType = this.rankData[0].radioModel
      } else if (dataType === 'area' && rDataType === 3) {
        _cycleType = this.rankData[1].radioModel
      } else if (dataType === 'area' && rDataType === 4) {
        _cycleType = this.rankData[2].radioModel
      } else if (dataType === 'electric' && rDataType === 2) {
        _cycleType = this.rankData[3].radioModel
      }

      // 2. 更新排名数据
      Monitor.getSpaceRatioData(_cycleType, dataType, rDataType).then((res) => {
          if (res === undefined || res === null || res['code'] !== 200) {
            return;
          }

          let _data = res['data'];
          if (_data === undefined || _data === null) {
            return;
          }
          var arrList = []
          _data.map((item) => {
            let obj = {name: item.name, proportionVal: item.proportionVal, ceValue: item.ceValue, mom: compareData(item.mom)}
            arrList.push(obj)
            return arrList
          })
          if (dataType === 'area' && rDataType === 2) {
            this.rankData[0].data = arrList
            this.rankData[0].title = [{spanData: 4, name: "区域"}, {spanData: 12, name: "占比"}, {spanData: 4, name: "用电量"}, {spanData: 4, name: "环比"}]
          } else if (dataType === 'area' && rDataType === 3) {
            this.rankData[1].data = arrList
            this.rankData[1].title = [{spanData: 4, name: "区域"}, {spanData: 12, name: "占比"}, {spanData: 4, name: "用水量"}, {spanData: 4, name: "环比"}]
          } else if (dataType === 'area' && rDataType === 4) {
            // 用气排名特殊处理，去掉为零的数据
            let _items = []
            for (const _item of arrList) {
              if (_item['proportionVal'] === 0) {
                continue
              }

              _items.push(_item)
            }

            this.rankData[2].data = _items
            this.rankData[2].title = [{spanData: 4, name: "区域"}, {spanData: 12, name: "占比"}, {spanData: 4, name: "用气量"}, {spanData: 4, name: "环比"}]
          } else if (dataType === 'electric' && rDataType === 2) {
            this.rankData[3].data = arrList
            this.rankData[3].title = [{spanData: 4, name: "区域"}, {spanData: 12, name: "占比"}, {spanData: 4, name: "用电量"}, {spanData: 4, name: "环比"}]
          }
        }
      );
    },
  },
};
</script>
<style lang="less" scoped>
.container {
  height: 100%;

  .height-100 {
    height: 100%;
  }

  .card-title {
    height: 16px;
    margin-left: 10px;
    line-height: 16px;
    padding-left: 10px;
    border-left: 4px solid #308ec1;
  }

  .overview {
    display: flex;
    align-items: center;

    .overview-card {
      justify-content: space-around;
      color: #FFF;
      height: 200px;
      padding: 15px 20px;
      background-color: rgba(7, 25, 54, 0.5);
    }

    .card-content {
      display: flex;
      justify-content: space-between;
      height: calc(100% - 70px);
      color: #FFF;
      padding: 0 10px;
      line-height: 35px;

      .right {
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }

    .content-text {
      padding: 15px 10px;
    }
  }

  .monthly {
    display: flex;
    align-items: center;
    height: calc((100% - 220px) * 0.52);
    margin-top: 10px;

    .monthly-card {
      justify-content: space-around;
      color: #FFF;
      height: 100%;
      padding: 15px 20px;
      background-color: rgba(7, 25, 54, 0.5);
    }

    .quota-card-content {
      display: flex;
      justify-content: space-around;
      height: 100%;
    }

    .card-content {
      display: flex;
      justify-content: space-between;
      height: calc(100% - 70px);
      color: #FFF;
      padding: 0 25px;
      line-height: 40px;
    }

    .content-text {
      padding: 15px 25px;
    }
  }

  .rank {
    height: calc((100% - 220px) * 0.475);
    margin-top: 10px;

    .rank-card {
      height: 100%;
      padding: 15px 20px;
      background-color: rgba(7, 25, 54, 0.5);
    }

    .rank-card-content {
      height: calc(100% - 10px);
    }
  }
}
</style>
