<template>
  <div id="chartCurves" style="height: 100%; width: 100%"></div>
</template>

<script>

import {optionCurves} from "@/api/carbon/option"

export default {
  name: 'ChartCurves',
  props: {
    optionCurves: {
      require: true,
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      chartCurves: null
    }
  },
  created() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  mounted() {
    let _this = this
    window.onresize = function () {
      _this.chartCurves.resize()
    }
  },
  watch: {
    optionCurves: {
      handler(newOption, oldOption) {
        this.updateCharts()
      },
      deep: true,
      immediate: false
    }
  },
  methods: {
    initChart: function () {
      this.chartCurves = this.$echarts.init(document.getElementById("chartCurves"))
      this.chartCurves.setOption(optionCurves)
    },
    updateCharts: function () {
      if (this.chartCurves === null) {
        this.initChart()
      }

      if (this.optionCurves === null) {
        this.optionCurves = optionCurves
      } else {
      }

      // 复制对象
      let option = optionCurves
      Object.assign(option, this.optionCurves)
      this.chartCurves.setOption(option, true)
    }
  }
}
</script>

<style lang="less" scoped>
</style>
