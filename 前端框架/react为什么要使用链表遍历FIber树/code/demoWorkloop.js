const a1 = { name: 'a1', child: null, sibling: null, return: null };
const b1 = { name: 'b1', child: null, sibling: null, return: null };
const b2 = { name: 'b2', child: null, sibling: null, return: null };
const b3 = { name: 'b3', child: null, sibling: null, return: null };
const c1 = { name: 'c1', child: null, sibling: null, return: null };
const c2 = { name: 'c2', child: null, sibling: null, return: null };
const d1 = { name: 'd1', child: null, sibling: null, return: null };
const d2 = { name: 'd2', child: null, sibling: null, return: null };

a1.child = b1;
b1.sibling = b2;
b2.sibling = b3;
b2.child = c1;
b3.child = c2;
c1.child = d1;
d1.sibling = d2;

b1.return = b2.return = b3.return = a1;
c1.return = b2;
d1.return = d2.return = c1;
c2.return = b3;

let nextUnitOfWork = a1;
workLoop();

function workLoop() {
    while (nextUnitOfWork !== null) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    }
}

function performUnitOfWork(workInProgress) {
    let next = beginWork(workInProgress);
    if (next === null) {
        next = completeUnitOfWork(workInProgress);
    }
    return next;
}

function beginWork(workInProgress) {
    log('work performed for ' + workInProgress.name);
    return workInProgress.child;
}

function completeUnitOfWork(workInProgress) {
    while (true) {
        let returnFiber = workInProgress.return;
        let siblingFiber = workInProgress.sibling;

        nextUnitOfWork = completeWork(workInProgress);

        if (siblingFiber !== null) {
            // If there is a sibling, return it 
            // to perform work for this sibling
            return siblingFiber;
        } else if (returnFiber !== null) {
            // If there's no more work in this returnFiber, 
            // continue the loop to complete the returnFiber.
            workInProgress = returnFiber;
            continue;
        } else {
            // We've reached the root.
            return null;
        }
    }
}

function completeWork(workInProgress) {
    log('work completed for ' + workInProgress.name);
    return null;
}

function log(message) {
    let node = document.createElement('div');
    node.textContent = message;
    document.body.appendChild(node);
}