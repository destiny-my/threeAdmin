import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js'
import DsModel from '../DsModel'
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";
import Time from "../../Utils/Time.js";

import * as THREE from 'three'


/**
 * 模型加载类（只能加载GLTF及GLB格式）
 * 其他格式可通过windows 电脑默认模型软件打开然后另存为glb
 */
export default class ModelLoder {
    /**
     * 构造函数
     * @param viewer 场景对象添加
     */
    constructor(_viewer, resourcesUrl = 'resources/draco/') {
        this.viewer = _viewer
        this.scene = _viewer.scene
        this.loaderGltf = new GLTFLoader()// 实例化加载器
        this.loaderFBX = new FBXLoader()// 实例化加载器
        this.dracoLoader = new DRACOLoader()
        this.time = new Time()
        this.update = function update() {}
        // 提供一个DracLoader实例来解码压缩网格数据
        // 没有这个会报错
        this.dracoLoader.setDecoderPath(resourcesUrl)// 默认放在public文件夹当中
        this.loaderGltf.setDRACOLoader(this.dracoLoader)
    }

    /**
     * 添加模型数据
     * @param url 模型的路径
     * @param callback 返回模型对象，常用一些功能挂接在模型对象上
     * @param progress 返回加载进度，还有问题，需要修改
     */
    loadModelToScene(url, callback, progress) {
        this.loadModel(url, model => {
            // this.scene.add(model.object)
            callback && callback(model)
        }, num => {
            progress && progress(num) // 输出加载进度
        })
    }


    combineBuffer( model, bufferName ) 
    {
        this.totalCount = 0;
    
        // console.log(this.model)
        model.traverse( ( child ) => {
            console.log(child,123)
    
            if ( child.isMesh ) {
                
                this.buffer = child.geometry.attributes[ bufferName ];
    
                this.totalCount += this.buffer.array.length;
            }
    
        } );
    
        this.combined = new Float32Array( this.totalCount );
    
        this.offset = 0;
    
        model.traverse(( child ) => {
    
            if ( child.isMesh ) {
    
                this.buffer = child.geometry.attributes[ bufferName ];
    
                this.combined.set( this.buffer.array, this.offset );
                this.offset += this.buffer.array.length;
            }
        } );
    
        return new THREE.BufferAttribute( this.combined, 3 );
    }


