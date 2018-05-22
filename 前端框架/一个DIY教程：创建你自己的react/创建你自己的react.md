
#1.(Didact)一个DIY教程:创建你自己的react

[更新]这个系列从老的react架构写起，你可以跳过前面直接到文章：[所有地方使用新的fiber架构重写](https://engineering.hexacta.com/didact-fiber-incremental-reconciliation-b2fe028dcaec)

[更新2]听Dan的没错，我认真的

>这篇深入fiber架构的文章真的很棒。
— @dan_abramov


## 1.1 引言

很久以前，当我学数据结构和算法时，我有个作业就是实现自己的数组，链表，队列，和栈（用Modula-2语言）。那之后，我再也没有过要自己来实现链表的需求。总会有库让我不需要自己重新造轮子。

所以，那个作业有意义吗？当然，我从中学到了很多，知道如何合理使用各种数据结构，并知道根据场景合理选用它们。

这个系列文章的目的（[以及对应的仓库](https://github.com/hexacta/didact/)）也是一样，不过要实现的是我们现在用的比链表更多的东西：React

>我好奇如果不考虑性能和设备兼容性，POSIX(可移植操作系统接口)核心可以实现得多么小而简单。
— @ID_AA_Carmack


