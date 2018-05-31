

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

* [1.(Didact)一个DIY教程:创建你自己的react](#1didact一个diy教程创建你自己的react)
	* [1.1 引言](#11-引言)
* [2.渲染dom元素](#2渲染dom元素)
	* [2.1 什么是DOM](#21-什么是dom)
	* [2.2 Didact元素](#22-didact元素)
* [3.JSX和创建元素](#3jsx和创建元素)
* [4.虚拟DOM和调和过程](#4虚拟dom和调和过程)
* [5.组件和状态(state)](#5组件和状态state)
* [6.Fiber:增量调和](#6fiber增量调和)

<!-- /code_chunk_output -->

#1.(Didact)一个DIY教程:创建你自己的react

[更新]这个系列从老的react架构写起，你可以跳过前面直接到文章：[所有地方使用新的fiber架构重写](https://engineering.hexacta.com/didact-fiber-incremental-reconciliation-b2fe028dcaec)

[更新2]听Dan的没错，我是认真的

>这篇深入fiber架构的文章真的很棒。
— @dan_abramov


## 1.1 引言

很久以前，当我学数据结构和算法时，我有个作业就是实现自己的数组，链表，队列，和栈（用Modula-2语言）。那之后，我再也没有过要自己来实现链表的需求。总会有库让我不需要自己重新造轮子。

所以，那个作业有意义吗？当然，我从中学到了很多，知道如何合理使用各种数据结构，并知道根据场景合理选用它们。

这个系列文章的目的（[以及对应的仓库](https://github.com/hexacta/didact/)）也是一样，不过要实现的是我们现在用的比链表更多的东西：React

>我好奇如果不考虑性能和设备兼容性，POSIX(可移植操作系统接口)核心可以实现得多么小而简单。
— @ID_AA_Carmack

&emsp;&emsp;&emsp;&emsp;&ensp;&nbsp;我对react也这么好奇

幸运的是,如果不考虑性能，调试，平台兼容性等等，react的主要3，4个特性重写并不难。事实上，它们很简单，甚至只要不足200行代码

这就是我们接下来要做的事，用不到200行代码写一个有一样的API,能跑的React。因为这个库的说教性(didactic)，我们称之为Didact

用Didact写的应用如下：
```js
    const stories = [
  { name: "Didact introduction", url: "http://bit.ly/2pX7HNn" },
  { name: "Rendering DOM elements ", url: "http://bit.ly/2qCOejH" },
  { name: "Element creation and JSX", url: "http://bit.ly/2qGbw8S" },
  { name: "Instances and reconciliation", url: "http://bit.ly/2q4A746" },
  { name: "Components and state", url: "http://bit.ly/2rE16nh" }
];

class App extends Didact.Component {
  render() {
    return (
      <div>
        <h1>Didact Stories</h1>
        <ul>
          {this.props.stories.map(story => {
            return <Story name={story.name} url={story.url} />;
          })}
        </ul>
      </div>
    );
  }
}

class Story extends Didact.Component {
  constructor(props) {
    super(props);
    this.state = { likes: Math.ceil(Math.random() * 100) };
  }
  like() {
    this.setState({
      likes: this.state.likes + 1
    });
  }
  render() {
    const { name, url } = this.props;
    const { likes } = this.state;
    const likesElement = <span />;
    return (
      <li>
        <button onClick={e => this.like()}>{likes}<b>❤️</b></button>
        <a href={url}>{name}</a>
      </li>
    );
  }
}

Didact.render(<App stories={stories} />, document.getElementById("root"));
```
这就是我们在这个系列文章里要使用的例子。效果如下
![pic](./img/demo.gif)

我们将会从下面几点来一步步添加Didact的功能：
* [渲染dom元素](#2渲染dom元素)
* [JSX和创建元素](#3jsx和创建元素)
* [虚拟DOM和调和过程](#4虚拟dom和调和过程)
* [组件和状态(state)](#5组件和状态state)
* [Fiber:增量调和](#6fiber增量调和)

这个系列暂时不讲的：
* Functional components 
* Context（上下文）
* 生命周期方法
* ref属性
* 通过key的调和过程（这里只讲根据子节点的顺序）
* 其他渲染 （只支持DOM）
* 旧浏览器支持
>你可以从[react实现笔记](https://reactjs.org/docs/implementation-notes.html)，，[Paul O’Shannessy](https://medium.com/@zpao)的这个youtube[演讲视频](https://www.youtube.com/watch?v=_MAD4Oly9yg),或者react[仓库地址](https://github.com/facebook/react),找到更多关于如何实现react的细节.
#2.渲染dom元素
##2.1 什么是DOM
 开始之前，让我们回想一下，我们经常使用的DOM API
 ```js
 // Get an element by id
const domRoot = document.getElementById("root");
// Create a new element given a tag name
const domInput = document.createElement("input");
// Set properties
domInput["type"] = "text";
domInput["value"] = "Hi world";
domInput["className"] = "my-class";
// Listen to events
domInput.addEventListener("change", e => alert(e.target.value));
// Create a text node
const domText = document.createTextNode("");
// Set text node content
domText["nodeValue"] = "Foo";
// Append an element
domRoot.appendChild(domInput);
// Append a text node (same as previous)
domRoot.appendChild(domText);
 ```
 注意到我们设置元素的属性而不是特性[属性和特性的区别](https://stackoverflow.com/questions/6003819/what-is-the-difference-between-properties-and-attributes-in-html)，只有合法的属性才可以设置。
##2.2 Didact元素
  我们用js对象来描述渲染过程，这些js对象我们称之为Didact元素.这些元素有2个属性，type和props。type可以是一个字符串或者方法。在后面讲到组件之前，我们先用字符串。props是一个可以为空的对象（不过不能为null）。props可能有children属性,这个children属性是一个Didact元素的数组。
  >我们将多次使用Didact元素，目前我们先称之为元素。不要和html元素混淆，在变量命名的时候，我们称它们为DOM元素或者dom([preact](https://github.com/developit/preact)就是这么做的)

  一个元素就像下面这样：
  ```js
    const element = {
  type: "div",
  props: {
    id: "container",
    children: [
      { type: "input", props: { value: "foo", type: "text" } },
      { type: "a", props: { href: "/bar" } },
      { type: "span", props: {} }
    ]
  }
};
  ```
  对应描述下面的dom：
  ```html
  <div id="container">
  <input value="foo" type="text">
  <a href="/bar"></a>
  <span></span>
  </div>
  ```

  Didact元素和[react元素](https://reactjs.org/blog/2014/10/14/introducing-react-elements.html)很像



#3.JSX和创建元素
#4.虚拟DOM和调和过程
 到目前为止，我们基于JSX的描述方式实现了dom元素的创建机制。这里开始，我们专注于怎么更新DOM.

 在下面介绍setState之前，我们之前更新DOM的方式只有再次调用render()方法，传入不同的元素。比如：我们要渲染一个时钟组件，代码是这样的：
 ```js
   const rootDom = document.getElementById("root");

  function tick() {
    const time = new Date().toLocaleTimeString();
    const clockElement = <h1>{time}</h1>;
    render(clockElement, rootDom);
  }

  tick();
  setInterval(tick, 1000);
 ```
 我们现在的render方法还做不到这个。它不会为每个tick更新之前同一个的div,相反它会新添一个新的div.第一种解决办法是每一次更新,替换掉div.在render方法的最下面，我们检查父元素是否有子元素，如果有，我们就用新元素生产的dom替换它：
 ```js
    function render(element, parentDom) {  
  
  // ...
  // Create dom from element
  // ...
  
  // Append or replace dom
  if (!parentDom.lastChild) {
    parentDom.appendChild(dom);     
  } else {
    parentDom.replaceChild(dom, parentDom.lastChild);    
  }
}  
 ```
 在这个小列子里，这个办法很有效。但在复杂情况下，这种重复创建所有子节点的方式并不可取。所以我们需要一种方式，来对比当前和之前的元素树之间的区别。最后只更新不同的地方。
#5.组件和状态(state)
#6.Fiber:增量调和