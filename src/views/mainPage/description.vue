<template>
  <div class="titleMain">
    <el-drawer
      :visible.sync="drawer"
      :modal="false"
      :show-close="false"
      :with-header="false">

      <div class="userCentent">
        <CardTab></CardTab>
      </div>
      <div class="bookBox" v-for="(item,index) in bookData" :key="index">
        <figure class='book'>
						<ul class='hardcover_front'>
							<li>
								<div class="coverDesign yellow">
									<span class="ribbon">NEW</span>
									<h1>{{ item.name }}</h1>
									<p>TRANSFORM</p>
								</div>
							</li>
							<li></li>
						</ul>
						<ul class='page'>
							<li></li>
							<li></li>
							<li></li>
							<li></li>
							<li></li>
							<li></li>
							<li></li>
						</ul>
				</figure>
        <figure class='book'>
						<ul class='hardcover_front'>
							<li>
								<div class="coverDesign grey">
									<span class="ribbon">NEW</span>
									<h1>{{item.name2}}</h1>
									<p>TRANSFORM</p>
								</div>
							</li>
							<li></li>
						</ul>
						<ul class='page'>
							<li></li>
							<li></li>
							<li></li>
							<li></li>
							<li></li>
							<li></li>
							<li></li>
						</ul>
				</figure>
        <figure class='book'>
						<ul class='hardcover_front'>
							<li>
								<div class="coverDesign blue">
									<span class="ribbon">NEW</span>
                  <h1>{{item.name3}}</h1>

									<p>TRANSFORM</p>
								</div>
							</li>
							<li></li>
						</ul>
						<ul class='page'>
							<li></li>
							<li></li>
							<li></li>
							<li></li>
							<li></li>
							<li></li>
							<li></li>
						</ul>
				</figure>
      </div>
    </el-drawer>
    <div class="iconBox">
      <div class="container" @click="chesh" ref="containerRef">
        <div class="bar1"></div>
        <div class="bar2"></div>
        <div class="bar3"></div>
      </div>
    </div>

  </div>
</template>

<script>
import gsap from "gsap";
import '../../assets/styles/book.css'
import CardTab from "../../components/tab/cradTab.vue"
export default {
  components:{CardTab},
  data() {
    return {
      timer: false,
      AnimatedTracks: "",
      drawer: false,
      bookData:[{name:"css",name2:"html",name3:"js"},{name:"three",name2:"vue",name3:"Blender"},{name:"java",name2:"python",name3:"pcb"}]
    };
  },
  mounted() {  
    this.throttledMyFunction = this.throttle(this.myFunction, 1000)
        // 在组件挂载时创建节流函数实例  
    }, 
    
  methods: {
    myFunction(x) {
      this.AnimatedTracks = this.$parent.$refs.ThreeRef.AnimatedTracks;
      let clssNum = this.$refs.containerRef.classList.length;
      // let group = this.$parent.$refs.ThreeRef.viewer.scene.children[3];
      let group
      this.$parent.$refs.ThreeRef.viewer.scene.children.map((item)=>{
          if(item.name == "modelParent"){
              group = item
          }
      })
      console.log(group)
      if (clssNum == 1) {
        gsap.to(group.position, {
          z: group.position.z + 4,
          duration: 1,
          ease: "Bounce.inOut",
        });

        // group.rotation.y =Math.PI /4;
        gsap.to(group.rotation, {
          y: Math.PI / 4,
          duration: 1,
          ease: "Bounce.inOut",
        });
        this.drawer = true
        window.removeEventListener('wheel',this.$parent.$refs.ThreeRef.mousewheelFunc);
        this.$parent.$refs.ThreeRef.d3Container2 = false
        this.$parent.typedType = false


      } else if (clssNum == 2) {
        gsap.to(group.position, {
          z: group.position.z - 4,
          duration: 1,
          ease: "Bounce.inOut",
        });
        // group.rotation.y =Math.PI /4;
        gsap.to(group.rotation, {
          y: -Math.PI / 4,
          duration: 1,
          ease: "Bounce.inOut",
        });
        this.drawer = false
        window.addEventListener('wheel',this.$parent.$refs.ThreeRef.mousewheelFunc);
        this.$parent.$refs.ThreeRef.d3Container2 = true
        this.$parent.typedType = true
      }
      this.$refs.containerRef.classList.toggle("change");

      // this.timer = null; // 在delay后执行完fn之后清空timer，此时timer为假，throttle触发可以进入计时器

    },

    debounce(func, delay) {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        func.apply(this, arguments);
      }, delay);
    },
    // 创建节流函数  
    throttle(fn, limit) {  
        let lastFunc;  
        let lastRan;  
        return function () {  
            const context = this;  
            const args = arguments; // 捕获所有传递给函数的参数  
            if (!lastRan) {  
                // 如果没有执行过，则立即执行函数  
                fn.apply(context, args);  
                lastRan = Date.now();  
            } else {  
                // 如果之前执行过，则检查时间间隔  
                clearTimeout(lastFunc);  
                lastFunc = setTimeout(function () {  
                    if ((Date.now() - lastRan) >= limit) {  
                        fn.apply(context, args);  
                        lastRan = Date.now();  
                    }  
                }, limit - (Date.now() - lastRan));  
            }  
        };  
    }, 
    chesh(){
      this.throttledMyFunction(); // 假设节流间隔为1000毫秒  
        // setTimeout(throttledFunction, 500); // 第二次调用被节流  
        // setTimeout(throttledFunction, 1500); // 第三次调用，因为距离上次执行已经超过
    }
  } 
};
</script>

