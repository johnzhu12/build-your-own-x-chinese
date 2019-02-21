import {
    Observer,
    observe
} from "../../src/observer/index"
import Dep from '../../src/observer/dep'

describe('Observer test', function () {
    it('observing object prop change', function () {
        const obj = { a: 1, b: { a: 1 }, c: NaN }
        observe(obj)
        // mock a watcher!
        const watcher = {
            deps: [],
            addDep(dep) {
                this.deps.push(dep)
                dep.addSub(this)
            },
            update: jasmine.createSpy()
        }
        // observing primitive value
        Dep.target = watcher;
        console.log(obj.a)  //直接写obj.a貌似get不会被调用到
        Dep.target = null
        expect(watcher.deps.length).toBe(1) // obj.a
        obj.a = 3
        expect(watcher.update.calls.count()).toBe(1)
        watcher.deps = []
    });

});