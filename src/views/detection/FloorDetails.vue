<template>
    <div class="container">
        <el-row>
            <el-col :span="4" class="floorType">
                <el-col :span="8" class="deviceStatus">
                    <span>总数</span>
                    <span>{{ count }} 台</span>
                </el-col>
                <el-col :span="8" class="deviceStatus">
                    <span>在线</span>
                    <span>{{ online }}台</span>
                </el-col>
                <el-col :span="8" class="deviceStatus">
                    <span>离线</span>
                    <span>{{ offline }}台</span>
                </el-col>
            </el-col>
            <!-- <el-col :span="5" :offset="2" class="floorType">
                <el-col :span="24" class="deviceStatus">
                    <el-checkbox-group v-model="checkList">
                        <el-checkbox label="A座"></el-checkbox>
                        <el-checkbox label="B座"></el-checkbox>
                    </el-checkbox-group>
                </el-col>
            </el-col> -->

        </el-row>
        <el-row class="cardList">
            <el-col :span="3" class="cardStyle" v-for="(item, i) in WeatherList" :key="i">
                <el-col class="cardContent">
                    <el-row class="title">{{ item.objName }}</el-row>
                    <el-col class="TemperatureDetails" :span="24">
                        <el-col :span="5">
                            <el-row class="textStyle">{{ item.temp }}</el-row>
                            <el-row class="textStyle">温度</el-row>
                        </el-col>
                        <el-col :span="5">
                            <el-row class="textStyle">|</el-row>
                        </el-col>
                        <el-col :span="5">
                            <el-row class="textStyle">{{ item.hum }}</el-row>
                            <el-row class="textStyle">湿度</el-row>
                        </el-col>
                    </el-col>
                </el-col>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import axios from 'axios'  // 安装axios后引入
export default {
    data() {
        return {
            checkList: ["A座"],
            count: "",
            online: "",
            offline: "",
            WeatherList: [],
            timer: null
        }
    },
    mounted() {
        // axios.get('./weatherJson.json').then((res) => {
        //     this.count = res.data.data.count
        //     this.online = res.data.data.online
        //     this.offline = res.data.data.offline
        //     this.WeatherList = res.data.data.WeatherList
        // })
        this.getByPage()
        this.timer = setInterval(() => {
            this.getByPage()
        }, 1000);
    },
    beforeDestroy() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    },
    methods: {
        getByPage() {
            let params = { tmplId: 58, offset: 1, size: 100, companyId: undefined, companyId: 1 }
            this.$httpGet(window.api.byPage, params).then((res) => {
                this.offline = 0
                this.WeatherList = res.result.list.filter(item => {
                    return item.objName.indexOf('g33') < 0
                })
                this.count = this.WeatherList.length
                this.online = this.WeatherList.length
                // this.WeatherList = res.result.list
            })
        }
    }
    // computed: {
    //   productsOnSale: function () {
    //     return this.WeatherList.filter(product => product.onSale)
    //   }
    // }
}
</script>

<style lang="less" scoped>
.container {
    height: 100%;
    width: 100%;

    .floorType {
        height: 40px;
        backdrop-filter: blur(0px) saturate(82%);
        -webkit-backdrop-filter: blur(0px) saturate(82%);
        background-color: rgba(255, 255, 255, 0.14);
        border: 1px solid rgba(209, 213, 219, 0.3);
        padding: 3px;
    }

    .deviceStatus {
        display: flex;
        height: 100%;
        padding: 0 2px;
        background-color: rgba(17, 25, 40, 0.36);
        justify-content: space-around;
        align-items: center;
        background-clip: content-box;


    }

    .cardList {

        .cardStyle {
            // height: 120px;
            padding: 10px 10px;
            align-items: center;
        }

        .title {
            height: 33%;
            color: #ffffff;
            line-height: 46px;
            text-align: center;
            margin: 0;
        }

        .textStyle {
            height: 100%;
            text-align: center;
            // margin-top:20px ;

        }

        .cardContent {
            height: 100%;
            backdrop-filter: blur(6px) saturate(100%);
            -webkit-backdrop-filter: blur(6px) saturate(100%);
            background-color: rgba(255, 255, 255, 0);
            border-radius: 12px;
            border: 1px solid rgba(209, 213, 219, 0.3);
        }

        .TemperatureDetails {
            height: calc(100% - 30px);
            display: flex;
            align-items: center;
            // padding-top:10px;
            justify-content: center !important;
            margin: 10px 0;
            line-height: 27px;
        }
    }

}
</style>