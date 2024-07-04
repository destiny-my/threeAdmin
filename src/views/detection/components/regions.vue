<template>
  <div class="content">
    <el-row class="header" :gutter="5">
      <el-col class="header-title title-fifth" v-for="(item, index) in titleData" :key="index" :span="item.spanData"><span>{{ item.name }}</span></el-col>
    </el-row>
    <div class="progress-box">
      <el-row class="progress" v-for="(item, index) in progressData" :key="index" :gutter="5">
        <el-col class="progress-title title-fifth" :span="4"><span>{{ item.name }}</span></el-col>
        <el-col class="progress-bar title-fifth" :span="12">
          <el-progress :text-inside="true" :stroke-width="20" :percentage="item.proportionVal | keepDecimalNum"></el-progress>
        </el-col>
        <el-col class="progress-desc title-fifth" :span="4">
          <span class="color-carbon">{{ item.ceValue | keepDecimal }}</span>
        </el-col>
        <el-col class="progress-desc title-fifth" :span="4">
          <span class="color-mom">{{ item.mom | keepDecimal }}%</span>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    progressData: {
      type: Array,
      default: []
    },
    titleData: {
      type: Array,
      default: []
    }
  },
}
</script>

<style lang="less" scoped>
.content {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px 10px;
  line-height: 25px;

  .header {
    border-bottom: 1px solid #308ec1;
    margin-bottom: 5px;
    border-radius: 4px;
    font-weight: bold;

    .header-title {
      text-align: center;
    }
  }

  /deep/ .el-progress-bar__outer {
    background-color: rgba(2, 44, 86, 0.75);
  }

  .progress-box {
    overflow-y: auto;

    .progress {
      width: 100%;
      align-items: center;

      .progress-title {
        text-align: left;
      }

      .progress-bar {
      }

      .progress-desc {
        text-align: right;
      }
    }
  }
}
</style>
