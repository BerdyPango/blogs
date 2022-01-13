---
title: 索引 - 数据库
date: 2019-05-23 10:14:22
description:
category:
tags:
---

## 索引简介
数据库引擎的性能问题基本可由两部分解释: 
- 双向链表: 每一个链表节点称为一个「叶节点(Leaf Node)」，每个叶节点存储为一个数据库块或页 - 数据库最小存储单元
- 查询树: 
### Leaf 节点
索引是独立于数据库表的数据结构，索引行以 `Key` -> `Pointer` 存储单条记录，每条记录指向一条数据库记录，`Key` 对应于被索引的数据表字段，一系列索引记录组成一个「叶节点(Leaf Node)」，节点之间以双链列表关联起来，如下图:

{%asset_img index-leaf-node.png 叶节点示意图%}

### 查询树
索引叶节点存储了索引的逻辑顺序，但不代表其物理存储顺序，索引记录可能随机分布在磁盘的各个位置，数据库引擎通过另一个被称为「平衡搜索树(Balanced Search Tree)」来查找索引记录，又称为 B-tree。

{%asset_img b-tree-structure.png B-树结构%}

上图展示了一个 30 条索引记录的树结构，双向链表链接各个 Leaf 节点，从 Root 节点到 Branch 节点再到 Leaf 节点使用快速查找。左图高亮了一个 Branch 节点及其引用的 Leaf 节点的放大图，Branch 节点中的记录为各个 Leaf 节点中的最大值。

{%asset_img tree_traversal.png B-树遍历 %}

### 性能低下寻因
索引查找包括 3 个步骤：
1. 遍历索引 B-树
2. 跟随叶节点以查找是否有多条匹配记录
3. 定位并获取数据表中的数据

造成索引性能低下的原因有:
- 重复索引键: 即被索引字段有大量重复的匹配项，导致每次索引遍历得到不止一个 Key
- 定位数据需要访问多个数据页，如果单条索引 Key 需要访问多个数据页，则性能就会下降
- Function-based index 不能以不确定结果的函数创建索引，例如在函数中基于当前时间计算结果

## SQL Notes
- `GO` is a way of isolating one part of the script from another, but submitting it all in one block.
- `BENGIN...END` acts like `{...}` in other programming language like `C/++/#`. They bound a logical block of code.
- `N'{string value}'` means to declare the string as `nvarchar` data type.