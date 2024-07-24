import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js'
import DsModel from '../DsModel'
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";
import Time from "../../Utils/Time.js";
import * as dat from 'dat.gui';
// import testVerrtexShader from "../../shaders/vertex.glsl"
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
        this.parent = new THREE.Group();  
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
            // this.position.set(1, 0, 0);
            //  
            this.scene.add(this.parent);

            this.parent.add(model.object)
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

    // 创建粒子
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

    // 创建shaders
    shadersFunc(){
        // const textureLoader = new THREE.TextureLoader()
        
        const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
        const count = geometry.attributes.position.count
        const randoms = new Float32Array(count)
        for(let i =0;i<count; i++){
            randoms[i] = Math.random()
        }
        geometry.setAttribute("aRandom",new THREE.BufferAttribute(randoms,1))
        // const geometry = new THREE.BoxGeometry( 1, 1, 1 ); 

        const material = new THREE.RawShaderMaterial({  
            vertexShader: `  
                uniform mat4 projectionMatrix;  
                uniform mat4 viewMatrix;  
                uniform mat4 modelMatrix;
                // uniform  float uFrequency;
                uniform  vec2 uFrequency;

                attribute vec3 position;
                attribute float aRandom;
                varying float vRandom;  
          
                void main()  
                {  
                    vec4 modelPosition =  modelMatrix * vec4(position, 1.0);
                    modelPosition.z += sin(modelPosition.x * uFrequency.x)* 0.05;
                    modelPosition.z += sin(modelPosition.y * uFrequency.y)* 0.1;

                    // modelPosition.z += aRandom * 0.1;
                    vec4 viewPosition =  viewMatrix * modelPosition;
                    vec4 projectedPosition = projectionMatrix * viewPosition;  
                    gl_Position =  projectedPosition;
                    vRandom = aRandom;
                }  
            `,  
            fragmentShader: `  
                precision mediump float; 
                varying float vRandom;  
                void main()  
                {  
                    gl_FragColor = vec4(0.5, vRandom*0.5, 1.0, 1.0);  
                }  
            ` ,
            uniforms:{
                uFrequency:{value:new THREE.Vector2(10,5)}              
            }
        });
        const mesh = new THREE.Mesh(geometry,material)
        this.scene.add(mesh)
        // dat.add(material.uniforms.uFrequency)


        // const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} ); 
        // const mesh = new THREE.Mesh( geometry, material ); 
        // this.scene.add(mesh)

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


     /**
     * 创建圆柱体
     * @param underBanJIn 底部半径
     * @param callback 顶部半径
     * @param height 高度
     */
    Cylinder(underBanJIn, topBanJin, height){
        var geometry = new THREE.CylinderGeometry(underBanJIn, topBanJin, height,32);
        const material = new THREE.MeshStandardMaterial({  
            color: 0x0088ff, // 浅蓝色  
            metalness: 0,    // 非金属  
            roughness: 0.5,  // 粗糙度，影响反射的清晰度  
            // environmentMap: new THREE.CubeTextureLoader().load([...]) // 加载环境贴图数组  
        });// 绿色 
        var mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);

        
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
