<template>
  <div class="content">
    <el-row class="header" :gutter="5">
      <el-col class="header-title title-fifth" :span="6"><span>消费项目</span></el-col>
      <el-col class="header-title title-fifth" :span="6">
        <span>单价</span>
      </el-col>
      <el-col class="header-title title-fifth" :span="6">
        <span>数量</span>
      </el-col>
      <el-col class="header-title title-fifth" :span="6">
        <span>实际消费</span>
      </el-col>
    </el-row>
    <div class="progress-box">
      <div v-for="(item, index) in billData" :key="index">
        <el-row class="progress" :gutter="5" :class="{'other-st1': item.desc === '*电度电费','other-st3': item.name === '*力调电费', 'other-st2': item.desc === '*基本电费' }">
          <!-- <el-col class="progress-title title-fifth" :span="6"><span>{{ item.name }}</span></el-col> -->
          <el-col class="progress-title title-fifth" :span="6" :class="{'other-st2': item.name === '*力调电费' }"><span>{{ item.desc }}</span></el-col>
          <el-col class="progress-price title-fifth" :span="6">
            {{ item.price }}
          </el-col>
          <el-col class="progress-num title-fifth" :span="6">
            <span>{{ item.num }}</span>
          </el-col>
          <el-col class="progress-price title-fifth" :span="6">
            <span>{{ item.sumVal }}</span>
          </el-col>
        </el-row>
      </div>
    </div>
    <el-row class="footer" :gutter="5">
      <el-col class="header-title title-fifth" :span="6"><span>合计</span></el-col>
      <el-col class="footer-title title-fifth" :span="6" :offset="12">
        <span>{{ summarySumVal }}</span>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  props: {
    billData: {
      type: Array,
      default: []
    },
    summarySumVal: {
      type: String,
      default: {}
    },
  },
}
</script>

<style lang="less" scoped>
.content {
  display: flex;
  flex-direction: column;
  // padding: 10px 10px 15px 25px;
  line-height: 35px;
  height: 100%;

  .header {
    // border-bottom: 1px solid #308ec1;
    margin-bottom: 10px;
    border-radius: 4px;
    font-weight: bold;
    background: rgba(0, 59, 100, 0.7);

    .header-title {
      text-align: center;
    }
  }

  .progress-box {
    overflow-y: auto;

    .progress {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;

      .progress-title {
        text-align: center;
      }

      .progress-num {
        text-align: center;
        color: #02b8ff;
      }

      .progress-price {
        text-align: center;
        color: #02b8ff;
      }
    }

    .other-st1 {
      font-weight: bold;
      border-top: 1px solid #506B98;
    }
    .other-st3 {
      border-top: 1px solid #506B98;
    }
    .other-st2 {
      font-weight: bold;
    }
  }

  .footer {
    border-radius: 4px;
    font-weight: bold;
    background: rgba(0, 59, 100, 0.7);

    .header-title {
      text-align: center;
    }

    .footer-title {
      text-align: center;
    }
  }
}
</style>
