<template>
    <div id="main">
        <div id="plan" class="modular">
            <div class="module-name">
                控制指令
                <DatePicker :pValue="dateSpaceRatio" pStyle="width:200px;position: absolute;right: 10px;"
                    @changedDate="updateSpaceRatio"></DatePicker>
            </div>
            <div class="module-content">
                <!-- <div class="total_box">
                    <span class="total_item">
                        <span class="label">执行成功率</span>
                        <span class="number">52.41</span>
                        <span class="unit">%</span>
                    </span>
                    <span class="total_item">
                        <span class="label">失败/总执行个数</span>
                        <span class="number">158</span>
                        <span class="unit">/332</span>
                    </span>
                </div> -->
                <div class="ehcartsStyle">
                    <vue-echarts autoresize :option="systemOperationCharts" style="height: 100%; width: 100%"
                        ref="ref_echart1"></vue-echarts>
                </div>
            </div>
        </div>
        <div class="radioBox">
            <input type="radio" name="timeRange" lay-filter="timeRange" value="15min" title="按15分钟统计" lay-skin="primary"
                checked="">
            <div class="layui-unselect layui-form-radio layui-form-radioed" style="line-height: 30px;display: flex;">
                <div style="margin-left:10px;">按小时统计</div>
            </div>
            <!-- <input type="radio" name="timeRange"  lay-filter="timeRange" value="1hour" title="按小时统计" lay-skin="primary"  >
        <input type="radio" name="timeRange"  lay-filter="timeRange" value="4hour" title="按4小时统计" lay-skin="primary"  > -->
        </div>
        <div class="modular2">
            <div class="module-content">
                <ul class="timeIntervalBox">
                    <li class="timeItem" v-for="(item, i) in timeData" :key="i" v-if="item.listMap.length">
                        <div class="timeHeader">
                            <span class="timeInterval">{{ item.listNum[0].datePeriod  }}</span>
                            <!-- <span class='target'>
                                <span class="targetBefore">经济优先</span>
                                <span class="targetAfter">节能</span>
                            </span> -->
                        </div>
                        <ul class="timeTotal">
                            <li class='timeTotalItem'>
                                <span class="total">
                                    <!-- <span class="number">{{ (Number(item.listNum[0].successNum)  / Number(item.listNum[0].count) ) * 100 || 0 }}</span> -->
                                    <span class="number">100</span>

                                    <span class="unit">%</span>
                                </span>
                                <span class="total_label label">执行成功率</span>
                            </li>
                            <li class='timeTotalItem'>
                                <span class="total">
                                    <!-- <span class="number">{{ item.listNum[0].failureNum }}</span> -->
                                    <span class="number">0</span>
                                    <span class="unit">个</span>
                                </span>
                                <span class="total_label label">失败个数</span>
                            </li>
                            <li class='timeTotalItem'>
                                <span class="total">
                                    <span class="number">1</span>
                                    <span class="unit">个</span>
                                </span>
                                <span class="total_label label">总个数</span>
                            </li>
                        </ul>
                        <ul class="stepList">
                            <li class="stepItem" v-for="(step, g) in item.listMap" :key="g">
                                <span class="stepDetail">{{ (step.text + '').replace(/阀门/g, '') }}</span>
                                <span class="stepValue">{{ $numToFixed(step.targetValue, 2) }} m³/h</span>
                                <!-- <ul class="lStepList">
                                    <li :class="['lLtepItem', child.className]" v-for="(child, j) in step.child" :key="j">
                                        <i class="icon"></i>
                                        <span class="stepTime">{{ child.time }}</span>
                                        <span class="lStepDetail" :title="child.text">{{ child.text }}</span>
                                    </li>
                                </ul> -->
                            </li>

                        </ul>
                    </li>
                </ul>
            </div>

        </div>

    </div>
</template>

