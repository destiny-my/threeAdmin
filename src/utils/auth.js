import Cookies from 'js-cookie'

export const TokenKey = 'mobileinToken'

export function getToken(key) {
  if (key === undefined || key === null || key === '') {
    key = TokenKey
  }

  return window.localStorage.getItem(key)
  // return Cookies.get(key)
}

export function setToken(token, key) {
  if (key === undefined || key === null || key === '') {
    key = TokenKey
  }

  return window.localStorage.setItem(key, token)
  // return Cookies.set(key, token)
}

export function removeToken(key) {
  if (key === undefined || key === null || key === '') {
    key = TokenKey
  }

  return window.localStorage.removeItem(key)
  // return Cookies.remove(key)
}
