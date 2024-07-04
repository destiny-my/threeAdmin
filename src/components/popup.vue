<template>
  <div class="centent">
    <dv-border-box-12 class="card-box">
      <div class="dialog">
        <img class="image" src="../assets/image/icon-close.png" alt="" @click="close">
        <div class="tab-box title-fourth">
          <!-- <div class="btn">
            <div class="overall" v-for="(item,index) in tables" :key="index">
              <el-button :class="isActive(item.tab) ? 'tagItem title-fourth' : 'title-fourth'" @click="tabs(item.tab)">{{ item.name }}</el-button>
            </div>
          </div>
          <el-divider></el-divider> -->
          <div class="component">
            <component :is="tabsName"></component>
          </div>
        </div>
      </div>
    </dv-border-box-12>
  </div>
</template>

<script>
import AllToTco from "../views/formula/allToTco.vue"
import ElecToTco from "../views/formula/elecToTco.vue"
import GasToTco from "../views/formula/gasToTco.vue"
import WaterToTco from "../views/formula/waterToTco.vue"

export default {
  data() {
    return {
      tag: false,
      tabsName: 'AllToTco',
      tables: [
        {name: "全部转碳排", tab: "AllToTco"},
        {name: "电转碳排", tab: "ElecToTco"},
        {name: "气转碳排", tab: "GasToTco"},
        {name: "水转碳排", tab: "WaterToTco"}
      ]
    }
  },
  components: {
    AllToTco, ElecToTco, GasToTco, WaterToTco
  },
  methods: {
    tabs: function (name) {
      this.tabsName = name
    },
    isActive: function (tag) {
      return this.tabsName === tag
    },
    close() {
      this.$emit("close")
    }
  }
}
</script>

<style lang="less" scoped>
.centent {
  position: absolute;
  top: 0;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  height: 100%;
  z-index: 11;
}

.image {
  position: absolute;
  right: 3px;
  cursor: pointer;
}

.card-box {
  position: absolute;
  left: 20%;
  top: 20%;
  height: 55%;
  width: 55%;
  background: rgba(7, 25, 54, 0.5);
  border-radius: 25px;
  padding: 15px 20px;
  margin: 0;
  // background: url("../assets/image/bg-little.png") no-repeat;
  // background-size: 100% 100%;
  box-shadow: 0px 0px 10px #071936 inset, 0px 0px 0px 20px rgba(7, 25, 54, 0.5) inset,;
  color: #ffffff;

  .dialog {
    // padding: 20px;
    height: calc(100% - 30px);
  }
}

.tab-box {
  height: 100%;

  .btn {
    height: 0.1823rem;
    display: flex;
    text-align: center;

    .margin {
      margin-top: 0.9521rem;
      margin-left: 0.0521rem;
    }

    .overall {
      margin-right: 0.15625rem;
    }
  }

  .component {
    margin-top: 0.0781rem;
    height: calc(100% - 0.1044rem);
  }
}

.el-button {
  box-sizing: border-box;
  padding: 0;
  width: 0.7813rem;
  margin: 0;
  background-color: transparent;
  background-image: url('../assets/image/weixianzhong.png');
  background-size: 100% 100%;
  border: none;
  height: 0.1823rem;
  color: #fff;
  font-family: "PingFangSC-Regular", serif;
}

// /deep/ .el-button:focus {
//   background-color: transparent;
//   background-image: url('../assets/image/xuanzhong.png') !important;
//   background-size: 100% 100%;
// }

.tagItem {
  background-color: transparent;
  background-image: url('../assets/image/xuanzhong.png') !important;
  background-size: 100% 100%;
}

/deep/ .el-divider--horizontal {
  margin: 0;
  height: 0.0156rem;
  background-color: rgba(18, 65, 105, 1);
}
</style>
