  <template>
   <div id="analyseBar" style="height: 100%; width: 100%"></div>
</template>

<script>
export default {
    data(){
        return{
          myChart:[]
        }
    },

    created() {
        this.$nextTick(()=> {
            this.analyseBar()
        })
    },
    mounted(){
        let _this = this;
        window.onresize = function() {
            _this.myChart.resize()
        }

    },
    methods:{
    analyseBar() {
      var chartDom = document.getElementById("analyseBar");
      this.myChart = this.$echarts.init(chartDom);
      var option;

      option = {
        // backgroundColor: "rgba(30, 64, 138, 1)",
        tooltip: {
          trigger: "axis",
          axisPointer: {
            // Use axis to trigger tooltip
            type: "shadow", // 'shadow' as default; can also be 'line' or 'shadow'
          },
        },
        legend: {
        //   orient: "vertical",
          align: "left",
          right: "5%",
          top:"5%",
          type: "plain",
          textStyle: {
            color: "#fff",
          },
          icon: "rect",
          itemWidth: 10,
          itemHeight: 10,
        },
        grid: {
          top: "15%",
          left: "5%",
          right: "6%",
          bottom: "5%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          axisLine: {
            lineStyle: {
              color: "white",
            },
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            lineStyle: {
              color: "#445f9a",
            },
          },
          data: ["1", "2", "3", "4", "5", "6", "7"],
        },
        yAxis: {
          type: "value",
          axisLine: {
            show: true,
            lineStyle: {
              color: "#fff",
            },
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            lineStyle: {
              color: "#445f9a",
            },
          },
        },
        series: [
          {
            name: "电",
            type: "bar",
            // stack: "total",//控制堆叠
            label: {
              show: true,
            },
            emphasis: {
              focus: "series",
            },
            data: [320, 302, 301, 334, 390, 330, 320],
          },
  
 
        ],
      };

      option && this.myChart.setOption(option);
    },
    }
}
</script>

<style lang="less" scoped>


</style>


  
    