    createMesh( positions, scale, x, y, z ) {

        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute( 'position', positions.clone() );
        this.geometry.setAttribute( 'initialPosition', positions.clone() );
    
        this.geometry.attributes.position.setUsage( THREE.DynamicDrawUsage );

        this.mesh = new THREE.Points( this.geometry, new THREE.PointsMaterial( { size: .01, color: new THREE.Color( 0x00ffff ) } ) );
        this.mesh.scale.x = this.mesh.scale.y = this.mesh.scale.z = scale;
    
        this.mesh.position.x = x 
        this.mesh.position.y = y 
        this.mesh.position.z = z 
    
        this.scene.add( this.mesh );
        
        this.data = {
            mesh: this.mesh, verticesDown: 0, verticesUp: 0, direction: -1, speed: 15, delay: 1000,
            start: 10,
        }

        this.enableUpdate()
        setTimeout(()=>{
        this.verticesUp()

        },2000)
        

    }

    
    enableUpdate()
    {
        // Update Function
        // this.update = ()=>{
        //     alert(1)
            // Mesh drop and Rise
            this.positions = this.data.mesh.geometry.attributes.position;
            this.initialPositions = this.data.mesh.geometry.attributes.initialPosition;

            this.count = this.positions.count;
            

            // if ( this.data.start > 0 ) {

            //     this.data.start -= 1;

            // } else {

                
            //     if ( this.data.direction === 0) {
            //         this.data.direction = -1;
            //     }

            // }
            // console.log()
            for ( let i = 0; i < this.count; i ++ ) {
                this.px = this.positions.getX( i );
                this.py = this.positions.getY( i );
                this.pz = this.positions.getZ( i );
                // console.log(this.px,this.py,this.pz)
                

                // falling down
                if ( this.data.direction < 0 ) {

                    if ( this.py > 0 ) {

                        this.positions.setXYZ(
                            i,
                            this.px +  ( 0.50 - Math.random() ) * this.data.speed * this.time.delta * 0.01,
                            this.py +  ( 0.25 - Math.random() ) * this.data.speed * this.time.delta * 0.01,
                            this.pz +  ( 0.50 - Math.random() ) * this.data.speed * this.time.delta * 0.01
                        );

                    } else {

                        this.data.verticesDown += 1;

                    }

                }
                // console.log(this.count,this.data.direction )

                // rising up
                if ( this.data.direction > 0 ) {
                    // alert(1)
                    console.log(2232222 )

                    this.ix = this.initialPositions.getX( i );
                    this.iy = this.initialPositions.getY( i );
                    this.iz = this.initialPositions.getZ( i );
                    // console.log(this.ix,this.iy,this.iz,1 )
                    // console.log(this.px,this.py,this.pz,2)

                    this.dx = Math.abs( this.px - this.ix );
                    this.dy = Math.abs( this.py - this.iy );
                    this.dz = Math.abs( this.pz - this.iz );
                    // console.log(this.dx , this.dy ,this.dx)

                    this.d = this.dx + this.dy + this.dx;
                    console.log(this.d,33333)

                    if ( this.d > 1 ) {

                        this.positions.setXYZ(
                            i,
                            // this.ix,
                            // this.iy,
                            // this.iz,
                            this.px - ( this.px - this.ix ) ,
                            this.py - ( this.py - this.iy ) ,
                            this.pz - ( this.pz - this.iz ) 
                            // this.px - ( this.px - this.ix ) / this.dx * this.data.speed * this.time.delta * ( 0.85 - Math.random() ) * 0.01,
                            // this.py - ( this.py - this.iy ) / this.dy * this.data.speed * this.time.delta * ( 1 + Math.random() ) * 0.01,
                            // this.pz - ( this.pz - this.iz ) / this.dz * this.data.speed * this.time.delta * ( 0.85 - Math.random() ) * 0.01
                        );
                        // console.log( this.positions)
                    } else {

                        this.data.verticesUp += 1;

                    }

                }

            }

 

            // all vertices up (go down)

            // if ( this.data.verticesUp >= this.count && this.animate === true) {

            //     if ( this.data.delay <= 0 ) {

            //         this.data.direction = - 1;
            //         this.data.speed = 15;
            //         this.data.verticesUp = 0;
            //         this.data.delay = 20;

            //     } else {

            //         this.data.delay -= 1;

            //     }

            // }

            this.positions.needsUpdate = true;

        // }
    }


    verticesUp(){
                   // all vertices down (go up)
            this.data.direction = 1;
            this.data.speed = 10;
            this.enableUpdate()
            if ( this.data.verticesDown >= this.count) {

                    this.data.verticesDown = 0;

                // if ( this.data.delay <= 0 ) {

                //     this.data.direction = 1;
                //     this.data.speed = 5;
                //     this.data.verticesDown = 0;
                //     // this.data.delay = 1000;

                // } else {

                //     this.data.delay -= 1;

                // }

            }
    }
    /**
     * 加载模型
     * @param url 模型路径
     * @param callback 回调模型
     * @param progress 返回加载进度
     */
    loadModel(url, callback, progress) {
        // .load（url:字符串，onLoad:函数，onProgress:函数，onError:函数）
        //判断是否是fbx格式
        if (url.indexOf('.fbx') > -1) {
            this.loaderFBX.load(url, gltf => {
                callback && callback(new DsModel(gltf, this.viewer))
            }, xhr => {
                progress && progress((xhr.loaded / xhr.total).toFixed(2)) // 输出加载进度
            })
        } else {
            this.loaderGltf.load(url, gltf => {
                callback && callback(new DsModel(gltf, this.viewer))
            }, xhr => {
                progress && progress((xhr.loaded / xhr.total).toFixed(2)) // 输出加载进度
            })
        }

    }
}
