

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->
* [1. 创建你自己的vuejs](#1-创建你自己的vuejs)
* [1. 创建你自己的vuejs](#1-创建你自己的vuejs)
	* [1.1 Vuejs概览](#11-vuejs概览)
	* [1.2 Vuejs内部的组件](#12-vuejs内部的组件)
		* [1.2.1 实例生命周期](#121-实例生命周期)
		* [1.2.2 响应式系统](#122-响应式系统)
		* [1.2.3 虚拟DOM](#123-虚拟dom)
		* [1.2.4 编译器](#124-编译器)
		* [1.2.5 搭建开发环境](#125-搭建开发环境)
			* [1.2.5.1 配置Rollup打包模块](#1251-配置rollup打包模块)
			* [1.2.5.2 为测试配置Karma和Jasmine](#1252-为测试配置karma和jasmine)
			* [1.2.5.3 目录结构](#1253-目录结构)
		* [1.2.6启动](#126启动)
* [2 响应式系统](#2-响应式系统)
	* [2.1 Dep](#21-dep)
	* [2.2 基本的Observer](#22-基本的observer)
	* [2.3 监控嵌套对象](#23-监控嵌套对象)
	* [2.4 观测设置或删除数据](#24-观测设置或删除数据)
	* [2.5 监控数组](#25-监控数组)
	* [2.6 Watcher](#26-watcher)
	* [2.6 Watcher](#26-watcher)
<!-- /code_chunk_output -->
[原文链接](https://github.com/jsrebuild/build-your-own-vuejs)

# 1. 创建你自己的vuejs

## 1.1 Vuejs概览

vuejs是个简单而强大的MVVM库，它可以帮助我们搭建现代web用户界面。

写这篇文章时，Vue在github上有36,312个stars。并且每月有230,250的npm下载量。Vue2.0更是为渲染层引入了轻量的虚拟dom实现，这为服务端渲染和原生端组件渲染带来了可能

>作者写这篇文章的时候，Vue在github上有36,312个stars，而译者翻译这篇文章时，Vue已经有107,032个Stars,已经超过了React的106,047个

vuejs宣称是一种渐进式javascript框架，尽管vuejs的核心很小，但是它配套了很多相应的工具和库，可以用来创建大型应用。


## 1.2 Vuejs内部的组件

我们首先来熟悉一下Vue内部的核心组件，vue的内部可以拆分成几部分

![vueinternals](./imgs/vueinternals.png)

### 1.2.1 实例生命周期

一个新创建的Vue实例会经历多个阶段，比如观察数据，初始化事件，编译模板，渲染。你可以在特定的阶段注册生命周期钩子，这些生命周期钩子将会被调用。

### 1.2.2 响应式系统

所谓的响应式系统就是vue‘数据-视图’绑定的黑魔法来源。当你设置vue实例的数据，视图相应的更新，反之亦然。

Vue使用<font color="red">Object.defineProperty</font>使数据对象的属性'响应'。另外使用众所周知的**观察者模式**来连接数据变化和视图渲染

### 1.2.3 虚拟DOM

虚拟DOM是在内存里的javascript对象树，用来映射真实的DOM树。

当数据变化了，vue将会渲染一颗全新的虚拟DOM树，并保存老的树。虚拟DOM模块会diff两颗树的不同，并把变化补丁到真实的DOM树上。

Vue使用[snabbdom](https://github.com/snabbdom/snabbdom)作为虚拟DOM的实现基础，为了和Vue的其他组件兼容，在这个基础上，做了些稍微的修改。

### 1.2.4 编译器

编译器的工作就是把模板编译成渲染函数（抽象语法树 ASTs）.编译器把混杂着Vue指令(Vue的指令只是些HTML属性)的HTML以及其他实体解析成一颗树，并会最大化检测出所有的静态子树（所有没有动态绑定的子树），把它们移出渲染。vue使用的html解析器是由[John Resig](https://johnresig.com)所写
>我们不会在这里讲解编译器的实现细节。我们可以在构建环节使用构建工具把Vue模板都编译成渲染函数，所以编译器并不包含在Vue的运行时中。另外我们甚至可以直接写渲染函数，所以编译器并不是理解Vue机制的核心部分。

### 1.2.5 搭建开发环境

创建我们自己的vuejs之前，我们首先要做一些环境配置，包括模块打包工具以及测试工具。因为我们将采用*测试-驱动*的流程

因为这是一个javascript项目，我们将使用一些新颖的工具。首先就是跑‘npm init’命令并设置一些项目信息

#### 1.2.5.1 配置Rollup打包模块

我们将使用Rollup来打包模块。[Rollup](https://rollupjs.org/guide/en)是一个js模块打包工具.它允许你为你的应用或库使用ES6的import/export语法来进行模块化开发。vuejs也是使用Rollup来打包模块的。

我们将为Rollup创建一个配置文件。在根目录下，创建rollup.conf.js文件：

```js
export default {
  input: 'src/instance/index.js',
  output: {
    name: 'Vue',
    file: 'dist/vue.js',
    format: 'iife'
  },
};
```

不要忘了跑‘npm install rollup rollup-watch --save-dev’命令

#### 1.2.5.2 为测试配置Karma和Jasmine

测试需要安装一些包，跑下面的命令：

```shell
npm install karma jasmine karma-jasmine karma-chrome-launcher
 karma-rollup-plugin karma-rollup-preprocessor buble  rollup-plugin-buble --save-dev
```

在根目录下，创建karma.conf.js文件：

```js
module.exports = function(config) {
  config.set({
    files: [{ pattern: 'test/**/*.spec.js', watched: false }],
    frameworks: ['jasmine'],
    browsers: ['Chrome'],
    preprocessors: {
      './test/**/*.js': ['rollup']
    },
    rollupPreprocessor: {
      plugins: [
        require('rollup-plugin-buble')(),
      ],
      output: {
        format: 'iife',
        name: 'Vue',
        sourcemap: 'inline'
      }
    }
  })
}
```

#### 1.2.5.3 目录结构

整个目录结构如下：

```text
- package.json
- rollup.conf.js
- node_modules
- dist
- test
- src
  - observer
  - instance
  - util
  - vdom
```

### 1.2.6启动

我们方便起见，将添加一些npm脚本
*package.json*

```json
"scripts": {
   "build": "rollup -c",
   "watch": "rollup -c -w",
   "test": "karma start"
}
```

为了启动我们自己的vuejs,先写我们的第一个测试用例。
*test/options/options.spec.js*

```js
import Vue from "../../src/instance/index";

describe('Proxy test', function () {
    it('should proxy vm._data.a = vm.a', function () {
        var vm = new Vue({
            data: {
                a: 2
            }
        })
        expect(vm.a).toEqual(2);
    });
});
```

该测试用例测试vm上data的属性（如vm._data.a）,是否都代理到vm上了（比如vm.a）。这是vue其中的一个小技巧。

所以我们可以为我们的vue写下第一行真正代码
*src/instance/index.js*

```js
import { initMixin } from './init'

function Vue (options) {
  this._init(options)
}

initMixin(Vue)

export default Vue
```

粗看只是Vue的构造函数调用了this._init,没什么特别的地方。所以我们来看下‘initMixin’干了什么：
*src/instance/init.js*

```js
import { initState } from './state'

export function initMixin (Vue) {
  Vue.prototype._init = function (options) {
  var vm = this
  vm.$options = options
  initState(vm)
  }
}
```

Vue的实例方法用[织入模式](http://oomusou.io/javascript/mixin/)来注入。我们将会在后面发现Vue经常使用织入模式来添加实例方法。Minxin只是一个函数，它接收一个构造函数的参数，添加一些方法到该构造函数的原型上，并返回这个构造函数。

所以'initMixin‘添加了'_init'方法到'Vue.prototype'。而_init方法调用state.js下的initState方法
*src/instance/state.js*

```js
export function initState(vm) {
  initData(vm)
}

function initData(vm) {
  var data = vm.$options.data
  vm._data = data
  // proxy data on instance
  var keys = Object.keys(data)

  var i = keys.length
  while (i--) {
    proxy(vm, keys[i])
  }
}

function proxy(vm, key) {
    Object.defineProperty(vm, key, {
      configurable: true,
      enumerable: true,
      get: function proxyGetter() {
        return vm._data[key]
      },
      set: function proxySetter(val) {
        vm._data[key] = val
      }
    })
}
```

最后，我们终于看到了proxy-代理。initState调用initData方法,initData遍历vm._data上的所有key,在每个value上调用proxy方法。

proxy用同样的key在vm上定义属性，并且这个属性有setter和getter方法，而getter和setter方法就是从vm._data上获取和设置数据。

这就是vm.a怎么代理到vm._data.a的。

跑‘npm run build’ 和 ‘npm run test’,你应该会看到下面的结果：
![1-result](./imgs/1-result.png)

很棒！你现在已经启动了自己的vuejs，继续努力！

# 2 响应式系统

Vue的响应式系统使model和view之间的数据绑定显得简单自然。数据就是一个javascript对象，当data变更，视图就根据最后的状态相应地更新。堪称完美。
在内部，vuejs将遍历data的所有属性并把它们用Object.defineProperty转成 getter/setter方法
data中的每一个原始键值对，都分配一个Observer实例，Observer会先通知watchers都是谁订阅了这些值的变化事件。
每一个**Vue**实例都有一个**Watcher**实例，在组件作为依赖渲染的时候来收集所有'被触碰过'的属性。当数据变化了之后，watcher会重新收集依赖，并跑那些在初始化watcher的时候传过来的回调。
那么，如何通知watcher数据变化了呢？观察者模式来了！我们定义一个新的类叫**Dep**。作为中介者，它的意思就是“依赖”。Oberserver实例有对所有当数据变动它需要去通知的deps的引用，而每个dep实例知道哪个watcher需要去更新。
如果从上层看，这就是响应式系统运行的机制。下一节，我们详细看下这个响应系统的具体实现细节。

## 2.1 Dep

Dep的实现很简单，每个dep实例有个uid来标识。subs数组记录了所有订阅了这个dep实例的watcher. Dep.prototype.notify 调研subs数组中每个订阅者的更新方法。Dep.prototype.depend是在watcher的重新检查的时候收集依赖。我们一会再讲watcers。你现在只需要知道Dep.target就是在当时要重新检查的watcher实例。因为这个属性是静态的，所以Dep.target是全局的，并且一次只指向一个watcher。

src/observer/dep.js

```js
var  uid = 0

// Dep contructor
export default function Dep(argument) {
  this.id = uid++
  this.subs = []
}

Dep.prototype.addSub = function(sub) {
  this.subs.push(sub)
}

Dep.prototype.removeSub = function(sub) {
  remove(this.subs, sub)
}

Dep.prototype.depend = function() {
  if (Dep.target) {
    Dep.target.addDep(this)
  }
}

Dep.prototype.notify = function() {
  var subs = this.subs.slice()
  for (var i = 0, l = subs.length; i < l; i++) {
    subs[i].update()
  }
}

Dep.target = null
```

## 2.2 基本的Observer

我们先来个模板：

```js
// Observer constructor
export function Observer(value) {

}

// API for observe value
export function observe (value){

}
```

实现Oberver之前，我们先写个测试用例。

test/observer/observer.spec.js

```js
import {
  Observer,
  observe
} from "../../src/observer/index"
import Dep from '../../src/observer/dep'

describe('Observer test', function() {
  it('observing object prop change', function() {
    const obj = { a:1, b:{a:1}, c:NaN}
    observe(obj)
    // mock a watcher!
    const watcher = {
      deps: [],
      addDep (dep) {
        this.deps.push(dep)
        dep.addSub(this)
      },
      update: jasmine.createSpy()
    }
    // observing primitive value
    Dep.target = watcher
    obj.a
    Dep.target = null
    expect(watcher.deps.length).toBe(1) // obj.a
    obj.a = 3
    expect(watcher.update.calls.count()).toBe(1)
    watcher.deps = []
  });

});
```

我们先定义了一个js对象obj来模拟数据，然后我们用oberseve方法使数据响应式，因为我们还没有实现watcher，我们需要模拟一个watcer。一个watcer有一个订阅依赖的deps数组，当数据变化时候update方法将被调用。我们后面再看addDep方法。
这里我们使用一个jasmine的监控方法占位。一个监控方法不做任何事。它只记录方法被调用次数和被调用时候传入的参数。
然后我们把全局的Dep.target指向watcher,然后设置obj.a。如果数据是响应式的，watcher的更新方法将会被调用。
所以我们先专注于observe方法。下面就是代码。observe方法先检查值是不是对象。如果是的话，通过检查它的__ob__属性，检查该值是不是已经挂了一个Observer实例。
如果不存在Observer实例，observe就会给该值实例化一个Observer实例并返回。

src/observer/index.js

```js
import {
  hasOwn,
  isObject
}
from '../util/index'

export function observe (value){
  if (!isObject(value)) {
    return
  }
  var ob
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else {
    ob = new Observer(value)
  }
  return ob
}
```

这里我们需要一个小工具方法hasOwn，它其实就是对Object.prototype.hasOwnProperty的一个简单封装:

src/util/index.js

```js
var hasOwnProperty = Object.prototype.hasOwnProperty
export function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}
```

还有另一个工具方法isObject：

src/util/index.js

```js
···
export function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}
```

现在我们来看下Observer的构造函数。它会实例化一个Dep实例，传入值调用walk方法。并会把observer以__ob__的属性挂在值上。
src/observer/index.js

```js
import {
  def, //new
  hasOwn,
  isObject
}
from '../util/index'

export function Observer(value) {
  this.value = value
  this.dep = new Dep()
  this.walk(value)
  def(value, '__ob__', this)
}
```

这里的def是个新的工具方法，它会用Object.defineProperty() API来给对象定义属性
src/util/index.js

```js
···
export function def (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}
```

walk方法就是遍历对象，对每个值调用defineReactive方法。
src/observer/index.js

```js
Observer.prototype.walk = function(obj) {
  var keys = Object.keys(obj)
  for (var i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i], obj[keys[i]])
  }
}
```

defineReactive里就要用到Object.defineProperty了

src/observer/index.js

```js
export function defineReactive (obj, key, val) {
  var dep = new Dep()
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      var value = val
      if (Dep.target) {
        dep.depend()
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      var value =  val
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      val = newVal
      dep.notify()
    }
  })
}
```

reactiveGetter方法检查Dep.target是否存在，如果存在，表示getter方法在watcher手机依赖的时候被触发了。当这种情况时，我们通过调用dep.depend()来添加依赖。dep.depend方法实际上调用的是Dep.target.addDep(dep)。因为Dep.target就是一个watcher，Dep.target.addDep(dep)就等同于watcher.addDep(dep),我们看看addDep做了什么：

```js
addDep (dep) {
   this.deps.push(dep)
   dep.addSub(this)
}
```

它把dep放进watcher的deps数组。同时把目标watcher放入dep的subs数组。所以这就是依赖如何追踪的。

reactiveSetter方法仅仅在新值和旧值不同的时候设置成新值。同时通过dep.notify()方法来通知watcher来更新。我们回顾下之前Dep那节：

```js
Dep.prototype.notify = function() {
  var subs = this.subs.slice()
  for (var i = 0, l = subs.length; i < l; i++) {
    subs[i].update()
  }
}
```

Dep.prototype.notify调用subs数组里的每个watcher的update方法。对，这些watchers就是在Dep.target.addDep(dep)的时候被放进subs数组的。现在都连起来了。
现在我们跑一下npm run test命令，我们之前写的用例应该通过了。

## 2.3 监控嵌套对象

我们现在只能监控原始类型的简单对象。所以这一节我们将添加非原始类型，比如对象的监控支持。

首先我们把测试用例修改一下:

test/observer/observer.spec.js

```js
  it('observing object prop change', function() {
  ···
    // observing non-primitive value
    Dep.target = watcher
    obj.b.a
    Dep.target = null
    expect(watcher.deps.length).toBe(3) // obj.b + b + b.a
    obj.b.a = 3
    expect(watcher.update.calls.count()).toBe(1)
    watcher.deps = []
  });
```

obj.b自己就是一个对象。所以我们通过检查改变obj.b是否被通知来判断对象监测是否支持。

解决方案很简单，我们对val递归地调用observe方法。因为如果val不是个对象，observe方法就会返回。所以当我们用defineReactive来监控一堆键值对的时候，我们调用observe方法并把返回值保存在childOb上。

src/observer/index.js

```js
export function defineReactive (obj, key, val) {
  var dep = new Dep()
  var childOb = observe(val) // new
  Object.defineProperty(obj, key, {
    ···
  })
}
```

我们要存下子observer的引用的原因是，当getter被调用的时候，我们需要在子对象上重新收集依赖。

src/observer/index.js

```js
···
get: function reactiveGetter () {
      var value = val
      if (Dep.target) {
        dep.depend()
        // re-collect for childOb
        if (childOb) {
          childOb.dep.depend()
        }
      }
      return value
    }
···
```

同时在setter被调用的时候我们也要重新监控子对象。

```js
···
set: function reactiveSetter (newVal) {
      var value =  val
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      val = newVal
      childOb = observe(newVal) //new
      dep.notify()
    }
···
```

## 2.4 观测设置或删除数据

Vue在监控数据方面有一些警示。因为Vue处理数据变化的方式,它不能监控到属性的添加和删除。数据只有在getter和setter被调用的时候才能被监控到，但设置或删除数据，getter和setter并不会被调用。

然后，使用Vue.set(object, key, value)方法给嵌套的对象添加响应属性，和Vue.delete(object, key, value)来删除响应属性是可能的。

像之前一样，我们先来写个测试用例:

test/observer/observer.spec.js

```js
import {
  Observer,
  observe,
  set as setProp, //new
  del as delProp  //new
}
from "../../src/observer/index"
import {
  hasOwn,
  isObject
}
from '../util/index' //new

describe('Observer test', function() {
  // new test case
  it('observing set/delete', function() {
    const obj1 = {
      a: 1
    }
    // should notify set/delete data
    const ob1 = observe(obj1)
    const dep1 = ob1.dep
    spyOn(dep1, 'notify')
    setProp(obj1, 'b', 2)
    expect(obj1.b).toBe(2)
    expect(dep1.notify.calls.count()).toBe(1)
    delProp(obj1, 'a')
    expect(hasOwn(obj1, 'a')).toBe(false)
    expect(dep1.notify.calls.count()).toBe(2)
    // set existing key, should be a plain set and not
    // trigger own ob's notify
    setProp(obj1, 'b', 3)
    expect(obj1.b).toBe(3)
    expect(dep1.notify.calls.count()).toBe(2)
    // should ignore deleting non-existing key
    delProp(obj1, 'a')
    expect(dep1.notify.calls.count()).toBe(3)
  });
  ···
}
```

我们在Observer的测试用例里添加了'监控设置/删除'的新测试用例。

现在我们来实现这两个方法:

src/observer/index.js

```js
export function set (obj, key, val) {
  if (hasOwn(obj, key)) {
    obj[key] = val
    return
  }
  const ob = obj.__ob__
  if (!ob) {
    obj[key] = val
    return
  }
  defineReactive(ob.value, key, val)
  ob.dep.notify()
  return val
}

export function del (obj, key) {
  const ob = obj.__ob__
  if (!hasOwn(obj, key)) {
    return
  }
  delete obj[key]
  if (!ob) {
    return
  }
  ob.dep.notify()
}
```

set方法先检测属性是否存在，如果存在，设置新值并返回。然后我们通过obj.__ob__检测该对象是否是响应的，如果不是，返回。如果key不存在，就用defineReactive创建键值对，并调用ob.dep.notify()通知该对象的值已经改变了。

delete方法就如预期的那样，通过delete操作符删除了对应的值。

## 2.5 监控数组

我们的实现还有一个问题，不能监控数组变化。因为通过下标访问数组元素并不会触发getter方法，所以我们之前的getter/setter方法不适用于数组监控。

为了监控数组变化，我们需要劫持一些数组方法，比如Array.prototype.pop()和Array.prototype.shift(),并且我们将使用在最后实现的Vue.set API，来替代通过下标设置数组的值。
下面是”监控数组变化“的测试用例，当我们使用数组API来改变数组，变化将被监控到。每一个数组元素也会被监控到。

test/observer/observer.spec.js

```js
describe('Observer test', function() {
  // new
  it('observing array mutation', () => {
    const arr = []
    const ob = observe(arr)
    const dep = ob.dep
    spyOn(dep, 'notify')
    const objs = [{}, {}, {}]
    arr.push(objs[0])
    arr.pop()
    arr.unshift(objs[1])
    arr.shift()
    arr.splice(0, 0, objs[2])
    arr.sort()
    arr.reverse()
    expect(dep.notify.calls.count()).toBe(7)
    // inserted elements should be observed
    objs.forEach(obj => {
      expect(obj.__ob__ instanceof Observer).toBe(true)
    })
  });
  ···
}
```

第一步是在Oberver方法里处理数组

src/observer/index.js

```js
export function Observer(value) {
  this.value = value
  this.dep = new Dep()
  //this.walk(value) //deleted
  // new
  if(Array.isArray(value)){
    this.observeArray(value)
  }else{
    this.walk(value)
  }
  def(value, '__ob__', this)
}
```

observeArray仅仅是遍历数组，对每一个元素调用oberve方法。

src/observer/index.js

```js
···
Observer.prototype.observeArray = function(items) {
  for (let i = 0, l = items.length; i < l; i++) {
    observe(items[i])
  }
}
```

下面我们通过修改Array原型链来覆盖原来的Array方法

首先我们创建一个单例，它拥有所有被改变了的数组方法。这些数组方法为了处理变化检测，加上了别的逻辑。

src/observer/array.js

```js
import { def } from '../util/index'

const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)

/**
 * Intercept mutating methods and emit events
 */
;[
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]
.forEach(function (method) {
  // cache original method
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator () {
    let i = arguments.length
    const args = new Array(i)
    while (i--) {
      args[i] = arguments[i]
    }
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
        inserted = args
        break
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted)
    // notify change
    ob.dep.notify()
    return result
  })
})
```

arrayMethods就是那个拥有所有已经被改变方法的单例。

对于数组里的所有方法

>['push','pop','shift','unshift','splice','sort','reverse']

我们定义了一个mutator方法来改变原来的方法。

在mutator里，我们首先获取所有的参数放到一个数组里，然后对这个参数数组调用所有的原来数组方法，并保存结果。

当对数组添加新元素时，我们对新元素数组调用observeArray方法。

最后我们通过ob.dep.notify()来通知变化，并返回结果。

第二步，我们需要把这个单例加到原型链里面。

如果我们在当前浏览器环境下，可以直接使用__proto__下标的话，我们就把数组的原型链直接指向我们创建的单例。

如果浏览器不支持__proto__的话，我们就把arrayMethods单例混入监控的数组。

所以我们添加一些工具函数：

src/observer/index.js

```js
// helpers
/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment (target, src) {
  target.__proto__ = src
}

/**
 * Augment an target Object or Array by defining
 * properties.
 */
function copyAugment (target, src, keys) {
  for (let i = 0, l = keys.length; i < l; i++) {
    var key = keys[i]
    def(target, key, src[key])
  }
}
```

在Observer方法里，我们根据是否可以使用__proto__,来决定调用protoAugment或copyAugment。给我们的原始数组增强功能。

```js
import {
  def,
  hasOwn,
  hasProto, //new
  isObject
}
from '../util/index'

export function Observer(value) {
  this.value = value
  this.dep = new Dep()
  if(Array.isArray(value)){
    //new
    var augment = hasProto
        ? protoAugment
        : copyAugment
      augment(value, arrayMethods, arrayKeys)
    this.observeArray(value)
  }else{
    this.walk(value)
  }
  def(value, '__ob__', this)
}
```

hasProto的定义很简单

src/util/index.js

```js
···
export var hasProto = '__proto__' in {}
```

现在应该能通过那个”监控数组变化“的测试了

## 2.6 Watcher

我们在之前模拟了Watcher:

```js
const watcher = {
  deps: [],
  addDep (dep) {
    this.deps.push(dep)
    dep.addSub(this)
    },
    update: jasmine.createSpy()
}
```

所以这里watcher在这里只是一个有deps属性的对象，deps用来记录该watcher所以的依赖。它还有一个addDep方法来添加依赖。一个update方法，当监控的数据变化时候被调用。

我们来看下Watcher的构造函数签名:

```js
constructor (
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: Object
  )
```

可以看到Watcher的构造函数接收一个expOrFn和一个cb回调函数。expOrFn是一个在初始化watcher的时候就执行的表达式或方法。回调函数是在当watcher需要执行回调的时候被调用的。

下面的测试用例应该能揭开worker的神秘面纱。

test/observer/watcher.spec.js

```js
import Vue from "../../src/instance/index";
import Watcher from "../../src/observer/watcher";

describe('Wathcer test', function() {
  it('should call callback when simple data change', function() {
    var vm = new Vue({
      data:{
        a:2
      }
    })
    var cb = jasmine.createSpy('callback');
    var watcher = new Watcher(vm, function(){
      var a = vm.a
    }, cb)
    vm.a = 5;
    expect(cb).toHaveBeenCalled();
  });
}
```

expOrFn被执行，所以vm数据的响应式getter会被调用(这里是vm.a的getter).watcher把自己设置为Dep的target.所以vm.a的dep就会把该watcher实例放到自己的subs数组里。watcher会把vm.a的dep推进自己的deps数组。当vm.a的setter被调用。vm.a下，dep的subs数组就会被遍历并且subs数组中的每个watcher的update方法将会被调用。最后watcher的回调将会被调用。

现在我们来实现watcher类：

src/observer/watcher.js

```js
let uid = 0

export default function Watcher(vm, expOrFn, cb, options) {
  options = options ? options : {}
  this.vm = vm
  vm._watchers.push(this)
  this.cb = cb
  this.id = ++uid

  // options
  this.deps = []
  this.newDeps = []
  this.depIds = new Set()
  this.newDepIds = new Set()
  this.getter = expOrFn
  this.value = this.get()
}
```

Watcher类会初始化一些属性。每个Watcher实例会保留一个id以备后用。这个id通过'this.id = ++ uid'设置。this.deps和this.newDeps是存放deps对象的数组，用来管理Deps.我们后面将知道为什么需要两个数组。this.depIds和this.newDepIds是相对应的id集合。我们可以通过这些集合快速查找对应的dep实例是否存在。

src/observer/watcher.js

```js
Watcher.prototype.get = function() {
  pushTarget(this)
  var value = this.getter.call(this.vm, this.vm)
  popTarget()
  this.cleanupDeps()
  return value
}
```
Watcher.prototype.get 方法首先push当前的Watcher实例