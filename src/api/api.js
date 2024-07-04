/*
 * @Author: ybf
 * @Date: 2023-11-08 10:06:10
 * @LastEditTime: 2023-11-29 17:39:12
 * @Description: 描述
 * Copyright (c) 2023 by 慧能分享, All Rights Reserved.
 */
let api = {
    getHomePageCarbonEmissionData: "/carbon/statisticsSummaryData/getHomePageCarbonEmissionData",
    getSpaceCarbonOrElectricityTypeProportion: "/carbon/statisticsSummaryData/getSpaceCarbonOrElectricityTypeProportion",
    getEnergyConsumptionAlarmData: "/carbon/energyConsumptionAlarmData/getEnergyConsumptionAlarmData",
    optionData: "/carbon/optionData",
    timeData: "/carbon/timeData",
    login: '/api/auth/token/access',
    byPage: '/api/iot-scada/iot/realTime/object/total/byPage',
    byCodeTime: '/api/history-admin/his/statisData/byCodeTime',
    drawWiringDiagramInfo: '/api/iot-admin/iot/drawWiringDiagramInfo/',
    drawWiringDownload: '/api/iot-admin/iot/drawWiringDiagramInfo/download/',
    byKeys: '/api/iot-scada/iot/realTime/rdbdata/byKeys',
    getControlStatCurveData: '/api/iot-scada/op/getControlStatCurveData',
    getControlStatTimeTypeData: '/api/iot-scada/op/getControlStatTimeTypeData',
    getObject: '/api/iot-admin/iot/object/',
    byType:'/api/iot-admin/iot/object/byType',
    getDataByAtrbIds:'/api/history-admin/his/objectData/getDataByAtrbIds/',
    objectGetDataByAtrbIds:'/api/history-admin/his/objectDataMostvalue/getDataByAtrbIds',
    iotScada:'/api/iot-scada/op/',
}

let biz_api = [
    '/api/auth/token/access',
    "/api/auth/pmsn/user",
    '/api/iot-scada/iot/realTime/object/total/byPage',
    '/logout',
    '/api/history-admin/his/statisData/byCodeTime',
    '/api/auth/token/remove',
    '/api/iot-admin/iot/drawWiringDiagramInfo/',
    '/api/iot-admin/iot/drawWiringDiagramInfo/download/',
    '/api/iot-scada/iot/realTime/rdbdata/byKeys',
    '/api/iot-scada/op/getControlStatCurveData',
    '/api/iot-scada/op/getControlStatTimeTypeData',
    '/api/iot-admin/iot/object/',
    '/api/iot-admin/iot/object/byType',
    '/api/history-admin/his/objectData/getDataByAtrbIds/',
    '/api/history-admin/his/objectDataMostvalue/getDataByAtrbIds',
    '/api/iot-scada/op/',
]

let base_yapi = [
    "/carbon/statisticsSummaryData/getHomePageCarbonEmissionData",
    "/carbon/statisticsSummaryData/getSpaceCarbonOrElectricityTypeProportion",
    "/carbon/energyConsumptionAlarmData/getEnergyConsumptionAlarmData",
    "/carbon/optionData",
    "/carbon/timeData",
    "/carbon/statisticsSummaryData/getSummaryConsumptionOrCarbonData",
    "/carbon/weatherDaily/list"
]

export { base_yapi, biz_api }
export default Object.assign(api)