<style lang="less" scoped>
.titleMain {
  height: 100%;
  width: 100%;
  padding-top: 2%;
  padding-right: 2%;
  // position: relative;
  // display:flex;
  // align-items: center;
}
.userCentent{
  margin-top:20px ;
  height: 30%;
  width: 100%;
  padding: 0 40px;
  background-color: var(--white);
  border-radius: 2.5rem;
  user-select: none;
  // background: red;
  
  // .tab{
  //   display: flex;
  //   justify-content: center;
  //   width: 100%;
  //   height: 15%;
  //   div{
  //     display: flex;
  //   justify-content: center;
      
  //     align-items: center;
  //     height: 100%;
  //     width: 25%;
  //     border:1px solid pink ;
  //   }

  // // }
  // .userImg{
  // }
}
.bookBox{
  display: flex;
  height:22%;
  justify-content: space-between;
  padding-top:20px ;
  padding-left: 60px;
  .bookCentent{
    height: 100%;
    background: red;
    width: 50%;
  }
  // background: red;
}
.el-dialog__wrapper{
  z-index: 0 !important;
}

/deep/ .el-drawer__open .el-drawer.rtl {
    animation: rtl-drawer-in 1000ms cubic-bezier(0, 0, 0.2, 1) 0ms !important;
}

// /deep/  .el-drawer.rtl{
//   animation: rtl-drawer-in 1500ms cubic-bezier(0, 0, 0.2, 1) 0ms !important;
// }
.iconBox {
  float: right;
  height: 100%;
  display: flex;
  align-items: center;

}
.iconBox:after {
  clear: both;
}

.container {
  z-index: 10 !important;
  // background: pink;
  background-color: #ff923e;
  padding: 0 3px;
  border-radius: 15%;
  background-image: radial-gradient(circle at center, #ff9b4f 50%, transparent 50%);
  display: inline-block;
  cursor: pointer;
}

.bar1,
.bar2,
.bar3 {
  width: 35px;
  height: 5px;
  background-color: #ffffff;
  margin: 6px 0;
  transition: 0.4s;
}

.change .bar1 {
  -webkit-transform: rotate(-45deg) translate(-9px, 6px);
  transform: rotate(-45deg) translate(-9px, 6px);
}

.change .bar2 {
  opacity: 0;
}

.change .bar3 {
  -webkit-transform: rotate(45deg) translate(-8px, -8px);
  transform: rotate(45deg) translate(-8px, -8px);
}

@media only screen and (max-width: 100px) {
  /deep/ .el-drawer rtl{
    width: 100% !important;
  }
}
@media only screen and (max-width: 500px) {
    body {
        background-color: #ccc;
    }
}
@media only screen and (max-width: 1000px) {
    body {
        background-color: #ddd;
    }
}
</style>