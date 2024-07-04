import Vue from 'vue'
import Router from 'vue-router'
import Layout from '@/layout'

Vue.use(Router)

// 公共路由
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        /* path: '/redirect/:path*',*/
        path: '/redirect/:path(.*)',
        // component: () => import('@/views/redirect')
        component: (resolve) => require(['@/views/redirect'], resolve)
      }
    ]
  },
  // {
  //   path: '/login',
  //   // component: () => import('@/views/login'),
  //   component: (resolve) => require(['@/views/login'], resolve),
  //   meta: {
  //     title: '智慧暖通空调调度平台登陆'
  //   },
  //   hidden: true
  // },
  {
    path: '/404',
    // component: () => import('@/views/error/404'),
    component: (resolve) => require(['@/views/error/404'], resolve),
    hidden: true
  },
  {
    path: '/401',
    // component: () => import('@/views/error/401'),
    component: (resolve) => require(['@/views/error/401'], resolve),
    hidden: true
  },
  {
    path: '',
    component: Layout,
    redirect: 'index',
    children: [
      {
        path: 'index',
        name: '首页',
        meta: {title: '首页', icon: 'dashboard', noCache: true, affix: true},
        components: {
          default: (resolve) => require(['@/views/index'], resolve),
        }
        //   component:
      },
      {
        path: 'scadaMonitor',
        name: 'scadaMonitor',
        component: () =>
          import ('@/views/detection/scadaMonitor')
      },
      {
        path: 'electricQuantity',
        component: () =>
          import ('@/views/detection/electricQuantity')
      },
      {
        path: 'setup',
        component: () =>
          import ('@/views/policyDecision/setUp')
      },
      {
        path: 'tab',
        component: () =>
          import ('@/components/tab'),
      },
      {
        path: 'measurement',
        component: () =>
          import ('@/components/tab/measurement.vue'),
      },
      {
        path: 'capacityQuantity',
        component: () =>
          import ('@/views/detection/capacityQuantity')
      },
      {
        path: 'adjustQuantity',
        component: () =>
          import ('@/views/detection/adjustQuantity')
      },
      {
        path: 'loadRateQuantity',
        component: () =>
          import ('@/views/detection/loadRateQuantity')
      },
      {
        path: 'chargeQuantity',
        component: () =>
          import ('@/views/detection/chargeQuantity')
      },
      {
        path: 'photovoltaicAccount',
        component: () =>
          import ('@/views/policyDecision/photovoltaicAccount')
      },
      {
        path: 'strategy',
        component: () =>
          import ('@/views/policyDecision/strategy')
      },
      {
        path: 'chargingPile',
        component: () =>
          import ('@/views/policyDecision/chargingPile')
      },
      {
        path: 'waterQuantity',
        component: () =>
          import ('@/views/detection/waterQuantity')
      },
      {
        path: 'gasQuantity',
        component: () =>
          import ('@/views/detection/gasQuantity')
      },
      {
        path: 'controlInstructions',
        component: () =>
          import ('@/views/detection/controlInstructions')
      },
      {
        path: 'temperature',
        component: () =>
          import ('@/views/detection/temperature')
      },
      {
        path: 'Heating',
        component: () =>
          import ('@/views/detection/Heating')
      },
      {
        path: 'systemMonitoring',
        component: () =>
          import ('@/views/detection/systemMonitoring')
      }
    ]
  },
]

export default new Router({
  base: process.env.BASE_URL,
  mode: 'hash',
  scrollBehavior: () => ({y: 0}),
  routes: constantRoutes
})