<script>
import DatePicker from "@/components/datePicker.vue";
import { compareData, parseTime } from "@/utils/cem";
export default {
    components: { DatePicker },
    data() {
        return {
            systemOperationCharts: {},
            timeData: [],
            dateSpaceRatio: parseTime(new Date(), '{y}-{m}-{d}'),
        }
    },
    mounted() {
        // this.$httpGet(window.api.optionData).then((res) => {
        //     this.getPlanCharData(res.data1, res.data2)
        // })
        // this.$httpGet(window.api.timeData).then((res) => {
        //     this.timeData = res.data
        // })
    },
    methods: {
        //通用坐标轴
        getPlanCharData(data) {
            this.systemOperationCharts = {
                color: [],
                tooltip: {
                    trigger: "axis",
                    textStyle: {
                        align: 'left'
                    },
                    formatter: function (param) {
                        // console.log(param);
                        // return param[0].axisValue + "<br/>" + param[0].marker + param[0].seriesName + ": " + param[0].value + " 个<br/>" +
                        //     param[1].marker + param[1].seriesName + ": " + param[1].value + " 个"
                        return param[0].axisValue + "<br/>" + param[0].marker + param[0].seriesName + ": " + param[0].value + " 个" 
                    }
                },
                legend: [{
                    bottom: 0,
                    left: 'center',
                    itemWidth: 20,
                    itemHeight: 6,
                    itemGap: 80,
                    symbolKeepAspect: true,
                    data: ["下发指令数"],
                    textStyle: {
                        color: "rgba(179, 220, 248, 1)",
                        fontSize: 14,
                    },
                }],
                xAxis: {
                    name: "",
                    type: 'category',
                    show: true,
                    nameGap: 0,
                    nameLocation: 'end',
                    nameTextStyle: {
                        color: 'rgba(57, 147, 234, 1)',
                        fontSize: 14,
                        padding: [40, 0, 0, 0],
                        verticalAlign: 'middle',
                        align: 'left'
                    },

                    axisLine: {
                        show: true,
                        onZero: false,
                        lineStyle: {
                            color: 'rgba(57, 147, 234, .1)',
                        }
                    },
                    splitLine: {
                        show: false,
                        lineStyle: {
                            color: '#072760',

                        }
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        show: true,
                        fontSize: 14,
                        fontFamily: 'DINPro',
                        color: 'rgba(57, 147, 234, 1)'
                    },
                    data: data.xAxis
                },
                yAxis: [{
                    type: 'value',
                    show: true,
                    name: "个",
                    nameTextStyle: {
                        color: 'rgba(57, 147, 234, 1)',
                        fontSize: 14,
                        padding: [0, 40, 0, -40],
                        align: 'left'
                    },
                    minInterval: 1,
                    // nameGap: gap,
                    nameLocation: "end",

                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: 'rgba(57, 147, 234, .1)',
                        }
                    },
                    axisTick: {
                        show: false
                    },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: '#072760',

                        }
                    },
                    axisLabel: {
                        show: true,
                        fontSize: 14,
                        fontFamily: 'DINPro',
                        color: 'rgba(57, 147, 234, 1)'
                    }
                }],
                grid: {
                    top: "20%",
                    left: "5%",
                    right: "5%",
                    bottom: "20%",
                },
                series: [
                    {
                        name: '下发指令数',
                        type: 'bar',
                        barWidth: 10,
                        data: data.yAxis,
                        stack: "数量",
                        itemStyle: {
                            color: "rgba(16,114,226,1)",
                            // borderColor: "rgba(53,167,255,1)",
                            // borderWidth: "1",
                            //borderType: "solid"
                        }
                    },
                    // {
                    //     name: "执行失败",
                    //     type: 'bar',
                    //     stack: "数量",
                    //     symbolSize: 5,
                    //     data: data2,
                    //     itemStyle: {
                    //         color: "#EE596F",
                    //         // borderColor: "rgba(53,167,255,1)",
                    //         // borderWidth: "1",
                    //         //borderType: "solid"
                    //     }
                    // },

                ]
            };
        },
        updateSpaceRatio: function (day) {
            this.dateSpaceRatio = day
            this.getControlStatCurveData()
            this.getControlStatTimeTypeData()
        },
        /**
         * @Author: ybf
         * @LastEditTime: 
         * @description: 控制指令折线图数据
         * @return {*}
         */
        getControlStatCurveData() {
            this.$httpGet(window.api.getControlStatCurveData, { dataTime: this.dateSpaceRatio }).then((res) => {
                if (res.successful) {
                    if (res.hasOwnProperty('result')) {
                        this.getPlanCharData(res.result)
                    } else {
                        this.timeData = []
                    }
                } else {
                    this.timeData = []
                }
            })
        },
        /**
         * @Author: ybf
         * @LastEditTime: 
         * @description: 按小时统计数据
         * @return {*}
         */
        getControlStatTimeTypeData() {
            this.$httpGet(window.api.getControlStatTimeTypeData, { dataTime: this.dateSpaceRatio }).then((res) => {
                if (res.successful) {
                    if (res.hasOwnProperty('result')) {
                        res.result.sort((a,b) => new Date(b.listNum[0].date).getTime()  - new Date(a.listNum[0].date).getTime());
                        this.timeData = res.result
                    } else {
                        this.timeData = []
                    }
                } else {
                    this.timeData = []
                }
            })
        }
    }
}
</script>

