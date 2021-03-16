JSX 实际上很简单：读完这篇文章，你就会完全了解这个可选择的模版引擎

副标题：“和 JSX 共处”

##注解

你在每个文件和每个函数里定义这个，告诉转译器（如：Babel）每个节点在运行时阶段需要调用的函数名。

在下面的例子里，我们称之为“对每个节点，插入 h()函数的调用”

> /\*_@jsx h_/

##转译

如果你还没有使用过转译器，你应该尝试使用。因为用 es6/ES2015 写，调试，测试或运行 js 都更加有效率。其中[Babel](https://babeljs.io)是最流行的，也是最被推荐使用的。我们假设你使用了 babel

如今 babel 不仅提供转换你的 ES6/ES7+语法支持，并且提供直接开箱即用，转换 JSX 的支持。你可以直接使用这种特性。
我们先来看个简单的例子：
有 jsx 之前（你怎么写代码）

    /** @jsx h */
    let foo = <div id="foo">Hello!</div>;

有 jsx 后（你运行的代码）

`var foo = h('div', {id:"foo"}, 'Hello!');`

你可能看到第二段代码，觉得用函数来创建 UI 也不错

这就是我为什么从 JSX 讲起：如果没有这个，你手动写出来仍然很简单

> **JSX 只是一种已经很优雅语法的语法糖**

有人甚至整个项目用它[hypescript](https://github.com/hyperhype/hyperscript)

##我们来写个 jsx 渲染器
首先，我们要定义下我们转换的代码调用的 h()函数。

你可以把这个函数命名为任何名字，我之所以用 h(),是因为在[hypescript](https://github.com/hyperhype/hyperscript)里这种类型的‘build’函数就是这么称呼的

```javascript
function h(nodeName, attributes, ...args) {
  let children = args.length ? [].concat(...args) : null
  return { nodeName, attributes, children }
}
```

好了，就是这么简单
不熟悉 ES6/ES2005？

1.参数中的'...'是剩余参数,该操作符会收集剩余的参数到一个数组里
2.concat(...args)是 spread 操作符：这个操作符会把刚刚的参数数组展开到 arguments 里，再传给 concat()方法。这里用 concat()是为了合并所有子节点的嵌套数组。

现在我们通过 h()方法输出一个嵌套的 JSON 对象，这个‘树状’对象就像下面这样：

```javascript
{
  nodeName: "div",
  attributes: {
    "id": "foo"
  },
  children: ["Hello!"]
}
```

所以我们只需要一个函数，接受这样的参数格式，并输出真实的 dom 节点

```javascript
function render(vnode) {
  // Strings just convert to #text Nodes:
  if (vnode.split) return document.createTextNode(vnode)

  // create a DOM element with the nodeName of our VDOM element:
  let n = document.createElement(vnode.nodeName)

  // copy attributes onto the new node:
  let a = vnode.attributes || {}
  Object.keys(a).forEach((k) => n.setAttribute(k, a[k]))

  // render (build) and then append child nodes:
  ;(vnode.children || []).forEach((c) => n.appendChild(render(c)))

  return n
}
```

理解这个很容易。
你也可以把‘虚拟 DOM’认为是如何构建 DOM 结构的一种简单配置。

> 虚拟 dom 的优势是它十分轻量。轻量对象引用其他  轻量对象。 非常容易优化的应用程序结构。这也表示它没有绑定任何渲染逻辑和很慢的 DOM 方法。

##使用 JSX
现在知道 JSX 被  转换成了对 h() 的调用。这些函数调用创建一个简单的“虚拟”DOM 树。
我们可以使用 render()函数去创建匹配的“真实”DOM 树。

就像这样：

```javascript
// JSX -> VDOM:
let vdom = <div id='foo'>Hello!</div>

// VDOM -> DOM:
let dom = render(vdom)

// add the tree to <body>:
document.body.appendChild(dom)
```

局部模版，迭代和逻辑：没有新语法

> 区别于模版语言引入的有限概念和局限，我们有 javascript 所拥有的一切能力

'局部模版'是由无逻辑／少逻辑的模版引擎为了在不同的地方重用视图而引入的概念。

迭代是几乎所有模版语法都会引入的一个东西(我也是这么做)。同样，对于 JSX:和其他 javascript 程序一样。你可以选择一种适合的迭代方式：[].forEach,[].map(),for 和 while 循环等等。

逻辑就和迭代一样，模版语法都喜欢重定义。一方面，无逻辑模版让视图加入逻辑很不方便：不合理的设计，如`{{#if value}}`，把逻辑加入到 controller 层，使 controller 变的十分臃肿。这种规避方式，创造了一种描述更复杂逻辑的语言，导致了可预测降低和安全隐患。

另一方面，用代码生成技术的引擎（一种简陋到不可原谅的技术），通常自诩具有使用任意 JavaScript 表达式的能力，来执行逻辑甚至迭代。这里有个我们为什么一定要避免使用这项技术的原因：你的代码已经脱离了原来的’位置‘（模块，闭包或标签内），在别处执行。这对我而言，不可预测，并且不安全。

> JSX 拥有 javascript 的一切能力，不需要在 build 阶段生成怪异的代码，并且不使用 eval()

```javascript
// Array of strings we want to show in a list:
let items = ['foo', 'bar', 'baz']

// creates one list item given some text:
function item(text) {
  return <li>{text}</li>
}

// a "view" with "iteration" and "a partial":
let list = render(<ul>{items.map(item)}</ul>)
```

render()返回一个 DOM 节点（上面是\<ul>）,所以我们只要把它加入 DOM 中：

```javascript
document.body.appendChild(list)
```

##合在一起

这里是我们虚拟 DOM 渲染的完整版，下面的是 CodePen 上有样式的版本

```javascript
const ITEMS = 'hello there people'.split(' ')

// turn an Array into list items:
let list = (items) => items.map((p) => <li> {p} </li>)

// view with a call out ("partial") to generate a list from an Array:
let vdom = (
  <div id='foo'>
    <p>Look, a simple JSX DOM renderer!</p>
    <ul>{list(ITEMS)}</ul>
  </div>
)

// render() converts our "virtual DOM" (see below) to a real DOM tree:
let dom = render(vdom)

// append the new nodes somewhere:
document.body.appendChild(dom)

// Remember that "virtual DOM"? It's just JSON - each "VNode" is an object with 3 properties.
let json = JSON.stringify(vdom, null, '  ')

// The whole process (JSX -> VDOM -> DOM) in one step:
document.body.appendChild(render(<pre id='vdom'>{json}</pre>))
```
