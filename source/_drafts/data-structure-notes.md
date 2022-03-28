---
title: Data Structure Learnings
description: Notes & learnings for data structure and algoriths
date: 2021-05-16 19:21:13
categories: 
- Fundamentals
tags: 
- data-structure
- algorithms
---

## What is good code(Pillars)

1. Readable
2. Scalable
   1. Speed: Time Complexity
   2. Memory: Space Complexity

## Big O asymptomatic analysis

O(n): Linear Time
O(1): Constant Time
O(n^2): Quadratic Time
O(n!): Factorial Time

Big O Calculation Rules:

1. Worst Case
2. Remove Constants: O(2n) and O(n/2) and O(n + 5000) always get O(n). It's still linear.
3. Different terms for inputs
4. Drop Non Dominants

### What causes Time complexity

- Operations (+, -, \*, /)
- Comparisons (<, >, ==)
- Looping (for, while)
- Outside Function call (function())

### What causes Space complexity

- Variables
- Data Structures
- Function Call
- Allocations

## Data Structure

The memory controlller holds a dictionary of Address - 8bits(byte) storage. The CPU connects to the memory controller. Every data type, for example, an integer, occupies 32 bits of storage.

### Data types

Each language has data structures to organize its data types. For example, in Javascript.

### Operations on Data structures

- Insertion
- Deletion
- Traverse
- Searching
- Sorting
- Access

---

## Arrays

- `Static Arrarys` are allocated in adjacent blocks of memory when created.
- `Dynamic Arrarys` allows us to copy and rebuild an array at a new location with more memory.
- `strings` should be considered as array questions.

Take Javascript for example, arrays are actually dynamic arrays:

- lookup: O(1)
- push: O(1) or O(n) for copying and moving arrays when adding new items.
- pop: O(1)
- unshift: O(n): adding new items at the begining.
- splice: O(n): inserting or deleting items at specific index.

### Array Pros & Cons

Pros:

- Fast lookups
- Fast push/pop
- Ordered

Cons:

- Slow inserts
- Slow deleltes
- Fixed size\*

---

## Hash Tables

Hash tables are also known as:

- Hash Maps
- Maps
- Unordered Maps
- Dictionaries
- Objects

> Objects in Javascript are a type of hash tables.

Key/Value, key is used as the index of where to find the value in memory.

- Insert: O(1);
- Lookup: O(1);
- Delete: O(1);
- Search: O(1);

### Hash Function

A hash function is simply _a function that generates a value of fixed length_ for each input.

```
key -> hash function -> memory address
```

- One way: the value cannot be reversed once generated.
- Idempotence: No matter how many times the functions run, the same input will generate the same output.

Hash Functions used for Hash tables take the key and generates a hash value and then convert it to a memory address. Usually we assume the time complexity of these hash functions are **O(1)**;

### Hash Collisions

Hash collisions happen when there are a lot of data to store with limited memory. The hash function could give a same address which has already be taken by a previous key.

### Maps and Sets

In ES6, compared to Object, a map:

- allows the key to be any type
- maintains the insersion order.

Sets only stores the keys.

### Hash Tables Pros & Cons

Pros:

- Fast lookups
- Fast inserts
- Flexible Keys

Cons:

- Unordered
- Slow key iteration

---

## Linked List

- Value of the data
- Pointer to the next Node

First node is called the head.
Last node is called the tail.

- prepend: O(1)
- append: O(1)
- lookup: O(n)
- insert: O(n)
- delete: O(n)

### Pointer

A reference to another address in memory.

### Linked List Types

- `Singly Linked List`:
- `Doubly Linked List`: Contains pointer to the previous node.

---

## Stacks & Queues

Linear data structure:

### Stacks:

LIFO: Last in first out.

- pop: O(1), remove the last item.
- push: O(1), add an item to the stack.
- peek: O(1), view the last item.

### Queues

FIFO: First in first out.

- enqueue: O(1), add the item to the queue
- dequeue: O(1), take the first added item of the queue
- peek: O(1), view the first item.

> Build queues on top of linked list over arrays, because linked list is O(1) to append(enqueue) and remove head(dequeue).

---

## Trees

