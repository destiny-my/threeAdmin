<template>
  <div :id="pId" :style="pStyle" :ref="pId"></div>
</template>
<script>
export default {
  name: 'Chart',
  props: {
    pId: {
      require: true,
      type: String,
      default: 'chart' + Math.random()
    },
    pResize: {
      require: true,
      type: Number,
      default: 1
    },
    pStyle: {
      require: true,
      type: String,
      default: 'width: 100%; height: 100%;'
    },
    pOption: {
      require: true,
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      _chart: null, // 对象
    }
  },
  created() {
    this.$nextTick(() => {
      this.initChart()
      if (document.getElementById("loopEcharts")) {
        let name = document.getElementById("loopEcharts").children[0]
        if (name) {
          name.style.zIndex = 3
        }
      }
    })
  },
  mounted() {
    let _this = this
    window.onresize = function () {
      _this.resizeChart()
    }
  },
  watch: {
    pResize() {
      this.resizeChart()
    },
    pOption: {
      handler(newOption, oldOption) {
        this.updateCharts()
      },
      deep: true,
      immediate: false
    }
  },
  methods: {
    initChart: function () {
      this._chart = this.$echarts.init(document.getElementById(this.pId))
      // this._chart = this.$echarts.init(this.$refs[`${this.pId}`])
      this._chart.setOption(this.pOption)
    },
    resizeChart: function () {
      // 重置chart大小
      if (this._chart !== undefined && this._chart !== null) {
        this._chart.resize()
      }
    },
    updateCharts: function () {
      // 更新chart
      if (this._chart !== undefined && this._chart !== null) {
        this._chart.setOption(this.pOption, true)
      }
    }
  }
}
</script>
<style lang="less" scoped>
#loopEcharts {
  div {
    z-index: 999999;
  }
}
</style>
