<template>
   <div id="picAccount" style="height: 100%; width: 95%"></div>
</template>

<script>
export default {
    data(){
        return{
            myChart2:[]
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
    //         _this.myChart2.resize()
    //     }

    // },
    methods:{
    lineEcharts() {
      var chartDom = document.getElementById("picAccount");
      this.myChart2 = this.$echarts.init(chartDom);
        let that=this

      var option;
        option = {
        tooltip: {
            trigger: 'item'
        },
        legend: {
        textStyle: {
            color: 'rgba(26, 241, 233, 1)',
            fontSize: 12,
            fontWeight: 0,
            padding: [0,0,0,10]
        },
            orient: 'vertical',
            left: 'right'
        },
        series: [


            {
                labelLine: {
                normal: {
                    show: true,
                    length: 10,
                    length2: 45,
                    lineStyle: {
                        color: '#0096b1'

                    }
                },
                emphasis: {
                    show: false
                }
            },
            name: 'Access From',
            type: 'pie',
            subtextStyle:{
            color: "#00B1BF",
            fontSize: 18
        },
            radius: '50%',
            data: [
                { value: 1048, name: '公用庄' ,label:{color:"##00B1BF"}}, // 标注字设置
                { value: 735, name: '自用庄',label:{color:"##00B1BF"} },
            ],
            emphasis: {
                itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
            }
        ]
        };
    option && this.myChart2.setOption(option);
       
        window.addEventListener("resize", function () {
            that.myChart2.resize();
        });
    },
    }
}
</script>

<style lang="less" scoped>


</style>


