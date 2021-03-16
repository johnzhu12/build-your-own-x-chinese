var Vue = (function () {
    'use strict';

    function initState(vm) {
        initData(vm);
    }

    function initData(vm) {
        var data = vm.$options.data;
        vm._data = data;
        // proxy data on instance
        var keys = Object.keys(data);

        var i = keys.length;
        while (i--) {
            proxy(vm, keys[i]);
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
                vm._data[key] = val;
            }
        });
    }

    function initMixin(Vue) {
        Vue.prototype._init = function (options) {
            var vm = this;
            vm.$options = options;
            initState(vm);
        };
    }

    function Vue(options) {
        this._init(options);
    }

    initMixin(Vue);

    return Vue;

}());
