import {getUserInfo, login, loginCem, logout} from '@/api/login'
import userInfo from '@/api/userIofo'
import {  Message } from "element-ui";
import {getToken, removeToken, setToken} from '@/utils/auth'

const user = {
  state: {
    token: getToken(),
    name: '',
    avatar: '',
    roles: [],
    permissions: []
  },
  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_PERMISSIONS: (state, permissions) => {
      state.permissions = permissions
    }
  },
  actions: {
    Login({commit}, userInfo) {
      // 登录
      const username = userInfo.username.trim()
      const password = userInfo.password
      const rememberMe = userInfo.rememberMe
      const code = userInfo.code
      const uuid = userInfo.uuid
      return new Promise((resolve, reject) => {
        login(username, password).then(res => {
          if (res.successful) {
            setToken(res.result.value)
            commit('SET_TOKEN', res.result.value)
          }else {
            Message.error(res.message)
          }
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    LoginCem({commit}, userInfo) {
      // 登录
      const username = userInfo.username.trim()
      const password = userInfo.password
      const rememberMe = false
      return new Promise((resolve, reject) => {
        loginCem(username, password, code, rememberMe, uuid).then(res => {
          let _code = 201
          if (res !== undefined && res !== null) {
            _code = res['code']
          }

          let _msg = res['msg']
          if (_code === 200) {
            setToken(res['token'])
            commit('SET_TOKEN', res['token'])
          } else if (_msg !== undefined && _msg !== null && _msg !== '') {
            this.$message.error(_msg)
          } else {
            this.$message.error('调用登录接口失败，请联系管理员！')
          }

          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    GetUserInfo({commit, state}) {
      // 获取用户信息
      return new Promise((resolve, reject) => {
        // let res = userInfo
        getUserInfo(state.token).then(res => {
          const user = res.result
          const avatar = user.avatar == '' ? require('@/assets/image/profile.jpg') : process.env.VUE_APP_BASE_API + user.avatar
          if (res.successful) {
            // 验证返回的roles是否是一个非空数组
            commit('SET_ROLES', res.result.authorities)
            commit('SET_PERMISSIONS', res.result)
          } else {
            commit('SET_ROLES', ['ROLE_DEFAULT'])
          }

          commit('SET_NAME', user.username)
          commit('SET_AVATAR', avatar)
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    },
    LogOut({commit, state}) {
      // 退出系统
      return new Promise((resolve, reject) => {
        // logout(state.token).then(() => {
        logout().then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          commit('SET_PERMISSIONS', [])
          removeToken()
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    FedLogOut({commit}) {
      // 前端登出
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        commit('SET_PERMISSIONS', [])
        removeToken()
        resolve()
      })
    }
  }
}

export default user
