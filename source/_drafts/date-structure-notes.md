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
- Traversal
- Searching
- Sorting
- Access

## Arrays

- Static Arrarys are allocated in adjacent blocks of memory when created.
- Dynamic Arrarys allows us to copy and rebuild an array at a new location with more memory.

Take Javascript for example, arrays are actually dynamic arrays:

- lookup: O(1)
- push: O(1) or O(n) for copying and moving arrays when adding new items.
- pop: O(1)
- unshift: O(n): adding new items at the begining.
- splice: O(n): inserting or deleting items at specific index.

> `strings` should be considered as array questions.

### Array Pros & Cons

Pros:

- Fast lookups
- Fast push/pop
- Ordered

Cons:

- Slow inserts
- Slow deleltes
- Fixed size\*

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

- One way: the value cannot be reversed once generated.
- Idempotence: No matter how many times the functions run, the same input will generate the same output.

Hash Functions used for Hash tables take the key and generates a hash value and then convert it to a memory address. Usually we assume the time complexity of these hash functions are **O(1)**;

### Hash Collisions

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

___
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

### Doubly Linked List

Contains pointer to the previous node.

___

## Stacks & Queues

___

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

### O(log N)

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


## Algorithms

