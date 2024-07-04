<template>
  <div class="tab-box title-fourth">
      <div class="btn" >
        <div class="overall" v-for="(item,index) in btntlist" :key="index">
        <el-button :class="isActive(item.tab) ? 'tagItem title-fourth' : 'title-fourth'" @click="tabs(item.tab)">{{ item.name }}</el-button>
        </div>
        <!-- <div class="overall">
          <el-button autofocus="ture" v-focus @click="tabs('CapacityQuantity')">容需分析</el-button>
        </div>
        <div class="Electricity-consumption margin">
          <el-button @click="tabs('AdjustQuantity')" >力调分析</el-button>
        </div>
        <div class="water margin">
          <el-button  @click="tabs('LoadRateQuantity')">负载率分析</el-button>
        </div>
        <div class="gas margin">
          <el-button  @click="tabs('ChargeQuantity')">电费分析</el-button>
        </div> -->
      </div>
      <el-divider></el-divider>

      <div class="component">
        <component :is="tabsName"></component>

      </div>
  </div>
</template>

<script>
import AdjustQuantity from "../../views/detection/adjustQuantity.vue"
import CapacityQuantity from "../../views/detection/capacityQuantity.vue"
import LoadRateQuantity from "../../views/detection/loadRateQuantity"
import ChargeQuantity from "../../views/detection/chargeQuantity.vue"

// import mm from '../../assets/image/weixianzhong.png'


export default {

  data(){
    return{
      tabsName: 'CapacityQuantity',
      btntlist:[{name:"容需分析",tab:"CapacityQuantity"},{name:"力调分析",tab:"AdjustQuantity"},{name:"负载率分析",tab:"LoadRateQuantity"},{name:"电费分析",tab:"ChargeQuantity"},]


    }
  },

// directives: {
//           focus: {
//              inserted: function(el) {
//                el.focus();
//              }
//          }
//  },
  components:{
    CapacityQuantity,
    LoadRateQuantity,
    AdjustQuantity,
    ChargeQuantity
  },

methods:{
  tabs:function(name){
    this.tabsName = name
  },

  isActive:function(tag){
    if(this.tabsName == tag){
      // alert(tag)
      return true
    }
    return false

    }



}
}


</script>


<style lang="scss" scoped>

   .tab-box{
     height: 100%;
    //  margin-top:0.1042rem ;
      //  display: grid;
      //  grid-template-columns: 0.5208rem 0.5208rem 0.5208rem 0.5208rem;
       /* grid-template-rows: 0.5208rem 0.5208rem 0.5208rem; */
      .btn{
        height: 0.1823rem;
        display: flex;
        text-align: center;
        .margin{
          margin-left:0.0521rem;
        }
      }
      .component{
        margin-top:0.0781rem;
        height: calc(100% - 0.2344rem);
      }
    }
    .overall{
      margin-right:30px ;
    }


    .el-button{
        box-sizing: border-box;
        padding: 0;
        width:0.7813rem ;
        margin: 0;
        background-color:transparent ;
        background-image:url('../../assets/image/weixianzhong.png') ;
        background-size:100% 100%;
        border: none;
        height: 0.1823rem;
        color: #fff;
        font-size: 16px;
    }



.tagItem {
 background-color:transparent ;
  background-image:url('../../assets/image/xuanzhong.png') !important ;
  background-size:100% 100%;
}



/deep/.el-divider--horizontal{
  margin: 0;
  height: 0.0156rem;
  background-color: rgba(18,65,105,1);
}
</style>