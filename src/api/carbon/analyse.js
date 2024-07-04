import request from '@/utils/request'

// 碳排分析
class Analyse {
  // 查询字典数据
  selectDictData(query) {
    return request({
      url: '/system/dict/data/list',
      method: 'post',
      params: query
    })
  }

  // 查询字典数据
  selectDictLabel(query) {
    return request({
      url: '/system/dict/data/selectDictLabel',
      method: 'post',
      params: query
    })
  }

  // 查询字典数据
  selectDictDataByDictType(query) {
    return request({
      url: '/system/dict/data/selectDictDataByDictType',
      method: 'get',
      params: query
    })
  }

  // 查询能耗总览数据
  getEnergyData(area) {
    area = encodeURIComponent(area)
    return request({
      url: '/carbon/statisticsSummaryData/getOverviewEnergyConsumptionInfo?area=' + area,
      method: 'get'
    })
  }

  // 查询月度分析数据
  getMonthlyData(area) {
    area = encodeURIComponent(area)
    return request({
      url: '/carbon/statisticsSummaryData/getMonthlyAnalysisInfo?area=' + area,
      method: 'get'
    })
  }

  // 查询额定数据
  getRateData(area, cycleType) {
    area = encodeURIComponent(area)
    return request({
      url: '/carbon/statisticsSummaryData/getCarbonQuotaInfo?area=' + area + '&cycleType=' + cycleType,
      method: 'get'
    })
  }

  /////////////// 用电分析 ///////////////
  // 查询区域/用电类型/用水类型/用气类型字典数据
  getAlarmConfigList(data) {
    return request({
      url: '/carbon/alarmConfig/list',
      method: 'post',
      data: data
    })
  }

  getDictTypeData(dataType) {
    return request({
      url: '/carbon/statisticsSummaryData/getDataTypeDictInfo?dataType=' + dataType,
      method: 'get'
    })
  }

  // 查询曲线数据
  getCurvesData(data) {
    return request({
      url: '/carbon/statisticsSummaryData/getSummaryConsumptionOrCarbonData',
      method: 'post',
      data: data
    })
  }

  // 容需分析-运行建议
  optSuggest(query) {
    return request({
      url: '/carbon/electricityAlarmData/getElectricityMeasurementAlarmData',
      method: 'get',
      params: query
    })
  }

  // 容需分析-容需比排名
  capacityRank(query) {
    return request({
      url: '/carbon/statisticsTransformerAttrData/getStatisticsTransformerAvgData',
      method: 'get',
      params: query
    })
  }

  // 容需分析-楼宇容需分析曲线
  capacityCurvesBuilding(query) {
    return request({
      url: '/carbon/statisticsTransformerAttrData/getStatisticsTransformerSummaryAnalysisData',
      method: 'get',
      params: query
    })
  }

  // 容需分析-根据配电室获取所属变压器
  transformerByRoom(query) {
    return request({
      url: '/carbon/transformerDevice/getTransformerAttrInfo',
      method: 'get',
      params: query
    })
  }

  // 容需分析-设备容需分析曲线
  capacityCurvesDev(query) {
    return request({
      url: '/carbon/statisticsTransformerAttrData/getStatisticsTransformerAttrAnalysisData',
      method: 'post',
      data: query
    })
  }

  // 负载率分析-工况分析
  loadRateOpt(query) {
    return request({
      url: '/carbon/statisticsTransformerAttrData/getWorkingConditionProportionData',
      method: 'get',
      params: query
    })
  }

  // 电费分析-月度电费分析
  chargeMonthly(query) {
    return request({
      url: '/carbon/statisticsSummaryData/getElectricityMonthlyBillsAnalysisData',
      method: 'get',
      params: query
    })
  }

  // 电费分析-本月电费分析
  electricityTariffStatisticsData(query) {
    return request({
      url: '/carbon/statisticsSummaryData/getCurrentDayElectricityTariffStatisticsData',
      method: 'get',
      params: query
    })
  }

  // 电费分析-月度电费账单
  electricalBill(query) {
    return request({
      url: '/carbon/statisticsSummaryData/getElectricityMonthlyBillsData',
      method: 'get',
      params: query
    })
  }

  // 碳排优化-获取峰谷优化数据
  getOptimizePeakValley(query) {
    return request({
      url: '/carbon/power/getOptimizePeakValley',
      method: 'post',
      params: query
    })
  }

  // 碳排优化-获取多能优化数据
  getOptimizeMulti(query) {
    return request({
      url: '/carbon/power/getOptimizeMulti',
      method: 'post',
      params: query
    })
  }

  // 碳排优化-获取负荷数据
  getLoadData(query) {
    return request({
      url: '/carbon/power/getLoadData',
      method: 'post',
      params: query
    })
  }

  // 碳排优化-获取运行建议
  getSuggest(query) {
    return request({
      url: '/carbon/electricityAlarmData/getElectricityMeasurementAlarmData',
      method: 'get',
      params: query
    })
  }

  // 碳排优化-保存运行建议
  saveSuggest(query) {
    return request({
      url: '/carbon/electricityAlarmData/save',
      method: 'post',
      data: query
    })
  }

  // 获取典型、同期、多能数据
  getMultiEnergyPower(measType, resType, createDate) {
    let _query = ''
    if (measType !== undefined && measType !== null && measType !== '') {
      _query = 'measType=' + measType
    }

    if (resType !== undefined && resType !== null && resType !== '') {
      if (_query !== '') {
        _query += '&'
      }

      _query += 'resourceType=' + resType
    }

    if (createDate !== undefined && createDate !== null && createDate !== '') {
      if (_query !== '') {
        _query += '&'
      }

      _query += 'createDate=' + createDate
    }

    return request({
      url: '/carbon/power/list?' + _query,
      method: 'post',
    })
  }

  // 获取收益数据
  getMultiEnergyCost(query) {
    return request({
      url: '/carbon/cost/list',
      method: 'post',
      params: query
    })
  }

  // 获取历史收益数据
  getMultiEnergyHistoryCost(optimizeType, startDate, endDate) {
    return request({
      url: '/carbon/cost/historyCost?optimizeType=' + optimizeType + '&startDate=' + startDate + '&endDate=' + endDate,
      method: 'post',
    })
  }

  // 峰谷优化接口
  peakValleyRegulation(data) {
    return request({
      url: '/optimize/peak_valley_regulation',
      method: 'post',
      data: data
    })
  }

  // 多能优化接口
  multiEnergyRegulation(data) {
    return request({
      url: '/optimize/multi_energy_regulation',
      method: 'post',
      data: data
    })
  }

  // 峰谷优化完成后生成功率曲线、碳排曲线、成本等信息
  electCalData(query) {
    return request({
      url: '/carbon/power/elecCalData',
      method: 'get',
      params: query
    })
  }

  // 获取指定日期的优化策略
  getStrategyData(query) {
    return request({
      url: '/carbon/multiEnergyStrategy/getStrategyData',
      method: 'get',
      params: query
    })
  }

  // 更新指定日期的优化策略
  updateStrategy(data) {
    return request({
      url: '/carbon/multiEnergyStrategy/save',
      method: 'post',
      data: data
    })
  }

  // 能耗告警信息
  EnergyConsumptionAlarmData(query) {
    return request({
      url: '/carbon/energyConsumptionAlarmData/getEnergyConsumptionAlarmData',
      method: 'get',
      params: query
    })
  }
}

export default new Analyse();
