import * as PIXI from 'pixi.js';
import { Sprite } from '../App';

/**
 * 汽车颜色滤镜
 * @param sprite
 */
export const carFilterColor = (sprite: Sprite, type?: number) => {
  const fragStr = `
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;
    uniform vec2 size;
    uniform vec3 secondaryColor;
    uniform float type;
    
    void main(void){
      vec2 uv = size;
      vec4 color = texture2D(uSampler, vTextureCoord);
      // 阈值
      float num = 0.3;
      if(type != 0.0){
        if(color.r > num || color.g  >= num || color.b >= num){
            if(type == 1.0 || type == 2.0 ){
                color.rgb *= secondaryColor;
            }else if (type == 3.0){
                color.rgb = vec3(1.0);
            }
        }
        color.rgb = clamp(vec3(0.0),color.rgb,vec3(1.0));
      }
      gl_FragColor = color;
    }
  `;
  let filter = new PIXI.Filter(undefined, fragStr, {
    secondaryColor: [
      Math.random() + 0.6,
      Math.random() + 0.6,
      Math.random() + 0.6,
    ],
    type: type || 0,
  });
  sprite.filters = [filter];
};
