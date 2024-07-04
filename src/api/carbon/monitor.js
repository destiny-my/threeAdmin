import request from '@/utils/request'

// 监测数据接口实体类
class Monitor {
  // 查询天气数据
  getWeather(date) {
    return request({
      url: '/carbon/weatherDaily/list?weatherDate=' + date,
      method: 'post'
    })
  }

  // 查询首页数据
  getData(dataType, area) {
    area = encodeURIComponent(area)
    return request({
      url: '/carbon/statisticsSummaryData/getHomePageCarbonEmissionData?area=' + area + '&returnDatatype=' + dataType,
      method: 'get'
    })
  }

  // 查询查询空间碳占比数据
  getSpaceRatioData(cycleType, dataType, returnDatatype, dayTime) {
    let url = '/carbon/statisticsSummaryData/getSpaceCarbonOrElectricityTypeProportion?dataType=' + dataType + '&returnDatatype=' + returnDatatype
    if (cycleType !== null) {
      url += '&cycleType=' + cycleType
    }

    if (dayTime !== null) {
      url += '&dayTime=' + dayTime
    }

    return request({
      url: url,
      method: 'get'
    })
  }

  // 查询碳排同比分析数据
  getYoyIntensityData(area) {
    area = encodeURIComponent(area)
    return request({
      url: '/carbon/statisticsSummaryData/getCarbonYoyAnalysisInfo?area=' + area,
      method: 'get'
    })
  }

  // 查询能碳绩效数据
  getPerformanceData(area) {
    area = encodeURIComponent(area)
    return request({
      url: '/carbon/statisticsSummaryData/getEnergyCarbonPerformanceInfo?area=' + area,
      method: 'get'
    })
  }

  // 查询光伏台账信息
  getPVAccount(query) {
    return request({
      url: '/carbon/photovoltaicDevice/list',
      method: 'get',
      params: query
    })
  }

  // 查询光伏减排效益曲线
  getPVData(query) {
    return request({
      url: '/carbon/hisPhotovoltaicDeviceData/getPhotovoltaicEmissionReductionData',
      method: 'get',
      params: query
    })
  }

  // 查询充电桩台账
  getPileAccount(query) {
    return request({
      url: '/carbon/chargingPileDevice/list',
      method: 'get',
      params: query
    })
  }

  // 查询充电桩类型碳排分析曲线
  getPileData(query) {
    return request({
      url: '/carbon/hisChargingPileDeviceData/getChargingPileTypeCarbonAnalysisData',
      method: 'get',
      params: query
    })
  }

  //碳排计算工具
  carbonEmissionToolCalculation(query) {
    return request({
      url: '/carbon/statisticsSummaryData/carbonEmissionToolCalculation',
      method: 'get',
      params: query
    })
  }
}


export default new Monitor();
