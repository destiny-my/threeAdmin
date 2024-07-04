<template>
   <div id="IncomeAnalysis2" style="height: 100%; width: 95%"></div>
</template>

<script>
import {getMultiCurves} from "@/api/carbon/curve";

export default {
    data(){
        return{
            myChart:[]
        }
    },


    created() {
        this.$nextTick(()=> {
            this.lineEcharts()
        })
    },
    // mounted(){
    //     let _this = this;
    //     window.onresize = function() {
    //         _this.myChart.resize()
    //     }

    // },
    methods:{
    lineEcharts() {
      var chartDom = document.getElementById("IncomeAnalysis2");
      var myChart3 = this.$echarts.init(chartDom);
      let title = "";
      let xLabel = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
      let yLabel = ["100","200","400","600","800"];
      let markLineLabel1 = "优化前\n运行功率";
      let markLineLabel2 = "优化后\n运行功率";
      let markLineLabel3 = "实际\n运行功率";
      let seriesData1 = [502.84, 205.97, 332.79, 281.55, 398.35, 214.02];
      let seriesData2 = [281.55, 398.35, 214.02, 179.55, 289.57, 356.14];
      let seriesData3 = [181.55, 128.35, 14.02, 149.55, 129.57, 326.14];
      var sd1sum = 0;
      for(var idx1 in seriesData1){
        var sd1 = seriesData1[idx1];
        sd1sum = sd1sum + sd1;
      }
      var markLineNum1 = sd1sum / seriesData1.length;
      markLineNum1 = parseInt(markLineNum1);
      var sd2sum = 0;
      for(var idx2 in seriesData2){
        var sd2 = seriesData1[idx2];
        sd2sum = sd2sum + sd2;
      }
      var markLineNum2 = sd2sum / seriesData2.length;
      markLineNum2 = parseInt(markLineNum2);
      var sd3sum = 0;
      for(var idx3 in seriesData3){
        var sd3 = seriesData3[idx3];
        sd3sum = sd3sum + sd3;
      }
      var markLineNum3 = sd3sum / seriesData3.length;
      markLineNum3 = parseInt(markLineNum3);
      if(markLineNum1 == markLineNum2) {
        markLineNum1 = markLineNum1 + 40;
        markLineNum2 = markLineNum2 - 40;
      }

      var option = getMultiCurves(title, xLabel, yLabel, markLineLabel1, markLineLabel2, markLineLabel3
        , markLineNum1, markLineNum2, markLineNum3, seriesData1, seriesData2, seriesData3);

       option && myChart3.setOption(option);
        window.addEventListener("resize", function () {
            myChart3.resize();
        });
    },
    }
}
</script>

<style lang="less" scoped>


</style>


