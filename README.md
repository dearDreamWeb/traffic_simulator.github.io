# 交通模拟器
汽车的行驶以及等红绿灯的场景进行模拟，使用了pixi和webgl去实现的。  
webgl主要是用在pixi中spite着色器的编写。

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

车辆管理区域：
目前就两款车型，可以控制道路上行驶的车辆类型，`禁用`可以让该类型的车辆不在道路上行驶，`启用`则是相反，允许该车辆行驶。