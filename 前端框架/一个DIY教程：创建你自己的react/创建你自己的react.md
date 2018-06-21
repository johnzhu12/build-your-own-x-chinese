
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
	* [3.2总结](#32总结)
* [4.虚拟DOM和调和过程](#4虚拟dom和调和过程)
	* [4.1 虚拟DOM和调和过程](#41-虚拟dom和调和过程)
	* [4.2 实例(instance)](#42-实例instance)
	* [4.3 重构](#43-重构)
	* [4.4 复用dom节点](#44-复用dom节点)
	* [4.5 子元素的调和](#45-子元素的调和)
	* [4.6 删除Dom节点](#46-删除dom节点)
	* [4.7 总结](#47-总结)
* [5.组件和状态(state)](#5组件和状态state)
	* [5.1 回顾](#51-回顾)
	* [5.2 组件类](#52-组件类)
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

这个系列文章以及对应的（[仓库](https://github.com/hexacta/didact/)）的目的也是一样，不过要实现的是一个，我们比链表使用更多的东西：React

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
* 通过key的调和过程（这里只讲根据子节点原顺序的调和）
* 其他渲染引擎 （只支持DOM）
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
我们现在创建了一个可以渲染元素以及子元素的render方法。后面我们需要实现如何创建元素。我们将在下节讲到如何使JSX和Didact很好地融合。
#3.JSX和创建元素
##3.1 JSX
我们之前讲到了[Didact元素](#2渲染dom元素),讲到如何渲染到DOM，用一种很繁琐的方式.这一节我们来看看如何使用JSX简化创建元素的过程。

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
```js
const element = createElement(
  "div",
  { id: "container" },
  createElement("input", { value: "foo", type: "text" }),
  createElement(
    "a",
    { href: "/bar" },
    "bar"
  ),
  createElement(
    "span",
    { onClick: e => alert("Hi") },
    "click me"
  )
);
```
支持JSX我们只要在Didact里添加一个createElement方法。其他事的交给预处理器去做。这个方法的第一个参数是元素的类型type,第二个是含有props属性的对象，剩下的参数都是子节点children。createElement方法需要创建一个对象，并把第二个参数上所有的值赋给它，把第二个参数后面的所有参数放到一个数组，并设置到children属性上，最后返回一个有type和props的对象。用代码实现很容易：
```js
function createElement(type, config, ...args) {
  const props = Object.assign({}, config);
  const hasChildren = args.length > 0;
  props.children = hasChildren ? [].concat(...args) : [];
  return { type, props };
}
```
同样，这个方法对文本元素不适用。文本的子元素是作为字符串传给createElement方法的。但是我们的Didact需要文本元素一样有type和props属性。所以我们要把不是didact元素的参数都转成一个'文本元素'
```js
 const TEXT_ELEMENT = "TEXT ELEMENT";

function createElement(type, config, ...args) {
  const props = Object.assign({}, config);
  const hasChildren = args.length > 0;
  const rawChildren = hasChildren ? [].concat(...args) : [];
  props.children = rawChildren
    .filter(c => c != null && c !== false)
    .map(c => c instanceof Object ? c : createTextElement(c));
  return { type, props };
}

function createTextElement(value) {
  return createElement(TEXT_ELEMENT, { nodeValue: value });
}
```
我同样从children列表里过滤了null，undefined,false参数。我们不需要把它们加到props.children上因为我们根本不会去渲染它们。
##3.2总结
到这里我们并没有为Didact加特殊的功能.但是我们有了更好的开发体验，因为我们可以使用JSX来定义元素。我已经更新了[codepen](https://codepen.io/pomber/pen/xdmoWE?editors=0010)上的代码。因为codepen用babel转译JSX,所以以/** @jsx createElement */开头的注释都是为了让babel知道使用哪个函数。

你同样可以查看[github提交](https://github.com/hexacta/didact/commit/15010f8e7b8b54841d1e2dd9eacf7b3c06b1a24b)

下面我们将介绍Didact用来更新dom的虚拟dom和所谓的调和算法.

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
##4.1 虚拟DOM和调和过程
 React把这种diff过程称之为[调和过程](https://reactjs.org/docs/reconciliation.html)，我们现在也这么称呼它。首先我们要保存之前的渲染树，从而可以和新的树对比。换句话说，我们将实现自己的DOM,虚拟dom.

 这种虚拟dom的‘节点’应该是什么样的呢？首先考虑使用我们的Didact元素。它们已经有一个props.children属性，我们可以根据它来创建树。但是这依然有两个问题,一个是为了是调和过程容易些，我们必须为每个虚拟dom保存一个对真实dom的引用，并且我们更希望元素都不可变(imumutable).第二个问问题是后面我们要支持组件，组件有自己的状态(state),我们的元素还不能处理那种。
##4.2 实例(instance)
 所以我们要介绍一个新的名词：实例。实例代表的已经渲染到DOM中的元素。它其实是一个有着，element,dom,chilInstances属性的JS普通对象。childInstances是有着该元素所以子元素实例的数组。

> 注意我们这里提到的实例和[Dan Abramov](https://medium.com/@dan_abramov)在[react组件，元素和实列](https://medium.com/@dan_abramov/react-components-elements-and-instances-90800811f8ca)这篇文章提到实例不是一个东西。他指的是React调用继承于React.component的那些类的构造函数所获得的‘公共实例’(public instances)。我们会在以后把公共实例加上。

 每一个DOM节点都有一个相应的实例。调和算法的一个目标就是尽量避免创建和删除实例。创建删除实例意味着我们在修改DOM，所以重复利用实例就是越少地修改dom树。

##4.3 重构
 我们来重写render方法，保留同样健壮的调和算法，但添加一个实例化方法来根据给定的元素生成一个实例（包括其子元素）
   ```js
 let rootInstance = null;

function render(element, container) {
  const prevInstance = rootInstance;
  const nextInstance = reconcile(container, prevInstance, element);
  rootInstance = nextInstance;
}

function reconcile(parentDom, instance, element) {
  if (instance == null) {
    const newInstance = instantiate(element);
    parentDom.appendChild(newInstance.dom);
    return newInstance;
  } else {
    const newInstance = instantiate(element);
    parentDom.replaceChild(newInstance.dom, instance.dom);
    return newInstance;
  }
}

function instantiate(element) {
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

  // Instantiate and append children
  const childElements = props.children || [];
  const childInstances = childElements.map(instantiate);
  const childDoms = childInstances.map(childInstance => childInstance.dom);
  childDoms.forEach(childDom => dom.appendChild(childDom));

  const instance = { dom, element, childInstances };
  return instance;
}
 ```
这段代码和之前一样，不过我们对上一次调用render方法保存了实例，我们也把调和方法和实例化方法分开了。

为了复用dom节点而不需要重新创建dom节点，我们需要一种更新dom属性（className,style,onClick等等）的方法。所以，我们将把目前用来设置属性的那部分代码抽出来，作为一个更新属性的更通用的方法。
```js
function instantiate(element) {
  const { type, props } = element;

  // Create DOM element
  const isTextElement = type === "TEXT ELEMENT";
  const dom = isTextElement
    ? document.createTextNode("")
    : document.createElement(type);

  updateDomProperties(dom, [], props);

  // Instantiate and append children
  const childElements = props.children || [];
  const childInstances = childElements.map(instantiate);
  const childDoms = childInstances.map(childInstance => childInstance.dom);
  childDoms.forEach(childDom => dom.appendChild(childDom));

  const instance = { dom, element, childInstances };
  return instance;
}

function updateDomProperties(dom, prevProps, nextProps) {
  const isEvent = name => name.startsWith("on");
  const isAttribute = name => !isEvent(name) && name != "children";

  // Remove event listeners
  Object.keys(prevProps).filter(isEvent).forEach(name => {
    const eventType = name.toLowerCase().substring(2);
    dom.removeEventListener(eventType, prevProps[name]);
  });
  // Remove attributes
  Object.keys(prevProps).filter(isAttribute).forEach(name => {
    dom[name] = null;
  });

  // Set attributes
  Object.keys(nextProps).filter(isAttribute).forEach(name => {
    dom[name] = nextProps[name];
  });

  // Add event listeners
  Object.keys(nextProps).filter(isEvent).forEach(name => {
    const eventType = name.toLowerCase().substring(2);
    dom.addEventListener(eventType, nextProps[name]);
  });
}
```
updateDomProperties 方法删除所有旧属性，然后添加上新的属性。如果属性没有变，它还是照做一遍删除添加属性。所以这个方法会做很多无谓的更新，为了简单，目前我们先这样写。

##4.4 复用dom节点
我们说过调和算法会尽量复用dom节点.现在我们为调和(reconcile)方法添加一个校验，检查是否之前渲染的元素和现在渲染的元素有一样的类型(type)，如果类型一致，我们将重用它(更新旧元素的属性来匹配新元素)
```js
function reconcile(parentDom, instance, element) {
  if (instance == null) {
    // Create instance
    const newInstance = instantiate(element);
    parentDom.appendChild(newInstance.dom);
    return newInstance;
  } else if (instance.element.type === element.type) {
    // Update instance
    updateDomProperties(instance.dom, instance.element.props, element.props);
    instance.element = element;
    return instance;
  } else {
    // Replace instance
    const newInstance = instantiate(element);
    parentDom.replaceChild(newInstance.dom, instance.dom);
    return newInstance;
  }
}
```
##4.5 子元素的调和
现在调和算法少了重要的一步，忽略了子元素。[子元素调和](https://reactjs.org/docs/reconciliation.html#recursing-on-children)是react的关键。它需要元素上一个额外的key属性来匹配之前和现在渲染树上的子元素.我们将实现一个该算法的简单版。这个算法只会匹配子元素数组同一位置的子元素。它的弊端就是当两次渲染时改变了子元素的排序，我们将不能复用dom节点。

实现这个简单版，我们将匹配之前的子实例 instance.childInstances 和元素子元素 element.props.children，并一个个的递归调用调和方法（reconcile）。我们也保存所有reconcile返回的实例来更新childInstances。
```js
function reconcile(parentDom, instance, element) {
  if (instance == null) {
    // Create instance
    const newInstance = instantiate(element);
    parentDom.appendChild(newInstance.dom);
    return newInstance;
  } else if (instance.element.type === element.type) {
    // Update instance
    updateDomProperties(instance.dom, instance.element.props, element.props);
    instance.childInstances = reconcileChildren(instance, element);
    instance.element = element;
    return instance;
  } else {
    // Replace instance
    const newInstance = instantiate(element);
    parentDom.replaceChild(newInstance.dom, instance.dom);
    return newInstance;
  }
}

function reconcileChildren(instance, element) {
  const dom = instance.dom;
  const childInstances = instance.childInstances;
  const nextChildElements = element.props.children || [];
  const newChildInstances = [];
  const count = Math.max(childInstances.length, nextChildElements.length);
  for (let i = 0; i < count; i++) {
    const childInstance = childInstances[i];
    const childElement = nextChildElements[i];
    const newChildInstance = reconcile(dom, childInstance, childElement);
    newChildInstances.push(newChildInstance);
  }
  return newChildInstances;
} 
```
##4.6 删除Dom节点
如果nextChildElements数组比childInstances数组长度长，reconcileChildren将为所有子元素调用reconcile方法，并传入一个undefined实例。这没什么问题，因为我们的reconcile方法里if (instance == null)语句已经处理了并创建新的实例。但是另一种情况呢？如果childInstances数组比nextChildElements数组长呢，因为element是undefined,这将导致element.type报错。

这是我们并没有考虑到的，如果我们是从dom中删除一个元素情况。所以，我们要做两件事，在reconcile方法中检查element == null的情况并在reconcileChildren方法里过滤下childInstances
```js
function reconcile(parentDom, instance, element) {
  if (instance == null) {
    // Create instance
    const newInstance = instantiate(element);
    parentDom.appendChild(newInstance.dom);
    return newInstance;
  } else if (element == null) {
    // Remove instance
    parentDom.removeChild(instance.dom);
    return null;
  } else if (instance.element.type === element.type) {
    // Update instance
    updateDomProperties(instance.dom, instance.element.props, element.props);
    instance.childInstances = reconcileChildren(instance, element);
    instance.element = element;
    return instance;
  } else {
    // Replace instance
    const newInstance = instantiate(element);
    parentDom.replaceChild(newInstance.dom, instance.dom);
    return newInstance;
  }
}

function reconcileChildren(instance, element) {
  const dom = instance.dom;
  const childInstances = instance.childInstances;
  const nextChildElements = element.props.children || [];
  const newChildInstances = [];
  const count = Math.max(childInstances.length, nextChildElements.length);
  for (let i = 0; i < count; i++) {
    const childInstance = childInstances[i];
    const childElement = nextChildElements[i];
    const newChildInstance = reconcile(dom, childInstance, childElement);
    newChildInstances.push(newChildInstance);
  }
  return newChildInstances.filter(instance => instance != null);
}
```
##4.7 总结
这一章我们增强了Didact使其支持更新dom.我们也通过重用dom节点避免大范围dom树的变更，使didact性能更好。另外也使管理一些dom内部的状态更方便，比如滚动位置和焦点。

这里我更新了[codepen](https://codepen.io/pomber/pen/WjLqYW?editors=0010),在每个状态改变时调用render方法，你可以在devtools里查看我们是否重建dom节点。

![pic](./img/demo2.gif)

因为我们是在根节点调用render方法，调和算法是作用在整个树上。下面我们将介绍组件，组件将允许我们只把调和算法作用于其子树上。

#5.组件和状态(state)
##5.1 回顾
我们上一章的代码有几个问题：
* 每一次变更触发整个虚拟树的调和算法
* 状态是全局的
* 当状态变更时，我们需要显示地调用render方法

组件解决了这些问题，我们可以：
* 为jsx定义我们自己的‘标签’
* 生命周期的钩子（我们这章不讲这个）

##5.2 组件类
首先我们要提供一个供组件继承的Component的基类。我们还需要提供一个含props参数的构造方法，一个setState方法，setState接收一个partialState参数来更新组件状态：
```js
class Component {
  constructor(props) {
    this.props = props;
    this.state = this.state || {};
  }

  setState(partialState) {
    this.state = Object.assign({}, this.state, partialState);
  }
}
```
我们的应用里将和其他元素类型(div或者span)一样继承这个类再这样使用：\<Mycomponent/>。注意到我们的[createElement](https://gist.github.com/pomber/2bf987785b1dea8c48baff04e453b07f)方法不需要改变任何东西，createElement会把组件类作为元素的type，并正常的处理props属性。我们真正需要的是一个根据所给元素来创建组件实例(我们称之为公共实例)的方法。
```js
function createPublicInstance(element, internalInstance) {
  const { type, props } = element;
  const publicInstance = new type(props);
  publicInstance.__internalInstance = internalInstance;
  return publicInstance;
}
```
除了创建公共实例外，我们保留了对触发组件实例化的内部实例(从虚拟dom)引用，我们需要当公共实例状态发生变化时，能够只更新该实例的子树。
```js
class Component {
  constructor(props) {
    this.props = props;
    this.state = this.state || {};
  }

  setState(partialState) {
    this.state = Object.assign({}, this.state, partialState);
    updateInstance(this.__internalInstance);
  }
}

function updateInstance(internalInstance) {
  const parentDom = internalInstance.dom.parentNode;
  const element = internalInstance.element;
  reconcile(parentDom, internalInstance, element);
}
```
我们也需要更新实例化方法。对组件而言，我们需要创建公共实例，然后调用组件的render方法来获取之后要再次传给实例化方法的子元素：
```js
function instantiate(element) {
  const { type, props } = element;
  const isDomElement = typeof type === "string";

  if (isDomElement) {
    // Instantiate DOM element
    const isTextElement = type === TEXT_ELEMENT;
    const dom = isTextElement
      ? document.createTextNode("")
      : document.createElement(type);

    updateDomProperties(dom, [], props);

    const childElements = props.children || [];
    const childInstances = childElements.map(instantiate);
    const childDoms = childInstances.map(childInstance => childInstance.dom);
    childDoms.forEach(childDom => dom.appendChild(childDom));

    const instance = { dom, element, childInstances };
    return instance;
  } else {
    // Instantiate component element
    const instance = {};
    const publicInstance = createPublicInstance(element, instance);
    const childElement = publicInstance.render();
    const childInstance = instantiate(childElement);
    const dom = childInstance.dom;

    Object.assign(instance, { dom, element, childInstance, publicInstance });
    return instance;
  }
}
```
组件的内部实例和dom元素的内部实例不同，组件内部实例只能有一个子元素(从render函数返回)，所以组件内部只有childInstance属性，而dom元素有childInstances数组。另外，组件内部实例需要有对公共实例的引用，这样在调和期间，才可以调用render方法。

唯一缺失的是处理组件实例调和，所以我们将为调和算法添加一些处理。如果组件实例只能有一个子元素，我们就不需要处理子元素的调和，我们只需要更新公共实例的props属性，重新渲染子元素并调和算法它：
```js
function reconcile(parentDom, instance, element) {
  if (instance == null) {
    // Create instance
    const newInstance = instantiate(element);
    parentDom.appendChild(newInstance.dom);
    return newInstance;
  } else if (element == null) {
    // Remove instance
    parentDom.removeChild(instance.dom);
    return null;
  } else if (instance.element.type !== element.type) {
    // Replace instance
    const newInstance = instantiate(element);
    parentDom.replaceChild(newInstance.dom, instance.dom);
    return newInstance;
  } else if (typeof element.type === "string") {
    // Update dom instance
    updateDomProperties(instance.dom, instance.element.props, element.props);
    instance.childInstances = reconcileChildren(instance, element);
    instance.element = element;
    return instance;
  } else {
    //Update composite instance
    instance.publicInstance.props = element.props;
    const childElement = instance.publicInstance.render();
    const oldChildInstance = instance.childInstance;
    const childInstance = reconcile(parentDom, oldChildInstance, childElement);
    instance.dom = childInstance.dom;
    instance.childInstance = childInstance;
    instance.element = element;
    return instance;
  }
}
```
这就是全部代码了，我们现在支持组件，我更新了[codepen](https://codepen.io/pomber/pen/RVqBrx),我们的应用代码就像下面这样：
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
使用组件使我们可以创建自己的'JSX标签'，封装组件状态，并且只在子树上进行调和算法

![demo3](./img/demo3.gif)
最后的[codepen](https://codepen.io/pomber/pen/RVqBrx)使用这个系列的所有代码。

#6.Fiber:增量调和
>我们正在写一个react复制品来理解react内部运行机制，我们称之为didact.为了简洁代码，我们只专注于主要的功能。首先我们讲到了怎么渲染元素并如何使jsx生效。我们写了调和算法来只重新渲染两次更新之间的发生的变化。然后我们添加了组件类和setState()

现在React16