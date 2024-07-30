<template>
    <div class="tabs">
      <figure v-for="(tab,index) in tabs" 
              :key="index"
              class="tab"
              :class="getTabClass(tab.id)">
        <nav class="tab__header">
          <button class="tab__button"
                  @click="selectTabById(tab.id)">
            <span  >{{ tabNameList[index] }}</span>
          </button>
        </nav>
        <div class="tab__content" v-if="currentTabIndex==0">
            <div style="display: flex;height:  100%;width: 100%;justify-content: space-between;">
                <div class="imgBox" style=""></div>
                <div style="width: 49%;">{{ tab.content[currentTabIndex] }}</div>
            </div>
   
          </div>

        <div class="tab__content" v-if="currentTabIndex==1" style="background: none;">
                <PieChart v-if="currentTabIndex==1"  pId="chartCurvesCarbon" :pResize="chartResize" pStyle="width: 100%; height: 100%;z-index: 10000;" :pOption="optionCurvesCarbon"></PieChart>
          </div>
        <div class="tab__content" v-if="currentTabIndex==2">
            <!-- <div style="height:  100%;width: 100%;z-index: 2;">
                <PieChart pId="chartCurvesCarbon" :pResize="chartResize" pStyle="width: 100%; height: 100%;" :pOption="optionCurvesCarbon"></PieChart>
            </div> -->
          <!-- <div class="skeleton"
               v-for="content in tab.content"
               v-bind:style="{ width: content.width + '%' }" :key="content"></div> -->
          </div>
      </figure>
    </div>
  </template>
  
  <script>
  const TABS_AMOUNT = 3;
  const CONTENT = Array.from({ length: TABS_AMOUNT },
    () => Array.from(
        [`在这悠长岁月的一隅，我轻踏着晨曦的微光而来，名曰【梦行者】，心怀万卷书，行过千山万水，只为寻觅那一抹灵魂深处的静谧与炽热。

我的灵魂，仿佛古木逢春，历经风霜而愈显坚韧，又似溪涧清泉，潺潺流淌，滋养着周遭每一寸土地。我以笔为舟，墨为海，在知识的汪洋中悠然航行，探索着未知与智慧的彼岸。`, "dsadasdasdasd", "sadasdasdasdasdasdas"], 
      (item,index) => (item)
    )
  );
  import PieChart from '@/views/detection/components/pieChart.vue';
  import {SuiPingBar} from "@/api/carbon/option";
  
  export default {
    components:{PieChart},
    data() {
      return {
        tabs: CONTENT.map((content, id) => ({id,content})),
        tabNameList:["追梦者","前端篇","后端篇"],
        currentTabIndex: 0,
        prevTabIndex: 2,
        chartResize:1,
        optionCurvesCarbon:SuiPingBar
      };
    },
    methods: {
      getTabClass(id) {
        console.log(this.tabs)
        return [{
          'tab--current': this.currentTabIndex === id,
          'tab--prev': this.prevTabIndex === id
        }];
      },

      // optionBarfunc(){
      //   this.optionCurvesCarbon.series[0].itemStyle.color = 
      // },
      selectTabById(id) {
        this.optionCurvesCarbon = SuiPingBar;
        if (id === this.currentTabIndex) { return; }
        // this.prevTabIndex = this.currentTabIndex;
        this.currentTabIndex = id;
      }
    },
  };
  </script>
  
  <style >

  

    
    html {
      --color-light: #665e68;
      --color-regular: #353637;
      --color-semidark: #9f946f;
      --color-dark: #bfb48f;
      --color-accent: #f2efe9;
      --color-background: #564e58;
      --color-background-a: #200e15;
      --color-background-b: #151617;
      --font-size: 0.5em;
      /* font-family: Arial, sans-serif;
      display: flex;
      background:
        linear-gradient(
          to bottom,
          var(--color-background-b),
          var(--color-background-a)
        );
      overflow: hidden; */
    }
  
    /* body {
      color: var(--color-regular);
      margin: 0;
      flex: 1;
      display: flex;
      flex-flow: column;
      align-items: center;
      justify-content: center;
    } */
    
    .tabs {
      /* min-width: 400px; */
      max-width: 100%;
      position: relative;
      perspective: 1000px;
      height: 100%;
    }
  
    .tab {
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      margin: 0;
      pointer-events: none;
      display: flex;
      flex-flow: column;
      z-index: 0;
      animation: swipe 1200ms ease;
      
      --border-radius: 12px;
      --border-radius-small: calc(var(--border-radius) / 4);
    }
  
    .tab__header {
      background: transparent;
      display: flex;
      height: 15%;
      margin-bottom: calc(0px - var(--border-radius-small));
      padding: 0 var(--border-radius-small);
    }
  
    .tab__button {
      position: relative;
      pointer-events: all;
      cursor: pointer;
      font: inherit;
      font-size: var(--font-size);
      outline: none;
      border: 0;
      color: var(--color-light);
      background: var(--color-semidark);
      width: 32.5%;
      /* font-weight: 600; */
      border-radius: var(--border-radius) var(--border-radius) 0 0;
      transition: all 160ms ease;
    }
    
    .tab__button:hover {
      background: var(--color-dark);
    }
    
    .tab.tab--current {
      animation: none;
      z-index: 1;
    }
    
    .tab.tab--current .tab__content,
    .tab.tab--current .tab__button,
    .tab.tab--prev .tab__content,
    .tab.tab--prev .tab__button {
      box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.36);
    }
    .imgBox{
        /* float: left; */
        height: 100%;
        width: 50%;
        background: url("../../assets/image/bg.jpg");
        background-size: 100% 100%;
    }
    
    .tab.tab--prev {
      z-index: -1;
    }
    
    .tab.tab--current .tab__button {
      color: var(--color-regular);
      background: var(--color-accent);
    }
    
    .tab:nth-child(1) .tab__button {
      justify-self: flex-start;
      margin: 0 auto 0 0;
    }
    
    .tab:nth-child(2) .tab__button {
      justify-self: center;
      margin: 0 auto;
    }
    
    .tab:nth-child(3) .tab__button {
      justify-self: flex-end;
      margin: 0 0 0 auto;
    }
  
    .tab__content {
      text-align: justify;
      height: 100% !important;
      font-size: 0.07rem;
      line-height: 1.25;
      flex: 1;
      transform-style: preserve-3d;
      pointer-events: all;
      background: var(--color-accent);
      padding: 1.5em 2em;
      border-radius: 
        var(--border-radius-small) 
        var(--border-radius-small)
        var(--border-radius) 
        var(--border-radius);
    }
    
    .skeleton {
      width: 100%;
      height: 1em;
      border-radius: --border-radius-small;
      background: var(--color-dark);
    }
    
    .skeleton + .skeleton {
      margin-top: 0.5em;
    }
    
    .bar {
      display: inline-block;
      width: 0.5em;
      height: 0.5em;
      /* margin: 0 0.1em; */
      border-radius: --border-radius-small;
      background: var(--color-background);
      transition: all 260ms ease;
    }
    
    .tab--current .bar {
      background: var(--color-dark);
    }
    
    @keyframes swipe {
      0% {
        transform: translate3d(0, 0, 0);
        z-index: 2;
      }
      50% {
        transform: translate3d(80%, 0, 100px) rotate3d(0, 1, 0, -80deg);
        z-index: -1;
      }
      51% { z-index: -1; }
      100% {
        transform: translate3d(0, 0, 0);
      }
    }
    
    @media only screen and (max-width: 400px) {
      .tabs {
        min-width: 100%;
      }
    }
  </style>
  