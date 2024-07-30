<template>
  <!-- 首页 -->
  
    <!-- 中间 -->
    <div class="main">
      <!-- <div>123123</div> -->
      <!-- 3D图 -->
      <div class="rightBox" ref="typedRef" v-if="typedType">
        <vue-typed-js :strings="['您好！我是杨鑫</br>这是我的作品集']" :loop="true">
        <h1 class="typing"></h1>
      </vue-typed-js>
      </div>
      <div class="LeftBox">
          <description></description>
      </div>
      <div class="main-3d">
        <Three ref="ThreeRef" />
      </div>

    </div>
</template>

<script>
import DatePicker from "@/components/datePicker.vue";
import Three from "./Three/floor.vue";
import description from "./mainPage/description.vue";


export default {
  components: { DatePicker, Three,description},
  data(){
    return{
      typedType:true
    }
  }
};
</script>

<style lang="less" scoped>

.container {
  // display: flex;
  height: 100%;
  justify-content: space-between;
  width: 400px;
  color: #def1fd;
  font-weight: 500;

  .main-left {
    width: 23%;
    height: 100%;
    z-index: 3;
    background: red;


    .main-left-weather {
      height: 0.91rem;
      background: rgba(58, 91, 125, 0.15);
      border: 0.0052rem solid #3a5b7d;
      border-radius: 0.0417rem;

      .weather-target {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: space-between;

        img {
          width: 0.3646rem;
          height: 0.3646rem;
        }

        .target-left {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-around;
          width: 45%;

          .temp {
            font-size: 0.1667rem;
            font-weight: bold;
          }
        }

        .target {
          width: 50%;
          padding-left: 10%;
          height: 100%;
          display: grid;
          align-items: center;

          .target-name {
            width: 35%;
            display: inline-block;
          }

          .target-num {
            font-weight: 400;
          }
        }
      }
    }

    .main-left-trends {
      height: calc(100% / 3);
      padding: 5px;
      backdrop-filter: blur(2px) saturate(200%);
      background-color: rgba(255, 255, 255, 0);
      border-radius: 12px;
      border: 1px solid rgba(209, 213, 219, 0.3);
      margin-bottom: 4px;
    }

    .main-left-space {
      height: calc(100% / 3);
      padding: 5px;
      backdrop-filter: blur(2px) saturate(200%);
      background-color: rgba(255, 255, 255, 0);
      border-radius: 12px;
      border: 1px solid rgba(209, 213, 219, 0.3);
      margin-bottom: 4px;

      .floorBox {
        display: flex;
        height: 78px;
        margin: 2px;
      }

      .carousel-floor {
        display: flex;
        justify-items: center;
        align-items: center;
        height: 100%;
        background: rgba(34, 255, 204, 0.3);
        border-radius: 0.0208rem;
        margin: 0 0.026rem 0.0521rem 0.026rem;

        .floor-name {
          width: 0.19rem;
          // word-break: keep-all;
          height: 100%;
          background: rgba(254, 254, 254, 0.3);
          display: initial;
          text-align: center;
          font-weight: 500;
          color: #42f6b6;
          border-top-left-radius: 0.0208rem;
          border-bottom-left-radius: 0.0208rem;

          span {
            // display: inline-block;
            // margin-top: 0.0781rem;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 4;
            white-space: normal;
            overflow: hidden;
            text-overflow: ellipsis;
            // border: 1px solid rgba(0, 0, 0, 0.1);
          }
        }

        .floor-right-box {
          padding: 7.0064px 6px;
          display: flex;
          justify-items: center;

          .floor-right {
            width: 0.3646rem;

            .floor-rate1 {
              width: 100%;
            }

            .floor-rate2 {
              display: inline-block;
              margin-top: 0.0521rem;
            }
          }

          .floor-right-img {
            display: flex;
            align-items: flex-end;

            img {
              width: 0.1042rem;
              height: 0.1042rem;
              padding-bottom: 0.0208rem;
            }
          }
        }
      }
    }

    .main-left-power {
      // height: 35%;
      height: calc(75% - 1.5625rem);
      padding-top: 0;
      z-index: 3;
    }
  }



  .main-right {
    width: 23%;
    height: 100%;

    .main-right-trends {
      height: calc(100% / 3);
      // height: calc((100% - 1.5625rem) / 2);
      padding: 5px;
      backdrop-filter: blur(2px) saturate(200%);
      background-color: rgba(255, 255, 255, 0);
      border-radius: 12px;
      border: 1px solid rgba(209, 213, 219, 0.3);
      margin-bottom: 4px;

    }

    .main-right-intensity {
      height: 1.25rem;

      .box-carbon-margin {
        margin-top: 0;
      }

      .intensity-box {
        display: flex;
        justify-content: space-around;
        align-items: center;

        .carbon {
          height: 0.7448rem;
          width: 0.9167rem;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;

          .yes-num {
            font-size: 0.1302rem;
            color: #fff;
            line-height: 0.2292rem;
          }

          .yes-name {
            font-weight: normal;
          }
        }

        .decline {
          width: 0.7rem;
          height: 0.2rem;
          background: rgba(61, 153, 221, 0.1);
          border-radius: 0 0 0.1042rem 0;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0.03rem auto;
          z-index: 3;

          span {
            color: #ffffff;
            padding-left: 0.0521rem;
          }
        }

        .yes {
          background: url("../assets/image/icon-yesterday.png") no-repeat;
          background-size: 100% 100%;
        }

        .aver {
          background: url("../assets/image/icon-average.png") no-repeat;
          background-size: 100% 100%;
        }
      }
    }

    .main-right-overview {
      z-index: 3;
      height: 1.40625rem;

      .overview-box {
        display: flex;
        width: 100%;
        height: 0.2865rem;
        justify-content: space-around;

        .overview-box-img {
          display: inline-block;
          width: 0.2865rem;
          height: 100%;
          z-index: 3;

          background-image: url("../assets/image/bg-carbon.png");
          background-size: 100% 100%;

          img {
            width: 100%;
            height: 100%;
          }
        }

        .overview-box-content {
          z-index: 3;
          width: calc(100% - 0.4167rem);
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 0.0417rem;
          margin: 0.0208rem 0;
          background: rgba(0, 149, 255, 0.2);

          .overview-box-content-title {
            width: calc(25% - 0.026rem);
            text-align: center;

            .info-blue {
              display: inline-block;
              padding-top: 0.0104rem;
              font-weight: 500;
              color: #0094ff;
            }

            .info-green {
              display: inline-block;
              padding-top: 0.0104rem;
              font-weight: 500;
              color: #47e5af;
            }
          }
        }
      }
    }

    .main-right-performance {
      // height: calc(100% - 2.65625rem);
      height: calc((100% - 1.4957rem) / 2);
      z-index: 3;

      .performance-box {
        height: calc(100% - 0.1979rem);
        padding: 0 0.026rem 0 0.0421rem;

        .performance-box-title {
          text-align: center;
          margin-bottom: 0.026rem;
        }

        .img-col {
          // text-align: left;
        }

        .bg-col {
          background: rgba(0, 149, 255, 0.2);
          height: 80%;
          display: flex;
          justify-content: center;
          align-items: center;
          // margin: 0.0208rem 0;
          // height: 0.2448rem;
        }

        .angle1 {
          border-top-left-radius: 0.0417rem;
          border-bottom-left-radius: 0.0417rem;
        }

        .angle2 {
          border-top-right-radius: 0.0417rem;
          border-bottom-right-radius: 0.0417rem;
        }

        .performance-box-content {
          // height: 14%;
          // height: 0.2865rem;
          height: calc((100% - 30px) / 4);
          border-radius: 0.026rem;
          // background: rgba(0, 149, 255, 0.2);
          text-align: center;

          // margin-top: 1px;
          .performance-col {
            height: 100%;

            .performance-box-img {
              display: inline-block;
              // width: 0.2448rem;
              // height: 0.2448rem;
              z-index: 3;

              //background: url("../assets/image/bg-carbon.png") no-repeat;
              //background-size: 100% 100%;
              height: 80%;

              img {
                width: 100%;
                height: 100%;
              }
            }

            .performance-box-content-title {
              // line-height: 0.2448rem;
            }

            .performance-box-content-criterion {
              color: #0094ff;
              font-weight: 500;
              // line-height: 0.2448rem;
            }

            .performance-box-content-rate {
              color: #47e5af;
              font-weight: 500;
              // line-height: 0.2448rem;
            }
          }
        }
      }
    }

    .valveBox {
      width: 100%;
      height: calc(100% - 55px);
      display: flex;
    }
  }
}

.main {
  width: 100%;
  height: 100%;
    // position: absolute;
    // background: #0094ff;

    
    .main-3d {
      width: 100%;
      height: 100%;
      background: #5c6972;
      z-index: -1;
    }
    .LeftBox{
      z-index: 1;
      position: absolute;
      height: 5%;
      width: 100%;

    }
    .rightBox{
      position: absolute;
      top: 25%;
      left: 5%;
      height: 30%;
      width: 40%;
      font-size: 0.2rem;
      -webkit-background-clip: text;
      background-clip: text;
      background-image: linear-gradient(rgb(73, 120, 70), rgb(51, 38, 103));
      -webkit-text-fill-color: transparent;
      // background: red;
      z-index: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      
    }
  }
.el-carousel__indicators {
  z-index: 1;
}

.el-carousel__item.is-active {
  z-index: 1;
}
</style>
