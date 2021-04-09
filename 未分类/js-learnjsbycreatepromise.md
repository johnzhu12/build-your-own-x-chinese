# javascript Promises-通过创建一个简单的 promise 例子来理解 promise 原理(https://levelup.gitconnected.com/understand-javascript-promises-by-building-a-promise-from-scratch-84c0fd855720)

在这篇教程里，你将通过从零创建一个 JavaScript promise 来学习它。

```js
class PromiseSimple {
  constructor(executionFunction) {
    this.promiseChain = []
    this.handleError = () => {}

    this.onResolve = this.onResolve.bind(this)
    this.onReject = this.onReject.bind(this)

    executionFunction(this.onResolve, this.onReject)
  }

  then(handleSuccess) {
    this.promiseChain.push(handleSuccess)

    return this
  }

  catch(handleError) {
    this.handleError = handleError

    return this
  }

  onResolve(value) {
    let storedValue = value

    try {
      this.promiseChain.forEach((nextFunction) => {
        storedValue = nextFunction(storedValue)
      })
    } catch (error) {
      this.promiseChain = []

      this.onReject(error)
    }
  }

  onReject(error) {
    this.handleError(error)
  }
}
```
