
const a1 = { name: 'a1' };
const b1 = { name: 'b1' };
const b2 = { name: 'b2' };
const b3 = { name: 'b3' };
const c1 = { name: 'c1' };
const c2 = { name: 'c2' };
const d1 = { name: 'd1' };
const d2 = { name: 'd2' };

a1.render = () => [b1, b2, b3];
b1.render = () => [];
b2.render = () => [c1];
b3.render = () => [c2];
c1.render = () => [d1, d2];
c2.render = () => [];
d1.render = () => [];
d2.render = () => [];
walk(a1);

function walk(instance) {
    doWork(instance);
    const children = instance.render();
    children.forEach(walk);
}

function doWork(o) {
    console.log(o.name);
}