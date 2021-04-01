

const a1 = { name: 'a1' };
const b1 = { name: 'b1' };
const b2 = { name: 'b2' };
const b3 = { name: 'b3' };
const c1 = { name: 'c1' };
const c2 = { name: 'c2' };
const d1 = { name: 'd1' };
const d2 = { name: 'd2' };

a1.render = () => [b1, b2, b3];
b1.render = () => null;
b2.render = () => [c1];
b3.render = () => [c2];
c1.render = () => [d1, d2];
c2.render = () => null;
d1.render = () => null;
d2.render = () => null;
class Node {
    constructor(instance) {
        this.instance = instance;
        this.child = null;
        this.sibling = null;
        this.return = null;
    }
}

function link(parent, elements) {
    if (elements === null) elements = [];

    parent.child = elements.reduceRight((previous, current) => {
        const node = new Node(current);
        node.return = parent;
        node.sibling = previous;
        return node;
    }, null);

    return parent.child;
}

// const children = [{ name: 'b1' }, { name: 'b2' }];
// const parent = new Node({ name: 'a1' });
// const child = link(parent, children);

// the following two statements are true
// console.log(child.instance.name === 'b1');
// console.log(child.sibling.instance === children[1]);

function doWork(node) {
    console.log(node.instance.name);
    const children = node.instance.render();
    return link(node, children);
}
const hostNode = new Node(a1);
walk(hostNode);
function walk(o) {
    let root = o;
    let current = o;

    while (true) {
        // perform work for a node, retrieve & link the children
        let child = doWork(current);

        // if there's a child, set it as the current active node
        if (child) {
            current = child;
            continue;
        }

        // if we've returned to the top, exit the function
        if (current === root) {
            return;
        }

        // keep going up until we find the sibling
        while (!current.sibling) {

            // if we've returned to the top, exit the function
            if (!current.return || current.return === root) {
                return;
            }

            // set the parent as the current active node
            current = current.return;
        }

        // if found, set the sibling as the current active node
        current = current.sibling;
    }
}