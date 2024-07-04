/*
 * @Author: ybf
 * @Date: 2023-11-08 10:06:10
 * @LastEditTime: 2023-11-08 14:47:31
 * @Description: 描述
 * Copyright (c) 2023 by 慧能分享, All Rights Reserved.
 */
import request from '@/utils/request'

// 登录方法
export function login(username, password) {
  const data = {
    'username': username,
    'password': password,
  }

  return request({
    url: '/api/auth/token/access',
    method: 'post',
    data: JSON.stringify(data)
  })
}

// 登录方法
export function loginCem(username, password, code, rememberMe, uuid) {
  const data = {
    'username': username,
    'password': password,
    'validateCode': code,
    'rememberMe': rememberMe
  }

  return request({
    url: '/loginCem',
    method: 'post',
    params: data
  })
}

// 获取用户详细信息
export function getUserInfo() {
  return request({
    url: '/api/auth/pmsn/user',
    method: 'get'
  })
}

// 退出方法
export function logout() {
  return request({
    url: '/api/auth/token/remove',
    method: 'post'
  })
}

// 获取验证码
export function getCodeImg() {
  return request({
    url: '/captcha/captchaImage?type=math',
    method: 'get'
  })
}
