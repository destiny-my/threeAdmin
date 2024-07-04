<template>
  <el-header>
    <el-col :span="5">
      <div class="weather-box">
        <!-- <i class="el-icon-location-outline"></i> -->
        <!-- <span class="title-second weather-location">{{ weather.placeName }}</span>
        <span class="title-fourth weather-temp">{{ weather.weather }} {{ weather.temperature }}℃</span> -->
      </div>
    </el-col>
    <el-col :span="14">
      <div class="title-text">
        <span class="title-first">智慧暖通空调调度平台</span>
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
    this.updateTime() // 更新时间
    const timer = setInterval(() => {
      this.updateTime()
    }, 1000)

    window.addEventListener('unload', e => this.unloadHandler(e))
  },

  // destroyed() {
  //   window.removeEventListener('unload', e => this.unloadHandler(e))
  // },
  methods: {
    updateWeather: function () {
      // 更新天气
      let date = parseTime(new Date(), "{y}-{m}-{d}");
      Monitor.getWeather(date).then((res) => {
        if (res === undefined || res === null || res["code"] !== 0) {
          return;
        }

        let data = res["rows"];
        if (data === undefined || data === null || data.length !== 1) {
          return;
        }

        this.weather = data[0];
      });
    },
    updateTime: function () {
      // 更新时间
      let date = new Date()
      date = parseTime(date, '{y}-{m}-{d} {a} {h}:{i}:{s}')
      date = date.split(" ")
      this.nowTime.day = date[0] + ' 星期' + date[1]
      this.nowTime.time = date[2]
    },
    dropdown: function (command) {
      // 下拉点击处理
      if (command === '配置管理') {
        this.openConfigMgr()
      } else if (command === '退出登录') {
        this.logout()
      }
    },
    openConfigMgr: function () {
      // 打开配置管理后台页面
      // 读取配置
      Analyse.selectDictLabel({ 'dictType': 'lt_config', 'dictValue': 'scada_url' }).then((res) => {
        if (res === undefined || res === null || res['code'] !== 0) {
          return
        }

        let _scadaUrl = res['msg']
        if (_scadaUrl.length <= 0) {
          return
        }

        window.open(_scadaUrl)
      })
    },
    async logout() {
      // 退出系统
      this.$confirm('确定注销并退出系统吗？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(() => {
        this.$store.dispatch('LogOut').then(() => {
          // location.href = '/mobileinformationport/#/login';
          this.$router.push('/login')
        })
      })
    },
    unloadHandler(e) {
      //判断是窗口关闭还是刷新
      this.$store.dispatch('LogOut').then(() => {
        // location.href = '/mobileinformationport/#/login';
        this.$router.push('/login')
      })

    },
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
  background: url('../assets/image/header.png') no-repeat;
  background-size: 100% 100%;

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
