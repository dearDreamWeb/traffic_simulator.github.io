import * as PIXI from 'pixi.js';
import { Sprite } from '../App';

/**
 * 汽车颜色滤镜
 * @param sprite
 */
export const carFilterColor = (sprite: Sprite) => {
  const fragStr = `
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;
    uniform vec2 size;
    uniform vec3 color1;
    
    void main(void){
      vec2 uv = size;
      vec4 color = texture2D(uSampler, vTextureCoord);
      float num = 0.3;
      if(color.r > num || color.g  >= num || color.b >= num){
        color.rgb *= color1;
      }
      color.rgb = clamp(vec3(0.0),color.rgb,vec3(1.0));
      gl_FragColor = color;
    }
  `;
  let filter = new PIXI.Filter(undefined, fragStr, {
    color1: [Math.random() + 0.6, Math.random() + 0.6, Math.random() + 0.6],
  });
  sprite.filters = [filter];
};
