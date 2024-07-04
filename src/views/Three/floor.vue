<!--THREEJS组件-->
<template>
  <div id="d3Container" v-loading="loading" ref="mainContent">

  </div>
</template>
<script>
import gsap from "gsap";
import { overviewEnergyConsumptionInfo } from '../../api/three/three';
import { modelUrl } from '@/api/url/modelUrl.js'
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
      Labels: "",
      typeAnimate: false,
      oldModelL: null,
      addCss2dLabelArr: []
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
      this.clear()
    },

    /**
     * 初始化函数
     */
    init() {
      this.viewer = new this.$modules.Viewer('d3Container') //初始化场景
      // this.viewer.addAxis()
      // let labels = new this.$modules.Labels(this.viewer) //初始化场景
      // let skyBoxs = new this.$modules.SkyBoxs(this.viewer)//添加天空盒和雾化效果
      // skyBoxs.addSkybox(1)
      // this.Labels = new this.$modules.Labels(this.viewer) //初始化场景

      this.viewer.camera.position.set(0, 0, 0) //设置相机位置
      this.loadLoader()
      this.createLight()
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
     * 创建场景辅助
     */
    createScene() {
      //
      // var axisHelper = new THREE.AxisHelper(1000);
      // scene.add(axisHelper);
      // scene.add(grid)
    },

    /**
     * 模型加载
     */
    loadLoader() {
      let modeloader = new this.$modules.ModelLoder(this.viewer)
      let tiemen = {}
      
      // modeloader.loadModelToScene('/model/rw.glb', _model => {
      modeloader.loadModelToScene('/model/rw.glb', _model => {

        console.log(_model)
        // _model.object.scale.set(0.1, 1, 1)
        let positions =  modeloader.combineBuffer(_model.object,"position")
        modeloader.createMesh( positions,  2,  0.0225, -0.1, 2, -0.95 )
        // modeloader.enableUpdate()
      })

    },

 
    /**
     * 环境光创建
     */
    createLight: function () {
      // // 环境光
      // const color = 0xFFFFFF;
      // const intensity = 0.5;
      // const light = new THREE.AmbientLight(color, intensity);

      let lights = new this.$modules.Lights(this.viewer)
      let ambientLight = lights.addAmbientLight()
      ambientLight.setOption({ color: "rgb(5,15,41)", intensity: 2 })
      let directionalLight = lights.addDirectionalLight([0, 4, 30], {
        color: 'rgb(5,15,41)',
        intensity: 3,
        castShadow: true,
      })
      // lights.addRectAreaLight([0, 4, 30])
    },


    /**
     * 选中事件
     */
    startSelect: function () {
      this.viewer.controls.enableZoom = false;
      let modelSelect = ["topChild", "Below", "middleChild"]
      this.viewer.startSelectEvent('mousemove', false, (model) => {
        modelSelect.forEach((item) => {
          if (item == model.parent.name) {
            this.modelMoveName = item
            this.model.object.getObjectByName(item).traverse(function (child) {
              if (child.isMesh) {
                child.material = new THREE.MeshPhongMaterial({
                  color: 'yellow',
                  transparent: true,
                  opacity: 0.8,
                  emissive: child.material.color,
                  emissiveMap: child.material.map,
                  emissiveIntensity: 3
                })
              }
            })
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
            let oldmodel = this.oldModel.getObjectByName(item)
            this.model.object.getObjectByName(item).traverse(function (child) {
              if (child.isMesh) {
                child.material = oldmodel.getObjectByName(child.name).material
              }
            })
          }
        })
      })
    },

    /**
     * 点击事件
     */
    clickDem() {
      this.viewer.renderer.domElement.addEventListener('dblclick', (e) => {
        gsap.to(this.viewer.camera.position, {
          x: 0,
          y: 20,
          z: 70,
          duration: 2,
          ease: "Bounce.inOut",
        });
        const raycaster = new THREE.Raycaster()
        const mouse = new THREE.Vector2()
        mouse.x = (e.offsetX / this.viewer.renderer.domElement.clientWidth) * 2 - 1
        mouse.y = -(e.offsetY / this.viewer.renderer.domElement.clientHeight) * 2 + 1
        raycaster.setFromCamera(mouse, this.viewer.camera)
        const intersects = raycaster.intersectObject(this.viewer.scene, true)
        if (intersects.length > 0 && intersects[0] && this.modelMoveName) {
          let model = intersects[0].object.parent
          if (model.name.includes('middleChild')) {



          }
        }
      })
    },


    blowOpen: function () {
      // this.model.leftMiddle.onesAnimate(3)
      // this.model.rightMiddle.onesAnimate(3)
      if (this.typeAnimate) {
        this.model.rightTop.onesAnimate(0)
        this.model.leftTop.onesAnimate(0)
        this.removeCss2dLabel()
      } else {
        let dom1 = `<div class="cord3D" style="
      color:#ffffff;
      font-size:14px;
      text-align: center;
      background-color: #212dbdfa;
      border: 1px solid rgba(209, 213, 219, 0.3); padding: 5px 10px;">g23三楼东南
      <div style="width:100%;display: flex;
      justify-content: center;">23.6℃</div>
      </div>`
        let dom2 = `<div  class="cord3D" style="
      color:#ffffff;
      font-size:14px;
      text-align: center;
      background-color: #212dbdfa;
      border: 1px solid rgba(209, 213, 219, 0.3); padding: 5px 10px;">g23三楼西北
      <div style="width:100%;display: flex;
      justify-content: center;">23.2℃</div>
      </div>`
        let dom3 = `<div  class="cord3D" style="
      color:#ffffff;
      font-size:14px;
      text-align: center;
      background-color: #212dbdfa;
      border: 1px solid rgba(209, 213, 219, 0.3);padding: 5px 10px;">g22三楼东北
      <div style="width:100%;display: flex;
      justify-content: center;">23.6℃</div>
      </div>`
        let dom4 = `<div  class="cord3D" style="
      color:#ffffff;
      font-size:14px;
      text-align: center;
      background-color: #212dbdfa;
      border: 1px solid rgba(209, 213, 219, 0.3);padding: 5px 10px;">g23三楼西南
      <div style="width:100%;display: flex;
      justify-content: center;">23.6℃</div>
      </div>`

        let d1 = this.Labels.addCss2dLabel({ x: 6, y: -1, z: 19 }, dom1)
        let d2 = this.Labels.addCss2dLabel({ x: -5, y: -2, z: 8 }, dom2)
        let d3 = this.Labels.addCss2dLabel({ x: 6, y: -1, z: -15 }, dom3)
        let d4 = this.Labels.addCss2dLabel({ x: -5, y: -2, z: -8 }, dom4)
        this.addCss2dLabelArr = [d1, d2, d3, d4]
        this.model.rightTop.onesAnimate(1)
        this.model.leftTop.onesAnimate(1)
      }
      this.typeAnimate = !this.typeAnimate
    },
    removeCss2dLabel() {
      this.addCss2dLabelArr.forEach(item => {
        this.Labels.removeLight(item)
      })
    },
    selectFloorOne() {
      gsap.to(this.viewer.camera.position, {
        x: 0,
        y: 20,
        z: -70,
        duration: 2,
        ease: "power1.inOut",
      });
      this.model.onesAnimate(4)
    },

    selectOffice(model) {
      let modelSelectName = model.name
      let modelSelect = ["topChild", "Below", "middleChild"]
      let oldmodel = this.oldModel.getObjectByName(modelSelectName)
      let modelSelectIndex = modelSelect.findIndex(v => v == modelSelectName)
      this.model.object.children.forEach((child, index) => {
        child.children.forEach((Mesh) => {
          if (child.name === modelSelectName) {
            child.children.forEach(Mesh => {
              Mesh.material = oldmodel.getObjectByName(Mesh.name).material
            })
          } else {
            Mesh.material = new THREE.MeshPhongMaterial({
              color: new THREE.Color('#123ca8'),
              transparent: true,
              opacity: 0.5,
              emissiveMap: Mesh.material.map,
            })
          }
        })
        if (!model.userData.position && index > modelSelectIndex) {
          gsap.to(child.position, {
            y: !child.userData.position ? child.position.y + 25 : child.position.y,
            duration: 2,
            ease: "power1.inOut",
            onComplete: () => {
              child.userData.position = true
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
                child.userData.position = false
              },
            });
          }
        }
      })
      gsap.to(this.viewer.controls.target, {
        x: 12,
        y: 0,
        z: -5,
        duration: 2,
        ease: "power1.inOut",
        onComplete: () => {
        },
      });
      gsap.to(this.viewer.camera.position, {
        x: 12,
        y: 18,
        z: 38,
        duration: 2,
        ease: "power1.inOut",
        onComplete: () => {
        },
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
.cord3D::before{
  content: '';
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
#d3Container {
  position: absolute;
  top: 0;

  width: 100%;
  height: 100%;


  /* box-sizing: border-box; */
  /* z-index: 2; */
  /* color: rgb(251, 253, 255); */

  /* background: red; */
}

</style>

