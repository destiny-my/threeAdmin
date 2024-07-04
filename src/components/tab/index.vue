<template>
  <div class="tab-box title-fourth">
    <div class="btn">
      <div class="overall" v-for="(item,index) in tables" :key="index">
        <el-button :class="isActive(item.tab) ? 'tagItem title-fourth' : 'title-fourth'" @click="tabs(item.tab)">{{ item.name }}</el-button>
      </div>
    </div>
    <el-divider></el-divider>
    <div class="component">
      <component :is="tabsName"></component>
    </div>
  </div>
</template>

<script>

import CarbonAnalysis from "../../views/detection/carbonAnalysis.vue"
import WaterQuantity from "../../views/detection/waterQuantity.vue"
import ElectricQuantity from "../../views/detection/electricQuantity.vue"
import GasQuantity from "../../views/detection/gasQuantity.vue"
import FloorDetails from "../../views/detection/FloorDetails.vue"



export default {
  data() {
    return {
      tag: false,
      tabsName: 'FloorDetails',
      tables: [
        // {name: "总览", tab: "CarbonAnalysis"},
        // {name: "用电分析", tab: "ElectricQuantity"},
        {name: "楼层详情", tab: "FloorDetails"},
        // {name: "用气分析", tab: "GasQuantity"},
      ]
    }
  },
  components: {
    WaterQuantity, ElectricQuantity, CarbonAnalysis, GasQuantity,FloorDetails
  },
  methods: {
    tabs: function (name) {
      this.tabsName = name
    },
    isActive: function (tag) {
      return this.tabsName === tag
    }
  }
}

</script>

<style lang="scss" scoped>
.tab-box {
  height: 100%;
  //  margin-top:0.1042rem ;
  //  display: grid;
  //  grid-template-columns: 0.5208rem 0.5208rem 0.5208rem 0.5208rem;
  /* grid-template-rows: 0.5208rem 0.5208rem 0.5208rem; */

  .btn {
    height: 0.1823rem;
    display: flex;
    text-align: center;

    .margin {
      margin-left: 0.0521rem;
    }

    .overall {
      margin-right: 0.15625rem;
    }
  }

  .component {
    margin-top: 0.0781rem;
    height: calc(100% - 0.2344rem);
  }
}

.el-button {
  box-sizing: border-box;
  padding: 0;
  width: 0.7813rem;
  margin: 0;
  background-color: transparent;
  background-image: url('../../assets/image/weixianzhong.png');
  background-size: 100% 100%;
  border: none;
  height: 0.1823rem;
  color: #fff;
  font-family: "PingFangSC-Regular",serif;
}

// /deep/ .el-button:focus {
//   background-color: transparent;
//   // background-image: url('../../assets/image/xuanzhong.png') !important;
//   background-size: 100% 100%;
// }

.tagItem {
  background-color: transparent;
  background-image: url('../../assets/image/xuanzhong.png') !important;
  background-size: 100% 100%;
}

/deep/ .el-divider--horizontal {
  margin: 0;
  height: 0.0156rem;
  background-color: rgba(18, 65, 105, 1);
}
</style>
