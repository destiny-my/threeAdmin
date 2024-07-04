<template>
  <div>
    <el-footer>
      <div class="footer">
        <div class="footer-box">
          <div class="content">
            <div @click="homeClick" class="home-link">
              <!-- <img src="../assets/image/icon-location.png" alt="" v-show="current === '首页'" class="indexIcon"> -->
              <span :class="{ checked: '首页' === current }">&emsp;首页&emsp;</span>
            </div>
            <div v-for="(item, index) in dropdown" :key="index" class="link-box">
              <!-- <div :class="isActive(item) ? 'tagItem' : 'tagItem-show'" >
                <img src="../assets/image/icon-location.png" alt="">
              </div> -->
              <div @click="handleCommand(item.linkName)"
                :class="{ 'dropdown1': index === 0, 'dropdown2': index === 1, 'dropdown3': index === 2 }">
                <span class="el-dropdown-link" :class="{ checked: item.linkName === current }">{{ item.linkName }}</span>
                <!-- <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="(item1, index) in item.linkData" :key="index" :command="item1">{{ item1 }}
                </el-dropdown-item>
              </el-dropdown-menu> -->
              </div>
            </div>
            <el-dropdown @command="dialogClick" class="dialog-link">
              <span :class="{ checked: '历史数据' === current }">历史数据</span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="(item1, index) in linkData" :key="index" :command="item1">{{ item1 }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
        <div class="current">{{ current }}</div>
      </div>
    </el-footer>
    <!-- <Popup @close="dialogClick" v-if="dialog_type"></Popup> -->
  </div>
  <!-- 碳排工具弹框 -->
</template>

<script>
import Popup from '../components/popup.vue'

export default {
  data() {
    return {
      dropdown: [
        { linkName: '暖通监视', linkData: ['多能流', '暖通监视'] },
        // { linkName: '控制指令', linkData: ['碳排优化', '光伏台账', '充电桩台账'] }
        { linkName: '', linkData: ['碳排优化', '光伏台账', '充电桩台账'] },
        { linkName: '楼层温度', linkData: ['能耗分析', '用电度量'] },
      ],
      linkData: ["历史数据", "供热数据"],
      dialogVisible: false,
      dialog_type: false,
      current: '首页',
      iconCommand: '',
      typeName: "首页"
    }
  },
  components: {
    Popup
  },
  created() {
    this.handleRouter()
  },
  mounted() {
  },
  methods: {
    handleRouter() {
      var round = this.$route.path
      switch (round) {
        case '/index':
          this.current = '首页'
          break
        case '/scadaMonitor':
          this.current = '暖通监视'
          if (window.location.search == "?graphId=4") {
            this.current = '多能流'
          } else if (window.location.search == "?graphId=5") {
            this.current = '暖通监视'
          }
          break
        case '/tab':
          this.current = '楼层温度'
          break
        case '/systemMonitoring':
          this.current = '控制指令'
          break
        case '/temperature':
          this.current = '历史数据'
          break
        case '/Heating':
          this.current = '历史数据'
          break
        case '/measurement':
          this.current = '用电度量'
          break
        case '/strategy':
          this.current = '碳排优化'
          break
        case '/photovoltaicAccount':
          this.current = '光伏台账'
          break
        case '/chargingPile':
          this.current = '充电桩台账'
          break
        default:
          break
      }
      this.handleCommand(this.current)
    },
    handleCommand(command) {
      this.typeName = command
      switch (command) {
        // case '首页':
        //   this.$router.push('index')
        //   this.current = command
        //   break
        case '多能流':
          this.$router.push({ name: 'scadaMonitor', query: { graphId: 4 } })
          this.current = command
          break
        case '暖通监视':
          this.$router.push({ name: 'scadaMonitor', query: { graphId: 5 } })
          this.current = command
          break
        case '用电分析':
          this.$router.push('electricQuantity')
          this.current = command
          break
        case '碳排优化':
          // this.$router.push("setup");
          this.$router.push('strategy')
          this.current = command
          break
        case '光伏台账':
          this.$router.push('photovoltaicAccount')
          this.current = command
          break
        case '楼层温度':
          this.$router.push('tab')
          this.current = command
          break
        case '用电度量':
          this.$router.push('measurement')
          this.current = command
          break
        case '力调分析':
          this.$router.push('adjustQuantity')
          this.current = command
          break
        case '负载率分析':
          this.$router.push('loadRateQuantity')
          this.current = command
          break
        case '充电桩台账':
          this.$router.push('chargingPile')
          this.current = command
          break
        case '控制指令':
          this.$router.push('systemMonitoring')
          this.current = command
          break
        default:
          break
      }
      this.iconCommand = command

    },
    homeClick() {
      this.$router.push('index')
      this.current = '首页'
      this.iconCommand = ''

    },
    dialogClick(command) {

      switch (command) {
        // case '首页':
        //   this.$router.push('index')
        //   this.current = command
        //   break
        case '历史数据':
          this.$router.push('temperature')
          this.current = command
          break
        case '供热数据':
          this.$router.push('Heating')
          this.current = command
          break
        default:
          break
      }
    },
    toolPop() {
      this.dialogVisible = true
    },
    isActive: function (tag) {
      console.log(tag)
      if (tag == "")

        return name
    },
  }
}
</script>

<style lang="less" scoped>
.el-footer {
  height: 0.4479rem !important;
  overflow: hidden !important;
}

.tagItem {
  width: 16px;
  height: 18px;
  margin-right: 0.03rem;

  // transform: rotate( -3deg);
  img {
    // transform: rotate( -3deg);
    padding-top: 0.03rem;
    margin-right: 0.03rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.tagItem-show {
  display: none;
}

.link-box {
  display: flex;
}

.footer {
  position: absolute;
  bottom: 0;
  left: 15%;
  right: 15%;

  background-image: url(../assets/image/bg-bottom.png);
  background-size: 100% auto;
  background-repeat: no-repeat;
  background-position: 0 100%;
  height: 0.4479rem !important;

  .footer-box {
    height: 100%;
    background-image: url(../assets/image/bg-ellipse.png);
    background-repeat: no-repeat;
    background-size: 100% auto;

    .content {
      display: flex;
      justify-content: space-around;
      height: 96%;
      width: 70%;
      color: #0094FF;
      margin: auto;

      .home-link {
        font-size: 18px;
        transform: rotate(-3.5deg);
        padding-top: 0.1rem;
        // color: #409eff;
        cursor: pointer;

        .indexIcon {
          position: absolute;
          margin: 0 auto;
        }
      }

      .dropdown1 {
        padding-top: 0.03rem;
        font-size: 18px;
        color: #0094FF;
        cursor: pointer;
        transform: rotate(-3deg)
      }

      .dropdown2 {
        padding-top: 0.01rem;
        font-size: 18px;
        color: #0094FF;
        cursor: pointer;
      }

      .dropdown3 {
        padding-top: 0.03rem;
        font-size: 18px;
        color: #0094FF;
        cursor: pointer;
        transform: rotate(2deg)
      }

      .dialog-link {
        cursor: pointer;
        font-size: 18px;
        color: #0094FF;
        transform: rotate(5deg);
        padding-top: 0.1042rem;
      }
    }
  }

  .unselected {
    // 未选中
    color: #0094FF;
    font-size: 18px;
  }

  .checked {
    //选中的
    color: #fff;
    font-size: 18px;
  }

  .current {
    width: 1.026rem;
    color: #fff;
    font-size: 16px;
    line-height: 0.0938rem;
    padding: 0.0469rem 0;
    text-align: center;
    background-image: url(../assets/image/bg-checked.png);
    background-repeat: no-repeat;
    background-size: 100% auto;
    position: absolute;
    bottom: 26%;
    left: 50%;
    margin-left: -0.5156rem;
  }
}
</style>
