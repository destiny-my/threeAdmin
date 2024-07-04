/**
 * 通用js方法封装处理
 */
const baseURL = process.env.VUE_APP_BASE_API

// 日期格式化
export function parseTime(time, pattern) {
  if (arguments.length === 0 || !time) {
    return null
  }
  const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
      time = parseInt(time)
    } else if (typeof time === 'string') {
      time = time.replace(new RegExp(/-/gm), '/')
    }
    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}

// 添加日期范围
export function addDateRange(params, dateRange) {
  var search = params
  search.beginTime = ''
  search.endTime = ''
  if (dateRange != null && dateRange != '') {
    search.beginTime = this.dateRange[0]
    search.endTime = this.dateRange[1]
  }
  return search
}

// 通用下载方法
export function download(fileName) {
  window.location.href = baseURL + '/common/download?fileName=' + encodeURI(fileName) + '&delete=' + true
}

// 字符串格式化(%s )
export function sprintf(str) {
  var args = arguments;
  var flag = true;
  var i = 1
  str = str.replace(/%s/g, function () {
    var arg = args[i++]
    if (typeof arg === 'undefined') {
      flag = false
      return ''
    }
    return arg
  })
  return flag ? str : ''
}

// 转换字符串，undefined,null等转化为""
export function parseStrEmpty(str) {
  if (!str || str == 'undefined' || str == 'null') {
    return ''
  }
  return str
}

// 保留指定位数的小数
export function numToFixed(value, decimal) {
  if (value === undefined || value === null && value === '') {
    return value
  }

  // 判断是否为数字
  let _val = parseFloat(value)
  if (_val.toString() === 'NaN') {
    return value;
  }

  // 判断保留位数
  if (decimal === undefined || decimal === null || decimal === '') {
    decimal = 2
  }

  // toFixed偶尔会出现12.9800000001的情况，需要特殊处理
  _val = _val.toFixed(decimal)
  let _smallNum = _val.split('.')
  if (_smallNum[1].length !== decimal) {
    _val = _smallNum[0] + '.' + _smallNum[1].slice(0, decimal)
  }

  return _val
  // return parseFloat(val.toFixed(decimal))
}

// 保留指定位数的小数
export function dataToFixed(data, decimal) {
  if (data.length === 0) {
    return data
  }

  let _data = []
  for (let _item of data) {
    _data.push(numToFixed(_item, decimal)/4)
  }

  return _data
}

// 获取指定天数的日期
export function nextDay(day, date) {
  if (day === undefined || day === null) {
    day = 1
  }

  if (date === undefined || date === null) {
    date = new Date()
  }

  return new Date(date.getTime() + 24 * 60 * 60 * 1000 * day)
}

// 告警、建议格式样式
export function suggestStyle(val) {
  let _val = val
  let _span = '', _start = _val.indexOf('{'), _end = 0
  while (_start >= 0) {
    if (_start === 0) {
      _end = _val.indexOf('}')
      _span += `<span style="color: #EB3820; font-weight: bold;"> ${_val.slice(_start + 1, _end)}</span>`
    } else {
      _end = _start
      if (_val.indexOf('}') === 0) {
        _span += `<span> ${_val.slice(1, _start)}</span>`
      } else {
        _span += `<span> ${_val.slice(0, _start)}</span>`
      }
    }

    _val = _val.slice(_end)
    _start = _val.indexOf('{')
  }

  if (_val.length > 0) {
    _span += `<span> ${_val.slice(1)}</span>`
  }

  return _span
}

// 同比、环比数据简化计算
export function compareData(val) {
  let _val = val
  while (Math.abs(_val) > 100) {
    _val /= 10
  }

  return _val
}

// 比例超100问题解决
export function prop100(key, prop) {
  if (prop.length <= 0) {
    return
  }

  // 1. 求和
  let _total = 0.00, _indexMax = 0, _max = 0.00
  prop.map((_item, _index) => {
    let _val = parseFloat(numToFixed(_item[key]))
    if (_val > _max) {
      _indexMax = _index
      _max = _val
    }

    _total += _val
  })

  // 2. 偏移值
  let _offset = (100.00 - _total)
  if (_offset === 0) {
    return
  }

  // 3. 修改值
  prop[_indexMax][key] = prop[_indexMax][key] + _offset
}

export function sumArr(data) {
  if (data === undefined || data === null) {
    return 0
  }

  let _sum = 0
  for (const _item of data) {
    _sum += _item
  }

  return _sum
}
