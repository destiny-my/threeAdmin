<!--THREEJS组件-->
<template>
  <div class="thhreeMain">
    <div id="d3Container" v-loading="loading" ref="mainContent"></div>
    <div class="d3Container1"></div>
    <div class="d3Container2"></div>
  </div>
</template>
<script>
import gsap from "gsap";
import { overviewEnergyConsumptionInfo } from "../../api/three/three";
import { modelUrl } from "@/api/url/modelUrl.js";
import Materials from "../../components/three/shaders/Materials.js";
import { TWEEN } from "three/examples/jsm/libs/tween.module.min.js";

export default {
  name: "ThreePage",
  props: {
    /*模型资源地址*/
    ossPath: {
      type: String,
      default() {
        return "";
      },
    },
    /*文件类型*/
    suffix: {
      type: String,
      default() {
        return "gltf";
      },
    },
    AutoFresh: {
      type: Boolean,
      default() {
        return true;
      },
    },
    /*是否开启自动旋转*/
    autoAnimate: {
      type: Boolean,
      default() {
        return true;
      },
    },
    /*当前模型的颜色*/
    currentColor: {
      type: String,
      default() {
        return "";
      },
    },
    /*配准后的颜色*/
    matchedColor: {
      type: String,
      default() {
        return "";
      },
    },
    /*配准后的地址*/
    matchedOssPatch: {
      type: String,
      default() {
        return "";
      },
    },
    showMatchWatch: {
      type: Boolean,
      default() {
        return false;
      },
    },
  },
  data() {
    return {
      showTbale: true,
      loading: false,
      publicPath: process.env.BASE_URL,
      mesh: null,
      camera: null,
      viewer: null,
      AnimatedTracks: null,
      // scene: null,
      originX: 0,
      originY: 4,
      originZ: 0,
      renderer: null,
      // controls: null,
      labelRenderer: "",
      modelMoveName: null,
      Newlist: [],
      model: {},
      setinterTimeFunc: "",
      Labels: "",
      typeAnimate: false,
      oldModelL: null,
      addCss2dLabelArr: [],
    };
  },
  mounted() {
    // this.electricity()
    this.init();
  },
  methods: {
    /**
     * 组件被销毁时,干掉所有3D资源
     */
    destroyed() {
      this.clear();
    },

    /**
     * 初始化函数
     */
    init() {
       this.AnimatedTracks = new this.$modules.AnimatedTracks();

      this.viewer = new this.$modules.Viewer("d3Container"); //初始化场景
      // this.viewer.addAxis()
      // let labels = new this.$modules.Labels(this.viewer) //初始化场景
      // let skyBoxs = new this.$modules.SkyBoxs(this.viewer)//添加天空盒和雾化效果
      // skyBoxs.addSkybox(1)
      // this.Labels = new this.$modules.Labels(this.viewer) //初始化场景

      this.viewer.camera.position.set(5.4, 2,0); //设置相机位置

      let modeloader = new this.$modules.ModelLoder(this.viewer);

      modeloader.shadersFunc()
      // this.clickFunc();
      this.loadLoader();
      this.createLight();
      this.mousemoveFunc();
      this.mousewheelFunc();
      // this.mousedownFunc()
    },

    /**
     * 清除当前所有场景
     */
    clear() {
      this.mesh = null;
      this.camera = null;
      this.scene = null;
      this.renderer = null;
      this.controls = null;
      cancelAnimationFrame(this.animationId);
    },

    /**
     * 模型加载
     */
     loadLoader() {
      let modeloader = new this.$modules.ModelLoder(this.viewer);
      // gsap.to(this.viewer.camera.position, {
      //   x: 5,
      //   y: 1,
      //   z: 0,
      //   duration: 2,
      //   ease: "Bounce.inOut",
      // });
   
      // modeloader.Cylinder(1,1,5)
      modeloader.loadModelToScene("/model/room.glb", (_model) => {
        this.model["room"] = _model;
        _model.object.parent.rotation.x = -0.03;

        _model.object.parent.rotation.y = -Math.PI / 4;

        console.log(_model);
        _model.object.parent.position.set(0, -2.3, -2.3);
        // _model.object.scale.set(2, 2, 2);
        // this.model = _model
        // let positions =  modeloader.combineBuffer(_model.object,"position")
        // modeloader.createMesh( positions,  2,  0.0225, -0.1, 2, -0.95 )
        // modeloader.enableUpdate()
      });

      modeloader.loadModelToScene("/model/rw.glb",  async (_model) => {
        // _model.object.rotation.y = -Math.PI / 4;
        console.log(this.viewer, 333);
        this.model["rw"] = _model;

        // _model.object.scale.set(2, 2, 2);
        let loader = new this.$THREE.TextureLoader();
        let tubTexture = loader.load(
          "/threeImg/head-baked.jpg" // 替换为您的纹理图片URL
        );


        let tubMaterial = new this.$THREE.MeshStandardMaterial({
          map: tubTexture, // 应用纹理
          color: 0xffffff, // 基础颜色（如果纹理是彩色的，这个颜色可能会与纹理混合）
          metalness: 0, // 金属性（浴缸通常不是金属的）
          opacity:1,
          roughness: 0.5, // 粗糙度（较高的值会使表面看起来更磨砂）
        });
         _model.object.traverse((child) => {
          if(child.isMesh){
            // if(child.name == "face"){
            //   console.log(child,555555)
            //   child.material = tubMaterial;
            // }
            if(child.name == "head"){
              console.log(child,555555)
              child.material = tubMaterial;
            }
          }
        });
        _model.onesAnimate(6);
        
        // let data =  new Promise((resolve) => { 
        //   _model.onesAnimate(6);

        //   resolve(); 
        // });
        // data.then(res=>{
          // _model.onesAnimate(2);

        // })
        // this.model = _model
        // this.setinterTimeFunc = setInterval(() => {
        //   _model.onesAnimate(2);
        // }, 10000);
      });

      modeloader.loadModelToScene("/model/shiyan.glb", (_model) => {
        this.model["shiyan"] = _model;

        _model.object.rotation.y = -Math.PI / 7;
        // _model.object.rotation.z = Math.PI / 10;
        // _model.object.rotation.x= - Math.PI / 10;
        // _model.object.rotation.z = Math.PI / 10;

        // this.model["rw"] = _model
        _model.object.position.set(0, -1, 0);
        _model.object.scale.set(1, 1, 1);
        this.model.shiyan.object.visible = false;
      });

      modeloader.loadModelToScene("/model/shuiguan.glb", (_model) => {
        this.model["shuiguan"] = _model;

        // let Materials1 = new Materials()
        // console.log(Materials1,11111111)
        // 创建一个纹理加载器
        let loader = new this.$THREE.TextureLoader();
        let tubTexture = loader.load(
          "/threeImg/shuiwen.png" // 替换为您的纹理图片URL
        );
        let tubMaterial = new this.$THREE.MeshStandardMaterial({
          map: tubTexture, // 应用纹理
          color: 0xffffff, // 基础颜色（如果纹理是彩色的，这个颜色可能会与纹理混合）
          metalness: 0, // 金属性（浴缸通常不是金属的）
          // opacity:0.5,
          roughness: 0, // 粗糙度（较高的值会使表面看起来更磨砂）
        });
        _model.object.traverse((child) => {
          if (child.isMesh) {
            child.material = tubMaterial;
          }
        });
        _model.object.children[0].material.opacity = 0.6;
        _model.object.children[0].material.transparent = true;
        _model.object.rotation.y = -Math.PI / 7;
        _model.object.position.set(0, -1, 0);
        _model.object.scale.set(1, 1, 1);
        _model.object.visible = false;
      });
    },

    /**
     * 环境光创建
     */
    createLight: function () {
      // // 环境光
      // const color = 0xFFFFFF;
      // const intensity = 0.5;
      // const light = new THREE.AmbientLight(color, intensity);

      let lights = new this.$modules.Lights(this.viewer);
      let ambientLight = lights.addAmbientLight();
      ambientLight.setOption({ color: "rgb(5,15,41)", intensity: 1 });
      let directionalLight = lights.addDirectionalLight([0, 4, 30], {
        color: "rgb(5,15,41)",
        intensity: 3,
        castShadow: true,
      });
      // lights.addRectAreaLight([0, 4, 30])
    },

    /**
     * 监听鼠标事件
     */
    mousemoveFunc: function () {
      // this.viewer.isControlsEnabled = true;
      let lastClientX = 0; // 初始化上一个鼠标位置
      window.addEventListener("mousemove", (event) => {
        const deltaX = event.clientX - lastClientX; // 计算鼠标移动的差值
        if (deltaX > 0) {
          // 鼠标向右移动
          this.viewer.scene.children[3].rotation.y += 0.0001;
        } else if (deltaX < 0) {
          // 鼠标向左移动
          this.viewer.scene.children[3].rotation.y -= 0.0001;
        }
        lastClientX = event.clientX; // 更新上一个鼠标位置
        // 调试输出（可选）
        // console.log(event.clientX, this.viewer);
      });
    },

    // mousedownFunc(){
    //   window.addEventListener("mousedown", (event)=>{
    //     console.log(event.button);
    //       if(event.button == 0 || event.button == 2){
    //         console.log(this.viewer.isControlsEnabled)
    //         this.viewer.isControlsEnabled = false;
    //         console.log(this.viewer.isControlsEnabled,44444)

    //       }
    //     });
    // },

    scrollToElementWithAnimation: function (selector, duration = 500) {
      const element = document.querySelector(selector);
      if (!element) {
        return;
      }

      const startY = window.pageYOffset;
      const targetY = element.getBoundingClientRect().top + window.innerHeight; // 滚动到元素中心

      const startTime =
        "now" in window.performance ? performance.now() : new Date().getTime();

      function animateScroll() {
        const now =
          "now" in window.performance
            ? performance.now()
            : new Date().getTime();
        const time = Math.min(1, (now - startTime) / duration);

        // 缓动函数，这里使用简单的线性缓动
        const timeFunction = time;

        const currentY =
          Math.easeInOutQuad(timeFunction) * (targetY - startY) + startY;

        window.scrollTo(0, currentY);

        if (window.pageYOffset !== targetY) {
          requestAnimationFrame(animateScroll);
        }
      }

      // 缓动函数：二次方缓入缓出
      Math.easeInOutQuad = function (t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      };

      animateScroll();
    },

    animate() {
      requestAnimationFrame(this.animate.bind(this));
      TWEEN.update();
    },
    /**
     * 监听滚动事件
     */
    mousewheelFunc: function () {
      window.addEventListener("mousewheel", (event) => {
        //e.wheelDellta：可以用来获取鼠标的滚动方向，对于得到的值，只看正负，往上滚是正值，往下滚是负值。
        if (event.deltaY > 0) {


            this.AnimatedTracks.createTweenT(this.model.rw.object.rotation,{ y: this.model.rw.object.rotation.y - Math.PI / 3 },400,() => {
              this.model.rw.object.rotation.y = this.model.rw.object.rotation.y + Math.PI / 3;
              // clearInterval(this.setinterTimeFunc);
              // this.model.room.object.visible = false;
              this.model.rw.onesAnimate(1);
            })

            this.AnimatedTracks.createTweenT(this.model.room.object.scale,{ y:0.6, x: 0.6, z: 0.6 }, 200,() => {
              // this.model.rw.object.rotation.y = this.model.rw.object.rotation.y + Math.PI / 3;
              // clearInterval(this.setinterTimeFunc);
              // this.model.room.object.scale.set(1, 1, 1)
              this.model.room.object.visible = false;
              this.model.rw.onesAnimate(1);
            })

          this.scrollToElementWithAnimation(".d3Container2", 1500); 

          this.model.shiyan.object.position.y = this.model.shiyan.object.position.y - 10;
          this.model.shiyan.object.visible = true;

          let tween3 = new TWEEN.Tween(this.model.shiyan.object.position)
            .to({ y: this.model.shiyan.object.position.y + 10 }, 1000) // 旋转 360 度（2π），持续 5000 毫秒
            // .easing(TWEEN.Easing.Linear.None) // 使用线性缓动函数，这样旋转看起来更均匀
            .onComplete(() => {
              this.model.shuiguan.object.visible = true;

              var newMaterial = new this.$THREE.MeshBasicMaterial({
                color: 0x327fcd,
                wireframe: true,
              });
              this.model.rw.object.traverse((child) => {
                if (child.isMesh) {
                  child.material = newMaterial;
                }
              });
            });

          // 开始补间动画
          tween3.start();

          // 检查是否找到了元素
          // TWEEN.update();

          // this.AnimatedTracks()

          // this.model.shiyan.object.visible = true;
          // this.model.shuiguan.object.visible = true;
        } else {
          this.scrollToElementWithAnimation(".d3Container1", 1000);
          this.model.rw.onesAnimate(3);
          var newMaterial = new this.$THREE.MeshBasicMaterial({
                color: 0x0a2452,
                wireframe: false,
              });
              this.model.rw.object.traverse((child) => {
                if (child.isMesh) {
                  child.material = newMaterial;
                }
            })



          // 创建一个新的补间动画，使模型围绕 Y 轴旋转 360 度
          let tween1 = new TWEEN.Tween(this.model.rw.object.rotation)
            .to({ y: this.model.rw.object.rotation.y + Math.PI / 3 }, 900) // 旋转 360 度（2π），持续 5000 毫秒
            // .easing(TWEEN.Easing.Linear.None) // 使用线性缓动函数，这样旋转看起来更均匀
            .onComplete(() => {
              this.model.rw.object.rotation.y =
                this.model.rw.object.rotation.y - Math.PI / 3;
                this.model.room.object.visible = true;

              this.AnimatedTracks.createTweenT(this.model.room.object.scale,{ y:1, x: 1, z: 1 }, 200,()=>{})
              this.model.rw.onesAnimateD(2);
              this.model.rw.onesAnimate(3);

            });
            
          tween1.start();

          // 飞出实验室
          let tween4 = new TWEEN.Tween(this.model.shiyan.object.position)  
            .to({ y: this.model.shiyan.object.position.y - 10 }, 1000) // 旋转 360 度（2π），持续 5000 毫秒  
            // .easing(TWEEN.Easing.Linear.None) // 使用线性缓动函数，这样旋转看起来更均匀  
            .onComplete(() => {
            this.model.shiyan.object.position.y = this.model.shiyan.object.position.y + 10;
              this.model.shiyan.object.visible = false;
            



            }); 
          
          // 开始补间动画  
          tween4.start();
          // this.model.rw.object.traverse((child) => {
          //   if (child.isMesh) {
          //     child.material.wireframe = false;
          //   }
          // });
          this.model.shuiguan.object.visible = false;
        }
        this.animate();
      });
    },

    clickFunc: function () {
      this.viewer.startSelectEvent("click", false, (model) => {});
    },
    /**
     * 选中事件
     */
    startSelect: function () {
      this.viewer.controls.enableZoom = false;
      let modelSelect = ["topChild", "Below", "middleChild"];
      this.viewer.startSelectEvent("mousemove", false, (model) => {
        modelSelect.forEach((item) => {
          if (item == model.parent.name) {
            this.modelMoveName = item;
            this.model.object.getObjectByName(item).traverse(function (child) {
              if (child.isMesh) {
                child.material = new THREE.MeshPhongMaterial({
                  color: "yellow",
                  transparent: true,
                  opacity: 0.8,
                  emissive: child.material.color,
                  emissiveMap: child.material.map,
                  emissiveIntensity: 3,
                });
              }
            });
          } else {
            // this.model.object.getObjectByName(item).traverse(function (child) {
            //   if (child.isMesh) {
            //     child.material = new THREE.MeshPhongMaterial({
            //       color: '',
            //       transparent: true,
            //       opacity: 0.8,
            //       emissive: child.material.color,
            //       emissiveMap: child.material.map,
            //       emissiveIntensity: 3
            //     })
            //   }
            // })
            let oldmodel = this.oldModel.getObjectByName(item);
            this.model.object.getObjectByName(item).traverse(function (child) {
              if (child.isMesh) {
                child.material = oldmodel.getObjectByName(child.name).material;
              }
            });
          }
        });
      });
    },

    /**
     * 点击事件
     */
    clickDem() {
      this.viewer.renderer.domElement.addEventListener("dblclick", (e) => {
        gsap.to(this.viewer.camera.position, {
          x: 0,
          y: 20,
          z: 70,
          duration: 2,
          ease: "Bounce.inOut",
        });
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        mouse.x =
          (e.offsetX / this.viewer.renderer.domElement.clientWidth) * 2 - 1;
        mouse.y =
          -(e.offsetY / this.viewer.renderer.domElement.clientHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, this.viewer.camera);
        const intersects = raycaster.intersectObject(this.viewer.scene, true);
        if (intersects.length > 0 && intersects[0] && this.modelMoveName) {
          let model = intersects[0].object.parent;
          if (model.name.includes("middleChild")) {
          }
        }
      });
    },

    blowOpen: function () {
      // this.model.leftMiddle.onesAnimate(3)
      // this.model.rightMiddle.onesAnimate(3)
      if (this.typeAnimate) {
        this.model.rightTop.onesAnimate(0);
        this.model.leftTop.onesAnimate(0);
        this.removeCss2dLabel();
      } else {
        let dom1 = `<div class="cord3D" style="
      color:#ffffff;
      font-size:14px;
      text-align: center;
      background-color: #212dbdfa;
      border: 1px solid rgba(209, 213, 219, 0.3); padding: 5px 10px;">g23三楼东南
      <div style="width:100%;display: flex;
      justify-content: center;">23.6℃</div>
      </div>`;
        let dom2 = `<div  class="cord3D" style="
      color:#ffffff;
      font-size:14px;
      text-align: center;
      background-color: #212dbdfa;
      border: 1px solid rgba(209, 213, 219, 0.3); padding: 5px 10px;">g23三楼西北
      <div style="width:100%;display: flex;
      justify-content: center;">23.2℃</div>
      </div>`;
        let dom3 = `<div  class="cord3D" style="
      color:#ffffff;
      font-size:14px;
      text-align: center;
      background-color: #212dbdfa;
      border: 1px solid rgba(209, 213, 219, 0.3);padding: 5px 10px;">g22三楼东北
      <div style="width:100%;display: flex;
      justify-content: center;">23.6℃</div>
      </div>`;
        let dom4 = `<div  class="cord3D" style="
      color:#ffffff;
      font-size:14px;
      text-align: center;
      background-color: #212dbdfa;
      border: 1px solid rgba(209, 213, 219, 0.3);padding: 5px 10px;">g23三楼西南
      <div style="width:100%;display: flex;
      justify-content: center;">23.6℃</div>
      </div>`;

        let d1 = this.Labels.addCss2dLabel({ x: 6, y: -1, z: 19 }, dom1);
        let d2 = this.Labels.addCss2dLabel({ x: -5, y: -2, z: 8 }, dom2);
        let d3 = this.Labels.addCss2dLabel({ x: 6, y: -1, z: -15 }, dom3);
        let d4 = this.Labels.addCss2dLabel({ x: -5, y: -2, z: -8 }, dom4);
        this.addCss2dLabelArr = [d1, d2, d3, d4];
        this.model.rightTop.onesAnimate(1);
        this.model.leftTop.onesAnimate(1);
      }
      this.typeAnimate = !this.typeAnimate;
    },
    removeCss2dLabel() {
      this.addCss2dLabelArr.forEach((item) => {
        this.Labels.removeLight(item);
      });
    },
    selectFloorOne() {
      gsap.to(this.viewer.camera.position, {
        x: 0,
        y: 20,
        z: -70,
        duration: 2,
        ease: "power1.inOut",
      });
      this.model.onesAnimate(4);
    },

    selectOffice(model) {
      let modelSelectName = model.name;
      let modelSelect = ["topChild", "Below", "middleChild"];
      let oldmodel = this.oldModel.getObjectByName(modelSelectName);
      let modelSelectIndex = modelSelect.findIndex((v) => v == modelSelectName);
      this.model.object.children.forEach((child, index) => {
        child.children.forEach((Mesh) => {
          if (child.name === modelSelectName) {
            child.children.forEach((Mesh) => {
              Mesh.material = oldmodel.getObjectByName(Mesh.name).material;
            });
          } else {
            Mesh.material = new THREE.MeshPhongMaterial({
              color: new THREE.Color("#123ca8"),
              transparent: true,
              opacity: 0.5,
              emissiveMap: Mesh.material.map,
            });
          }
        });
        if (!model.userData.position && index > modelSelectIndex) {
          gsap.to(child.position, {
            y: !child.userData.position
              ? child.position.y + 25
              : child.position.y,
            duration: 2,
            ease: "power1.inOut",
            onComplete: () => {
              child.userData.position = true;
            },
          });
        }
        if (model.userData.position && index <= modelSelectIndex) {
          if (child.userData.position) {
            gsap.to(child.position, {
              y: oldOffice.getObjectByName(child.name).position.y,
              duration: 2,
              ease: "power1.inOut",
              onComplete: () => {
                child.userData.position = false;
              },
            });
          }
        }
      });
      gsap.to(this.viewer.controls.target, {
        x: 12,
        y: 0,
        z: -5,
        duration: 2,
        ease: "power1.inOut",
        onComplete: () => {},
      });
      gsap.to(this.viewer.camera.position, {
        x: 12,
        y: 18,
        z: 38,
        duration: 2,
        ease: "power1.inOut",
        onComplete: () => {},
      });
    },
  },

  computed: {
    address() {
      return this.showTbale;
    },
  },
};
</script>
<style>
.cord3D {
  position: relative;
}
.cord3D::before {
  content: "";
  display: block;
  width: 20px;
  height: 20px;
  position: absolute;
  bottom: -19px;
  background: transparent;
  left: 50%;
  transform: translate(-50%, 0px);
  border-top: 10px solid #212dbdfa;
  border-right: 10px solid transparent;
  border-left: 10px solid transparent;
}
</style>
<style scoped lang="less">
.thhreeMain {
  // position: relative;

  height: 100%;
  width: 100%;
}

.d3Container1 {
  height: 100% !important;
  width: 100%;
  background: #eee7dc;
}
.d3Container2 {
  // overflow:hidden;
  height: 100% !important;
  width: 100%;
  background: #0a2452;
}
#d3Container {
  position: fixed;
  height: 100%;
  width: 100%;

  /* box-sizing: border-box; */
  /* z-index: 2; */
  /* color: rgb(251, 253, 255); */

  /* background: red; */
}
</style>

