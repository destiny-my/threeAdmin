<!--
 * @Author: ybf
 * @Date: 2023-08-17 09:57:35
 * @LastEditTime: 2023-11-09 09:43:15
 * @Description: 描述
 * Copyright (c) 2023 by 慧能分享, All Rights Reserved.
-->
<template>
  <el-date-picker :style="pStyle" v-model="val" type="date" size="mini" placeholder="选择时间" :format=pFormat :picker-options="pickerOptions" :clearabl="false"></el-date-picker>
</template>
<script>

import {parseTime} from "@/utils/cem";

export default {
  name: 'DatePicker',
  props: {
    pValue: {
      type: String,
      default: {}
    },
    pStyle: {
      type: String,
      default: 'height: 100%;'
    },
    pFormat: {
      type: String,
      default: 'yyyy-MM-dd'
    },
    pStart: {
      type: String,
      default: null
    },
    pEnd: {
      type: String,
      default: null
    },
  },
  data() {
    return {
      pickerOptions: {
        disabledDate: (dt) => {
          if (this.pStart === null && this.pEnd === null) {
            return false
          }

          dt = new Date(Date.parse(parseTime(dt, '{y}-{m}-{d}') + ' 00:00:00'))
          let _dtStart = new Date(Date.parse(this.pStart + ' 00:00:00'))
          let _dtEnd = new Date(Date.parse(this.pEnd + ' 00:00:00'))
          if (_dtStart !== null && _dtEnd === null) {
            return dt < _dtStart
          } else if (_dtStart === null && _dtEnd !== null) {
            return dt > _dtEnd
          } else if (_dtStart !== null && _dtEnd !== null) {
            return dt < _dtStart || dt > _dtEnd
          }

          return false
        }
      }
    }
  },
  mounted() {
    this.$emit('changedDate', parseTime(new Date(), '{y}-{m}-{d}'))
  },
  computed: {
    val: {
      get() {
        return this.pValue
      },
      set(newVal) {
        this.$emit('changedDate', parseTime(newVal, '{y}-{m}-{d}'))
      }
    }
  },
  methods: {}
}
</script>
<style lang="less" scoped>

@import "../assets/styles/date.css";

.el-date-editor.el-input, .el-date-editor.el-input__inner {
  // width: 130px;
  z-index: 3;
}

/deep/ .el-input__inner {
  background-color: rgba(222, 241, 253, 0.1);
  border: 1px solid #0095FF;
  color: #fff;
}

/deep/ .el-input__prefix, /deep/ .el-input__suffix {
  height: 28px;
  margin: 0 auto;
  color: #0095FF;
}
</style>
