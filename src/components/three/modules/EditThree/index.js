import * as THREE from 'three'
import * as dat from 'dat.gui';
export default class Edit {
    constructor (_viewer) {
        this.viewer = _viewer

      }


      initLight() {
        var ParamObj = function () {
            this.x = 0;
            this.y = 0;
            this.z = 0;
        }
        let param = new ParamObj();
        var gui = new dat.GUI();
        gui.add(param, "x", -10000, 10000).name('环境光X的位置')
        gui.add(param, "y", -10000, 10000).name('环境光Y的位置')
        gui.add(param, "z", -10000, 10000).name('环境光Z的位置')
            // 环境光定义为红色
        let light = new THREE.AmbientLight(0xFFFFFF);
        light.position.set(param.x, param.y, param.z);
        this.viewer.scene.add(light);
    }

}