- Hierarchical structure: Trees have zero or more child nodes
- Root node: A tree usually starts with a single root node.
- Leaf node: The very end of a tree data structure.
- Every child of a node descends from only one parent.

### Binary Tree

Rules:

- Each node can only have either 0, 1 or 2 nodes.
- Each child can only have 1 parent.

Binary Trees:

- Perfect Binary Tree:
  - Every node has 0 or 2 children nodes, not 1.
  - The bottom level of the ree is completely filled.
  - The number of nodes of each level doubles as we move down the tree.
  - The number of nodes on the last level is equal to the sum of the number of nodes on all the other levels plus 1.
- Full Binary Tree:
  - A node has either 0 or 2 children nodes.

O(log N):

```
Level 0: 2^0 = 1;
Level 1: 2^1 = 2;
Level 2: 2^2 = 4;
Level 3: 2^3 = 8;

# of nodes = 2^height -1;
log nodes = height;
```

### Binary Search Tree

- Lookup: O(log N)
- Insert: O(log N)
- Delete: O(log N)

Rules:

- All child nodes in the tree, to the right of the root node must be greater than the current node.(Root 节点右侧的子节点，始终比当前所在的起始节点值大)
- A node can only have up to 2 children.

#### Balanced BST vs. Unbalanced BST

Unbalanced BST becomes a linked list.

- Loopup: O(n);
- Insert: O(n);
- Delete: O(n);

### Heap

#### Binary Heap

O(log N):

### Trie

## Graph

- Node(Vetex): each item is represented as a node.
- Edge: connect nodes

Linked list and trees are types of graph.

### Types of Graphs

- Directed: Go only one direction.
- Undirected: Bi-directional.
- Weighted: Information in the edges are used.
- Unweighted: No information in the edges
- Cyclic: connected in a circular fashion.
- Acyclic: cannot go back to the original node.

## Algorithms

### Recursion

- Base case: the case where the recursion should stop.

Fibonacci sequence

0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144...

The 3rd value is always equal to the sum of the previous 2 values.

- O(2^N) Exponential - recursive algorithms that solve a problem of size N.

> Anything can do with a recursion can be done iteratively.

When to use recursion?

- Traversing or searching through trees or graphs
- Everytime you are using a tree or converting something into a tree, consider recursion.

### Sorting

The issue with `sort()` in Javascript when it comes to numbers:

- It actually converts them to strings.
- Gets the charCode of the first letter.

```Javascript
const basket = [2, 65, 34, 2, 1, 7, 8];

basket.sort();

// For instance, 65 is converted to '65',
// then calls '65'.charCodeAt(0), it gets 54.

```

#### Bubble Sort

Bunble sort iterates each element and compare it with the one next to it, if the latter one is less than the current, swap them.

Time complexity: `O(n^2)`

#### Selection Sort

Selection sort loops through the list and look for the smallest element, swapping that element for the one in the first unsorted position.

Time complexity: `O(n^2)`

#### Insertion Sort

Insertion sort loops through every item and compares it with the previous adjacent item until it's put the right position. One advantage is that it does not go on iterating when the current item is found already greater than the previous adjacent one.

Time complexity: `O(n^2)`

#### Merge Sort

Merge sort uses the idea of Divide and Conquer, split the root array into smaller ones using recursion until there is only one item. Then merge it back one by one, and sort items during the merge.

Time complexity: `O(n log n)`

#### Quick Sort

Select a pivot to start with, compare it with previous or next element, swap items until it compares to all other items. Then divide the list at the pivot, do the compare recursively.


#### Counting Sort & Radix Sort

They are both Non-Comparision Sort, only works for numbers.

### When to use what

2. Bubble sort: better not to use it ever.
3. Selection sort: most likely not use it.
1. Insertion sort: preferred when input is small or items are mostly sorted.
4. Merge sort: preferred when worried about worst cases, or concerns on memory space.
5. Quick sort: preferred if you are not worried about the worst(Picking the worst pivot).
6. Radix & counting sort: Then the list items are numbers and values are within a ranged integers.

## Searching

### Linear Search

Go through items one by one, best case O(1), worst case O(n).

### Binary Search

Works with sorted items, divide and conquer.