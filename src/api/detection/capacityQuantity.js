import request from '@/utils/request'


// 容需建议
export function measurementAlarmData(query) {
    return request({
        url: '/carbon/electricityAlarmData/getElectricityMeasurementAlarmData',
        method: 'get',
        params: query
    })
}


// 平均容需比前TOP5
export function transformerAvgData(query) {
    return request({
        url: '/carbon/statisticsTransformerAttrData/getStatisticsTransformerAvgData',
        method: 'get',
        params: query
    })
}



// 容需曲线 
export function summaryAnalysisData(query) {
    return request({
        url: '/carbon/statisticsTransformerAttrData/getStatisticsTransformerSummaryAnalysisData',
        method: 'get',
        params: query
    })
}


//今日工况分析占比数据
export function ConditionProportionData(query) {
    return request({
        url: '/carbon/statisticsTransformerAttrData/getWorkingConditionProportionData',
        method: 'get',
        params: query
    })
}



// 获取配电室
export function selectDictDataByDictType(query) {
    return request({
        url: '/system/dict/data/selectDictDataByDictType',
        method: 'get',
        params: query
    })
}

// 获取变压器
export function transformerAttrInfo(query) {
    return request({
        url: '/carbon/transformerDevice/getTransformerAttrInfo',
        method: 'get',
        params: query
    })
}

// 获取变压器
export function transformerAttrAnalysisData(data) {
    return request({
        url: '/carbon/statisticsTransformerAttrData/getStatisticsTransformerAttrAnalysisData',
        method: 'post',
        data: data
    })
}


// 修改设备计算模板
export function updateSysCalculateTemplate(data) {
    return request({
        url: '/calculate/sysCalculateTemplate/edit',
        method: 'post',
        data: data
    })
}

//月度电费分析
export function monthlyBillsAnalysisData(query) {
    return request({
        url: '/carbon/statisticsSummaryData/getElectricityMonthlyBillsAnalysisData',
        method: 'get',
        params: query
    })
}

//分时用电统计
export function electricityTariffStatisticsData(query) {
    return request({
        url: '/carbon/statisticsSummaryData/getCurrentDayElectricityTariffStatisticsData',
        method: 'get',
        params: query
    })
}

//电费月度账单
export function ElectricityMonthlyBillsData(query) {
    return request({
        url: '/carbon/statisticsSummaryData/getElectricityMonthlyBillsData',
        method: 'get',
        params: query
    })
}