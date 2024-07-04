import axios from "axios";
import { Loading, Message, MessageBox, Notification } from "element-ui";
import store from "@/store";
import { getToken } from "@/utils/auth";
import errorCode from "@/utils/errorCode";
import { base_yapi, biz_api } from "@/api/api.js";
axios.defaults.headers["Content-Type"] = "application/json;charset=utf-8";

// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  // baseURL: process.env.VUE_APP_BASE_API,
  timeout: 5 * 60 * 1000
});

// request拦截器
// service.interceptors.request.use(
//   config => {
//     if (getToken()) {
//       config.headers['Authorization'] = 'Bearer ' + getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
//     }
//     return config
//   },

let loadingInstance; // 全局加载loading

service.interceptors.request.use(
  config => {
    // loadingInstance = Loading.service({ background: "rgba(0, 0, 0, 0.5)" });

    // 是否需要设置 token
    const isToken = (config.headers || {}).isToken === true;
    // 是否需要防止数据重复提交
    const isRepeatSubmit = (config.headers || {}).repeatSubmit === false;
    if (getToken() && !isToken && config.url.indexOf(process.env.VUE_APP_BASE_BIZ_SERVICE) > -1) {
      config.headers["Authorization"] = 'Bearer ' + getToken(); // 让每个请求携带自定义token 请根据实际情况自行修改
      // config.headers['cookie'] ="add=" + getToken()
    }else if(getToken()){
      config.headers["Authorization"] = 'Bearer ' + getToken();
    }
    config.headers["istrust"] = true;
    config.url = setUrl(config.url);
    if (config.method === "get" && config.params) {
      // if (config.url.indexOf(process.env.VUE_APP_BASE_BIZ_SERVICE) > -1) {
      //   let url =
      //     config.url +
      //     "?" +
      //     encodeURIComponent(
      //       SMUtils.sm2_encrypt(JSON.stringify(config.params))
      //     );
      //   // url = url.slice(0, -1);
      //   // config.params = {};

      //   config.url = url;
      // }
    }
    if (config.method === "post" || config.method === "put") {
      // if (config.url.indexOf(process.env.VUE_APP_BASE_BIZ_SERVICE) > -1) {

      //   config.data = JSON.stringify({
      //     params: SMUtils.sm2_encrypt(config.data)
      //   });
      // }
    }
    return config;
  },
  error => {
    Promise.reject(error);
    //   }
    // )
  }
);

// 响应拦截器
service.interceptors.response.use(
  res => {
    // 隐藏loading
    if (loadingInstance !== null) {
      // loadingInstance.close();
    }

    // const code = res.data.code
    // 未设置状态码则默认成功状态
    const code = res.data.status || 200;
    // 获取错误信息
    const msg = errorCode[code] || res.data.msg || errorCode["default"];
    if (code === 401) {
      MessageBox.confirm(
        "登录状态已过期，您可以继续留在该页面，或者重新登录",
        "系统提示",
        {
          confirmButtonText: "重新登录",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).then(() => {
        store.dispatch("LogOut").then(() => {
          location.href = "/mobileinformationport/#/login";
        });
      });
    } else if (code === 605) {
      MessageBox.confirm(
        "登录状态已过期，您可以继续留在该页面，或者重新登录",
        "系统提示",
        {
          confirmButtonText: "重新登录",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).then(() => {
        store.dispatch("LogOut").then(() => {
          location.href = "/mobileinformationport/#/login";
        });
      });
    } else if (code === 500) {
      // Message({
      //   message: msg,
      //   type: "error"
      // });
      return Promise.reject(new Error(msg));
    } else if (code !== 200) {
      // Notification.error({
      //   // title: res.data.msg
      //   title: msg
      // });
      return Promise.reject("error");
    } else {
        if ( res.data.hasOwnProperty("encrypt") && res.data.encrypt) {
          res.data.result = JSON.parse(SMUtils.sm2_decrypt(res.data.result));
        }

      return res.data;
    }
  },
  error => {
    // 隐藏loading
    if (loadingInstance !== null) {
      // loadingInstance.close();
    }

    let { message } = error;
    if (message === "Network Error") {
      message = "后端接口连接异常";
    } else if (message.includes("timeout")) {
      message = "系统接口请求超时";
    } else if (message.includes("Request failed with status code")) {
      message = "系统接口" + message.substr(message.length - 3) + "异常";
    }
    // Message({
    //   message: message,
    //   type: "error",
    //   duration: 5 * 1000
    // });
    return Promise.reject(error);
  }
);

function setUrl(key) {
  const url = key;
  let baseUrl = null;
  baseUrl = base_yapi.find(s => key.indexOf(s) > -1)
    ? process.env.VUE_APP_BASE_YAPI
    : (biz_api.find(t => key.indexOf(t) > -1) ? process.env.VUE_APP_BASE_BIZ_SERVICE : process.env.VUE_APP_BASE_API)
  return baseUrl + url;
}
const httpGet = (url, data) => {
  return service({
    url: url,
    method: "get",
    params: data
  });
};

const httpPost = (url, data, params) => {
  return service({
    url: newUrl,
    method: "post",
    data: data,
    params: params
  });
};
const httpPut = (url, data) => {
  return service({
    url: newUrl,
    method: "put",
    data: data
  });
};
const httpDel = (url, data) => {
  return service({
    url: newUrl + data,
    method: "delete"
  });
};
export { httpGet, httpPost, httpPut, httpDel };
export default service;
