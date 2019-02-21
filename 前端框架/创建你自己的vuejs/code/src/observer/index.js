import {
    def, //new
    hasOwn,
    isObject
} from '../util/index'
import Dep from './dep'
export function observe(value) {
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
export function Observer(value) {
    this.value = value
    this.dep = new Dep()
    this.walk(value)
    def(value, '__ob__', this)
}

Observer.prototype.walk = function (obj) {
    var keys = Object.keys(obj)
    for (var i = 0; i < keys.length; i++) {
        defineReactive(obj, keys[i], obj[keys[i]])
    }
}

export function defineReactive(obj, key, val) {
    var dep = new Dep()
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function reactiveGetter() {
            // console.log('geter be called once!')
            var value = val
            if (Dep.target) {
                dep.depend()
            }
            return value
        },
        set: function reactiveSetter(newVal) {
            // console.log('seter be called once!')
            var value = val
            if (newVal === value || (newVal !== newVal && value !== value)) {
                return
            }
            val = newVal
            dep.notify()
        }
    })
}