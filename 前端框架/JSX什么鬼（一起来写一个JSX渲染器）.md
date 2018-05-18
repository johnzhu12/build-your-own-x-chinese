  JSX 实际上很简单：读完这篇文章，你就会完全了解这个可选择的模版引擎

  副标题：“和JSX共处”


##注解

  你在每个文件和每个函数里定义这个，告诉转译器（如：Babel）每个节点在运行时阶段需要调用的函数名。

  在下面的例子里，我们称之为“对每个节点，插入调用h()函数的回调”

  >/**@jsx h*/

##转译

  如果你还没有使用过转译器，你应该尝试使用。因为用es6/ES2015写，调试，测试或运行js都更加有效率。其中[Babel](https://babeljs.io)是最流行的，也是最被推荐使用的。我们假设你使用了babel
    
  如今babel不仅提供转换你的ES6/ES7+语法支持，并且提供直接开箱即用，转换JSX的支持。你可以直接使用这种特性。
  我们先来看个简单的例子：
  有jsx之前（你怎么写代码）
  
    /** @jsx h */
    let foo = <div id="foo">Hello!</div>; 
  

有jsx后（你运行的代码）

`var foo = h('div', {id:"foo"}, 'Hello!');`

你可能看到第二段代码，觉得用函数来创建UI也不错

这就是我为什么从JSX讲起：如果没有这个，你手动写出来仍然很简单

> **JSX只是一种已经很优雅语法的语法糖**

有人甚至整个项目用它[hypescript](https://github.com/hyperhype/hyperscript)

##我们来写个jsx渲染器
 首先，我们要定义下我们转换的代码调用的h()函数。

 你可以把这个函数命名为任何名字，我之所以用h(),是因为在[hypescript](https://github.com/hyperhype/hyperscript)里这种类型的‘build’函数就是这么称呼的
 ```javascript
  function h(nodeName, attributes, ...args) {  
      let children = args.length ? [].concat(...args) : null;
      return { nodeName, attributes, children };
}
 ```
好了，就是这么简单
 你不熟悉ES6/ES2005？
 1.参数中的'...'操作符,
