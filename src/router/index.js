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
  //     title: '谢烟客登陆'
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
 
    ]
  },
]

export default new Router({
  base: process.env.BASE_URL,
  mode: 'hash',
  scrollBehavior: () => ({y: 0}),
  routes: constantRoutes
})
