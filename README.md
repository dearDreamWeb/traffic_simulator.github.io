# 交通模拟器
汽车的行驶以及等红绿灯的场景进行模拟，使用了`pixi`和`webgl`去实现的。  
webgl主要是用在pixi中spite的`着色器`的编写。

# 预览
[github预览地址](https://deardreamweb.github.io/traffic_simulator.github.io/)  
[gitee预览地址](https://flyingwxb.gitee.io/traffic_simulator.gitee.io)  
网速慢的慢的话建议`gitee预览地址`，效果会更好

# 界面
![功能](https://resource.blogwxb.cn/traffic_simulator/QQ20221020-215230.gif)
# 功能
![功能标注](https://resource.blogwxb.cn/traffic_simulator/screenshot_2.png)
👉🏻右侧区域： 
- 可以看到当前的帧率
- 暂停按钮可以让动画暂停，再次点击即可继续动画
  
👈🏻左侧区域：
汽车的模式目前是有四种：`原始模式`、`多彩模式`、`多彩闪光模式`、`简笔画模式`。  
- `多彩模式`是可以让原始的汽车颜色进行更换多种颜色的更换
- `多彩闪光模式`是让汽车颜色一直随机变
- `简笔画模式`是让汽车是简笔画的形态
这三部分是通过`pixi`的`sprite`用的`webgl`来写了一部分`sharder`完成的。

🚗车辆管理区域：  
目前就两款车型，可以控制道路上行驶的车辆类型，`禁用`可以让该类型的车辆不在道路上行驶，`启用`则是相反，允许该车辆行驶。

# 技术实现
首先车辆的行驶方向是上下左右四个方向，这四个方向的车辆我这里是采用了`链表`的数据结构。  
为什么要使用链表这种数据结构呢？  
回答：老子乐意！！！    
其实是平时只有刷算法题的时候才用到链表，平时工作用不到，所以就想用用链表来实现。当然用`数组也能实现`。由于车辆要不断地删除添加的操作所以链表的效率会更高一些。这个项目中用到的链表也挺不难，就是链表的添加和删除，会这两个就能进行车辆的添加和删除。

## 车辆添加
车辆是`pixijs`的`sprite`，每种类型的车辆都是分为`上下左右`四张图片。

![未命名.png](https://resource.blogwxb.cn/traffic_simulator/screenshot_3.png)

添加车辆就是在链表的最后添加上sprite，存储数据是 `carData`，它是个useRef。是分为`left right top bottom`四个字段，代表四个方向，每个字段都是一个链表，是每个方向的车辆。根据每个方向要对sprite 进行x，y点进行初始化，根据前一个链表节点的x和y，计算添加车辆的x和y。
```js
// direction ： 方向  WIDTH 画布的宽度 HEIGHT 画布的高度  ROADWIDTH 道路的宽度
// 该链表如果存在节点最后添加节点，没有节点直接放入
if (carData.current[direction]) {
  let current = carData.current[direction]!;
  // 拿到最后一个节点
  while (current.next) {
    current = current.next!;
  }
  // 根据最后一个节点计算出要添加节点的位置
  switch (direction) {
    case 'left':
      sprite.y = (HEIGHT - ROADWIDTH) / 2 + ROADWIDTH / 4;
      if (current.val.x >= WIDTH - CARLENGTH / 2) {
        sprite.x = current.val.x + CARLENGTH * 1.5;
      } else {
        sprite.x = WIDTH - CARLENGTH / 2;
      }
      break;
    case 'right':
      sprite.y = HEIGHT / 2 + ROADWIDTH / 4;
      if (current.val.x <= -CARLENGTH / 2) {
        sprite.x = current.val.x - CARLENGTH * 1.5;
      } else {
        sprite.x = -CARLENGTH / 2;
      }
      break;
    case 'top':
      sprite.x = WIDTH / 2 + ROADWIDTH / 4;
      if (current.val.y >= HEIGHT + CARLENGTH / 2) {
        sprite.y = current.val.y + CARLENGTH * 1.5;
      } else {
        sprite.y = HEIGHT + CARLENGTH / 2;
      }
      break;
    case 'bottom':
      sprite.x = WIDTH / 2 - ROADWIDTH / 4;
      if (current.val.y <= -CARLENGTH / 2) {
        sprite.y = current.val.y - CARLENGTH * 1.5;
      } else {
        sprite.y = -CARLENGTH / 2;
      }
      break;
  }
  current.next = new ListNode(sprite);
} else {
  if (direction === 'left') { // 向左行驶的车辆位置
    sprite.y = (HEIGHT - ROADWIDTH) / 2 + ROADWIDTH / 4;
    sprite.x = WIDTH - CARLENGTH / 2;
  } else if (direction === 'right') { // 向右行驶的车辆位置
    sprite.y = HEIGHT / 2 + ROADWIDTH / 4;
    sprite.x = -CARLENGTH / 2;
  } else if (direction === 'top') {  // 向上行驶的车辆位置
    sprite.x = WIDTH / 2 + ROADWIDTH / 4;
    sprite.y = HEIGHT + CARLENGTH / 2;
  } else if (direction === 'bottom') {  // 向下行驶的车辆位置
    sprite.x = WIDTH / 2 - ROADWIDTH / 4;
    sprite.y = -CARLENGTH / 2;
  }
  carData.current[direction] = new ListNode(sprite);
}
```
## 车辆行驶
车辆行驶需要考虑几点：
- 当前面红灯怎么办？
- 后面的车辆要撞到前一个车辆怎么办？
- 为了灵活性，汽车什么时候加速，什么时候减速？  

下面一一解答：
- 当为红灯的时候，下一步就要闯红灯了，这时需要让车辆停止，位置一直保持为原来的位置
- 后面的车要撞到前面的车，有两种情况：一种是前面的车在等红绿灯，另一种是都是行驶状态，后面车的车速大于前面车的车速。这时候需要设置一个`阈值 min`，当后车与前车的距离小于这个`min`的时候，需要让后车相对于前车速度进行减速，如果减速还是会小于这个`min`的话，说明前车在等红绿灯，这时候后车的位置等于这个`min`就行了，保证不小于这个`min`。
- 上面说设置一个车距之间的最小`阈值 min`，是为了让车减速，加速则是要设置车距之间的最大`阈值 max`，车距超过这个`max`就进行加速操作。  
代码就不展示了，主要是链表的遍历去对每辆车进行计算。

## 车辆模式
因为`pixijs`默认是使用`webgl`去进行渲染的，`sprite`是`支持使用webgl编写着色器的`。根据选择的不同模式进行着色器sharder的编写完成的。  

`多彩模式`：生成一个`随机的rgb`三个通道的值，然后到通过`uniform`传入到片元着色器与当前的色值进行`相乘`，深色部分打算是保留下来的，所以设置一个`阈值`，超过这个阈值代表`浅色`，浅色部分会去跟随机rgb进行相乘。

`多彩闪光模式`：和多彩模式实现是一样的，区别是动画每帧都会使用多彩，所以有了多彩闪光的一个效果。

`简笔画模式`：这个是我写多彩模式的sharder无意间实现出来的，原理也是很简单的，将浅色部分都变成白色，只留下深色部分，就是简笔画的效果。

```js
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
            if(type == 1.0 || type == 2.0 ){ / 多彩或多彩闪光模式
                color.rgb *= secondaryColor;
            }else if (type == 3.0){  // 简笔画模式
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
```


还有一些细节点就不一一赘述了，如：交通灯的设计和控制、车辆类型的控制等等。

如果感觉不错的话，给star⭐️