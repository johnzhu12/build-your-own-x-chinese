var hasOwnProperty = Object.prototype.hasOwnProperty
export function hasOwn(obj, key) {
    return hasOwnProperty.call(obj, key)
}
export function isObject(obj) {
    return obj !== null && typeof obj === 'object'
}
export function def(obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
        value: val,
        enumerable: !!enumerable,
        writable: true,
        configurable: true
    })
}
export var hasProto = '__proto__' in {}