<style lang="less" scoped>
#main {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    // margin-left: 25px;

    .module-name {
        height: 48px;
        line-height: 48px;
        color: #24FFF7;
        font-size: 18px;
        letter-spacing: 2px;
        padding-left: 20px;
        font-weight: 620;
    }

    .modular {
        height: 60%;
        backdrop-filter: blur(6px) saturate(200%);
        -webkit-backdrop-filter: blur(6px) saturate(200%);
        background-color: rgba(255, 255, 255, 0);
        border-radius: 12px;
        border: 1px solid rgba(209, 213, 219, 0.3);
    }

    .modular2 {
        display: inline-block;
        border-radius: 5px;
        vertical-align: top;

        backdrop-filter: blur(6px) saturate(200%);
        -webkit-backdrop-filter: blur(6px) saturate(200%);
        background-color: rgba(255, 255, 255, 0);
        border-radius: 12px;
        border: 1px solid rgba(209, 213, 219, 0.3);

        .module-content {
            position: relative;

            .timeIntervalBox {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: row;
                justify-content: space-evenly;
                flex-wrap: wrap;
                padding-bottom: 40px;
            }
        }
    }


    .timeItem {
        display: inline-block;
        width: 380px;
        // height: 230px;
        padding: 10px 20px;
        background: rgba(13, 73, 171, .2);
        border-radius: 4px;
        margin-top: 40px;
    }

    .timeIntervalBox>li {
        width: 380px;
    }

    .radioBox {

        align-items: center;

        display: flex;
    }

    .layui-form-radio {
        margin-left: 50px;
    }

    .layui-form-radio:first-of-type {
        margin-left: 0;
    }

    .timeIntervalBox {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
        flex-wrap: wrap;
        padding-bottom: 40px
    }

    /* .timeItem:last-child:nth-child(5n - 1) {
            margin-right: calc();
        } */
    /* .timeIntervalBox::after {
            content: '';
            flex: auto;
        } */

    ul,
    li {
        padding: 0;
        box-sizing: border-box;
    }

    #time {
        margin-bottom: 20px;
        min-height: 200px;
    }

    .timeHeader,
    .timeTotal {
        width: 100%;
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid rgba(54, 128, 248, .2);
    }

    .timeInterval {
        color: #24FFF7;
        font-size: 18px;
        line-height: 56px;
        font-weight: 600;

    }

    .targetBefore {
        color: #24FFF7;
        font-size: 14px;
        line-height: 56px;
    }

    .targetAfter {
        color: #A7CFEC;
        font-size: 14px;
        position: relative;
        padding-left: 20px;
    }

    .targetAfter::before {
        content: "";
        width: 4px;
        height: 4px;
        border-radius: 50%;
        position: absolute;
        left: 8px;
        top: calc(50% - 2px);
        background: #A7CFEC;
    }

    .timeTotal {
        padding: 20px 0
    }

    .total,
    .total_label {
        display: inline-block;
        width: 100%;
        text-align: left;
    }

    .timeTotalItem .number {
        font-size: 24px;
        padding-left: 0;
    }

    .timeTotalItem {
        display: inline-block;
    }

    .timeTotalItem .unit {
        font-size: 12px;
        color: #9BACBC
    }

    .timeTotalItem:nth-child(1) .number {
        color: #00E2FF;
    }

    .timeTotalItem:nth-child(2) .number {
        color: #EE596F;
    }

    .timeTotalItem:nth-child(3) {
        width: 60px;
    }

    .timeTotalItem:nth-child(3) .number {
        color: #FFC845;
    }

    .stepItem {
        width: 100%;
        margin-top: 10px;
    }

    .stepDetail {
        display: inline-block;
        // width: 30%;
        font-size: 12px;
        color: #3993EA;
    }
    .stepValue {
        font-size: 12px;
    }

    .icon {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        display: inline-block;
        vertical-align: middle;
        font-style: normal;
        text-align: center;
        line-height: 13px;
        position: relative;
        z-index: 2;
    }

    .stepTime {
        width: 40px
    }

    .stepList {
        overflow: auto;
        max-height: 260px;
    }

    .lLtepItem {
        position: relative;
    }

    .lLtepItem .icon,
    .stepTime,
    .lStepDetail {
        margin-left: 1em;
        display: inline-block;
        vertical-align: middle;
    }

    .lStepDetail {
        margin-left: 1.2em;
        max-width: 200px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .lLtepItem::after {
        content: "";
        position: absolute;
        height: 100%;
        width: 0;
        top: 50%;
        left: 21px;
        border-left: 2px solid rgba(12, 58, 130, .72);
        z-index: 0;

    }

    .lLtepItem:last-child::after {
        border: none;
    }

    .lStepList {
        line-height: 36px;
    }



    .module-content {
        position: relative;
        height: 100%;

        .total_box {
            position: absolute;
            left: 50%;
            top: 0px;
            transform: translate(-50%, 0);

            .total_item {
                display: inline-block;

                .label {
                    color: #74BCFF;
                    font-size: 14px;
                }
            }

            .total_item:last-child {
                margin-left: 100px;
            }

            .total_item:last-child .number {
                color: #FFC845;
            }

            .number {
                font-size: 36px;
                color: #00E2FF;
                padding-left: 15px;
            }

            .unit {
                color: #07D2EC;
                font-size: 14px;
            }
        }

        .ehcartsStyle {
            height: calc(100% - 60px);
        }
    }
}
</style>