

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

* [1.(Didact)一个DIY教程:创建你自己的react](#1didact一个diy教程创建你自己的react)
	* [1.1 引言](#11-引言)
* [2.渲染dom元素](#2渲染dom元素)
	* [2.1](#21)
* [3.JSX和创建元素](#3jsx和创建元素)
* [4.虚拟DOM和调和过程](#4虚拟dom和调和过程)
* [5.组件和状态(state)](#5组件和状态state)
* [6.Fiber:增强的调和](#6fiber增强的调和)

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


#2.渲染dom元素
##2.1
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
 我们现在的render方法还做不到。它不会为每个tick更新之前同一个的div,相反它会新添一个新的div.
#5.组件和状态(state)
#6.Fiber:增强的调和