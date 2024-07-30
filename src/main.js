import Vue from 'vue'

import Cookies from 'js-cookie'
import 'amfe-flexible'
import 'normalize.css/normalize.css' // a modern alternative to CSS resets
import Element from 'element-ui'
import './assets/styles/element-variables.scss'

import '@/assets/styles/index.scss' // global css
import '@/assets/styles/cem.scss' // css
import App from './App'
import store from './store'
import router from './router'
import permission from './directive/permission'

import './assets/icons' // icon
import './permission' // permission control
import { addDateRange, dataToFixed, download, numToFixed, parseTime, prop100, } from '@/utils/cem'
import Pagination from '@/components/Pagination'
import * as echarts from 'echarts'
import dataV from '@jiaminghi/data-view'
import * as THREE from 'three'
import vueSeamlessScroll from 'vue-seamless-scroll'
import modules from "@/components/three/modules/index.js";
import EcahrtOption from "@/components/VueEhcartsOption/index.js";
// import VueCesium from 'vue-cesium'
import VueTypedJs from 'vue-typed-js'

import ECharts from 'vue-echarts'
// 接口列表
import api from '@/api/api'
window.api = api
import {
  httpGet,
  httpPost,
  httpPut,
  httpDel
} from '@/utils/request'

Vue.use(VueTypedJs)
Vue.use(dataV)
Vue.use(vueSeamlessScroll)


// 全局方法挂载
Vue.prototype.$buildingNo = '3#'
Vue.prototype.$echarts = echarts
Vue.prototype.$THREE = THREE
Vue.prototype.$numToFixed = numToFixed
Vue.prototype.$dataToFixed = dataToFixed
Vue.prototype.$prop100 = prop100
Vue.prototype.parseTime = parseTime
Vue.prototype.addDateRange = addDateRange
Vue.prototype.download = download
Vue.prototype.$modules = modules
Vue.prototype.$EcahrtOption = EcahrtOption

//挂载到全局，让所有页面都能接收
Vue.prototype.$httpGet = httpGet
Vue.prototype.$httpPost = httpPost
Vue.prototype.$httpPut = httpPut
Vue.prototype.$httpDel = httpDel


Vue.prototype.msgSuccess = function(msg) {
    this.$message({ showClose: true, message: msg, type: 'success' })
}

Vue.prototype.msgError = function(msg) {
    this.$message({ showClose: true, message: msg, type: 'error' })
}

Vue.prototype.msgInfo = function(msg) {
    this.$message.info(msg)
}

// 全局组件挂载
Vue.component('Pagination', Pagination)
Vue.component('VueEcharts', ECharts)

Vue.use(permission)

// 保留指定位数的小数
Vue.filter('keepDecimal', function(value, decimal) {
    return numToFixed(value, decimal)
})

// 保留指定位数的小数 返回数字类型
Vue.filter('keepDecimalNum', function(value, decimal) {
    return parseFloat(numToFixed(value, decimal))
})

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online! ! !
 */

Vue.use(Element, {
    size: Cookies.get('size') || 'medium' // set element-ui default size
})

new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
})