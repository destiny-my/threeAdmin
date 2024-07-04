import request from '@/utils/request'

// 查询字典数据列表
export function overviewEnergyConsumptionInfo(query) {
  return request({
    url: '/carbon/statisticsSummaryData/getOverviewEnergyConsumptionInfo',
    method: 'get',
    params: query
  })
}
