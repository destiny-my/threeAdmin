import { GUI } from 'dat.gui';
import * as THREE from 'three'


export default class Materials
{
    constructor()
    {
        const vertexShader = `    
        precision highp float;
          
          
        in vec3 aPosition;  
          
        void main() {  
            gl_Position = vec4(aPosition, 1.0);  
        }  
        `;  
          
        const fragmentShader = `  
        precision highp float;  
          
        out vec4 fragColor;  
          
        void main() {  
            fragColor = vec4(1.0, 0.0, 0.0, 1.0); // 红色  
        }  
        `;  
        
        // 创建着色器材料  
        this.material = new THREE.ShaderMaterial({  
            vertexShader: vertexShader,  
            fragmentShader: fragmentShader  
        });  


        this.name = "uyx"
    }




}



