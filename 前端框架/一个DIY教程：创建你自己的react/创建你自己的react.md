

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

* [1.(Didact)一个DIY教程:创建你自己的react](#1didact一个diy教程创建你自己的react)
	* [1.1 引言](#11-引言)
* [2.渲染dom元素](#2渲染dom元素)
	* [2.1 什么是DOM](#21-什么是dom)
	* [2.2 Didact元素](#22-didact元素)
	* [2.3 渲染dom元素](#23-渲染dom元素)
	* [2.4 渲染DOM文本节点](#24-渲染dom文本节点)
	* [2.5 总结](#25-总结)
* [3.JSX和创建元素](#3jsx和创建元素)
	* [3.1 JSX](#31-jsx)
* [4.虚拟DOM和调和过程](#4虚拟dom和调和过程)
* [5.组件和状态(state)](#5组件和状态state)
* [6.Fiber:增量调和](#6fiber增量调和)

<!-- /code_chunk_output -->

#1.(Didact)一个DIY教程:创建你自己的react

[更新]这个系列从老的react架构写起，你可以跳过前面直接到，使用新的fiber架构重写的：[文章](https://engineering.hexacta.com/didact-fiber-incremental-reconciliation-b2fe028dcaec)

[更新2]听Dan的没错，我是认真的☺

>这篇深入fiber架构的文章真的很棒。
— @dan_abramov


## 1.1 引言

很久以前，当学数据结构和算法时，我有个作业就是实现自己的数组，链表，队列，和栈（用Modula-2语言）。那之后，我再也没有过要自己来实现链表的需求。总会有库让我不需要自己重造轮子。

所以，那个作业还有意义吗？当然，我从中学到了很多，知道如何合理使用各种数据结构，并知道根据场景合理选用它们。

这个系列文章的目的以及对应的（[仓库](https://github.com/hexacta/didact/)）也是一样，不过要实现的是一个，我们使用比链表更多的东西：React

>我好奇如果不考虑性能和设备兼容性，POSIX(可移植操作系统接口)核心可以实现得多么小而简单。
— @ID_AA_Carmack

&emsp;&emsp;&emsp;&emsp;&ensp;&nbsp;我对react也这么好奇

幸运的是,如果不考虑性能，调试，平台兼容性等等，react的主要3，4个特性重写并不难。事实上，它们很简单，甚至只要不足200行代码

这就是我们接下来要做的事，用不到200行代码写一个有一样的API,能跑的React。因为这个库的说教性(didactic)特点，我们打算就称之为Didact

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

这个系列暂时不讲的地方：
* Functional components 
* Context（上下文）
* 生命周期方法
* ref属性
* 通过key的调和过程（这里只讲根据子节点的顺序）
* 其他渲染 （只支持DOM）
* 旧浏览器支持
>你可以从[react实现笔记](https://reactjs.org/docs/implementation-notes.html)，[Paul O’Shannessy](https://medium.com/@zpao)的这个youtube[演讲视频](https://www.youtube.com/watch?v=_MAD4Oly9yg),或者react[仓库地址](https://github.com/facebook/react),找到更多关于如何实现react的细节.
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

  Didact元素和[react元素](https://reactjs.org/blog/2014/10/14/introducing-react-elements.html)很像，但是不像react那样，你可能使用JSX或者createElement，创建元素就和创建js对象一样.Didatc我们也这么做，不过在后面章节我们再加上create元素的代码

##2.3 渲染dom元素
   下一步是渲染一个元素以及它的children到dom里。我们将写一个render方法(对应于react的[ReactDOM.render](https://reactjs.org/docs/react-dom.html#render))，它接受一个元素和一个dom 容器。然后根据元素的定义生成dom树,附加到容器里。

   ```js
    function render(element, parentDom) {
    const { type, props } = element;
    const dom = document.createElement(type);
    const childElements = props.children || [];
    childElements.forEach(childElement => render(childElement, dom));
    parentDom.appendChild(dom);
  }
   ```
我们仍然没有对其添加属性和事件监听。现在让我们使用object.keys来遍历props属性，设置对应的值：
```js
function render(element, parentDom) {
  const { type, props } = element;
  const dom = document.createElement(type);

  const isListener = name => name.startsWith("on");
  Object.keys(props).filter(isListener).forEach(name => {
    const eventType = name.toLowerCase().substring(2);
    dom.addEventListener(eventType, props[name]);
  });

  const isAttribute = name => !isListener(name) && name != "children";
  Object.keys(props).filter(isAttribute).forEach(name => {
    dom[name] = props[name];
  });

  const childElements = props.children || [];
  childElements.forEach(childElement => render(childElement, dom));

  parentDom.appendChild(dom);
}
```
##2.4 渲染DOM文本节点
现在render函数不支持的就是文本节点，首先我们定义文本元素什么样子，比如，在react中描述\<span>Foo\</span>：
```js
const reactElement = {
  type: "span",
  props: {
    children: ["Foo"]
  }
};
```
注意到子节点，只是一个字符串，并不是其他元素对象。这就让我们的Didact元素定义不合适了：children元素应该是一个数组，数组里的元素都有type和props属性。如果我们遵守这个规则，后面将减少不必要的if判断.所以，Didact文本元素应该有一个“TEXT ELEMENT”的类型，并且有在对应的节点有文本的值。比如：
```js
const textElement = {
  type: "span",
  props: {
    children: [
      {
        type: "TEXT ELEMENT",
        props: { nodeValue: "Foo" }
      }
    ]
  }
};
```
现在我们来定义文本元素应该如何渲染。不同的是，文本元素不使用createElement方法，而用createTextNode代替。节点值就和其他属性一样被设置上去。
```js
function render(element, parentDom) {
  const { type, props } = element;

  // Create DOM element
  const isTextElement = type === "TEXT ELEMENT";
  const dom = isTextElement
    ? document.createTextNode("")
    : document.createElement(type);

  // Add event listeners
  const isListener = name => name.startsWith("on");
  Object.keys(props).filter(isListener).forEach(name => {
    const eventType = name.toLowerCase().substring(2);
    dom.addEventListener(eventType, props[name]);
  });

  // Set properties
  const isAttribute = name => !isListener(name) && name != "children";
  Object.keys(props).filter(isAttribute).forEach(name => {
    dom[name] = props[name];
  });

  // Render children
  const childElements = props.children || [];
  childElements.forEach(childElement => render(childElement, dom));

  // Append to parent
  parentDom.appendChild(dom);
}
```
##2.5 总结
我们现在创建了一个可以渲染元素以及子元素的render方法。后面我们需要如何创建元素。我们将在下节讲到如何使JSX和Didact很好地融合。
#3.JSX和创建元素
##3.1 JSX
我们之前讲到了[Didact元素](#2渲染dom元素),很繁琐地讲到如何渲染到DOM.这一节我们来看看如何使用JSX简化创建元素。

JSX提供了一些创建元素的语法糖，不用使用下面的代码：
```js
const element = {
  type: "div",
  props: {
    id: "container",
    children: [
      { type: "input", props: { value: "foo", type: "text" } },
      {
        type: "a",
        props: {
          href: "/bar",
          children: [{ type: "TEXT ELEMENT", props: { nodeValue: "bar" } }]
        }
      },
      {
        type: "span",
        props: {
          onClick: e => alert("Hi"),
          children: [{ type: "TEXT ELEMENT", props: { nodeValue: "click me" } }]
        }
      }
    ]
  }
};
```
我们现在可以这么写：
```js
const element = (
  <div id="container">
    <input value="foo" type="text" />
    <a href="/bar">bar</a>
    <span onClick={e => alert("Hi")}>click me</span>
  </div>
);
```
如果你不熟悉JSX的话，你可能怀疑下面的代码是否是合法的js--它确实不是。要让浏览器理解它，上面的代码必须使用预处理工具处理。比如babel.babel会把上面的代码转成下面这样：

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