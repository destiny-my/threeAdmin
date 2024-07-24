<template>
  <el-header>
    <el-col :span="5">
      <div class="weather-box">
        <!-- <i class="el-icon-location-outline"></i> -->
        <!-- <span class="title-second weather-location">{{ weather.placeName }}</span>
        <span class="title-fourth weather-temp">{{ weather.weather }} {{ weather.temperature }}℃</span> -->
      </div>
    </el-col>
    <el-col :span="5">
      <div class="weather-box" style="text-align: right;">
        <el-col :span="16">
          <span class="title-fourth weather-temp">{{ nowTime.day }}</span>
        </el-col>
        <el-col :span="4">
          <span class="title-fourth weather-temp">{{ nowTime.time }}</span>
        </el-col>
        <el-col :span="4" class="weather-z">

          <el-dropdown @command="dropdown">
            <span><img src="../assets/image/user.png" alt="" class="dropdownBtn"></span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-for="(item, index) in dropParams" :key="index" :command="item">{{ item }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <!-- <ul class="dropdownWrapper" v-show='dropdownActive'>
            <li v-for="(item, index) in dropParams" :key="index" @click='logout(item)'>
              <span>{{ item }}</span>
            </li>
          </ul> -->
        </el-col>
      </div>
    </el-col>
  </el-header>
</template>
<script>

import { parseTime } from '@/utils/cem'
import Monitor from "@/api/carbon/monitor";
import Analyse from "@/api/carbon/analyse";

export default {
  data() {
    return {
      weather: {},
      nowTime: { day: '', time: '' },
      dropdownActive: false,
      dropParams: ['退出登录'] // 配置管理
    }
  },
  mounted() {
    // this.updateWeather() // 更新天气
    // this.updateTime() // 更新时间
    // const timer = setInterval(() => {
    //   this.updateTime()
    // }, 1000)

    // window.addEventListener('unload', e => this.unloadHandler(e))
  },

  // destroyed() {
  //   window.removeEventListener('unload', e => this.unloadHandler(e))
  // },
  methods: {

  
  }
}
</script>
<style lang="less" scoped>
.el-header {
  width: 100%;
  padding: 0 0.2083rem;
  height: 0.4323rem !important;
  display: flex;
  justify-content: space-between;
  align-items: center;


  .weather-box {
    height: 0.4323rem;
    display: flex;
    align-items: center;

    .weather-z {
      z-index: 5;
    }

    .el-icon-location-outline {
      font-size: 0.1042rem;
    }

    .weather-location {
      color: #CCE0FF;
      padding: 0 0.0417rem;
    }

    .weather-temp {
      color: #419FFE;
      padding: 0 0.0417rem;
    }

    .dropdownBtn {
      cursor: pointer;
      z-index: 5;
    }

    .dropdownWrapper {
      /*margin-top: 36px;*/
      border: 1px solid #2C3E50;
      font-size: 14px;
      line-height: 28px;
      position: absolute;
      padding: 5px 10px;
      margin: 0;
      text-align: center;
      z-index: 5;
      background-color: rgba(34, 65, 109, 0.8)
    }

    .dropdownWrapper li {
      display: block;
      cursor: pointer;
    }

    .nav-item.active {
      background: #e3e3d3;
    }
  }

  .title-text {
    text-align: center;
    padding-top: 0.078125rem;
  }
}
</style>
