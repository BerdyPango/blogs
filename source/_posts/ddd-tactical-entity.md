---
title: 《实现领域驱动设计》读书笔记(4) - 战术建模之实体
date: 2017-03-01 02:11:17
description: 当我们需要考虑一个对象的个性特征，或需要区分不同的对象时，我们引入实体这个领域概念。一个实体是一个唯一的东西，并且可以在相当长的时间内持续地变化
categories:
- Domain-Driven Design
tags: 
- ddd
---

系列大纲: [《实现领域驱动设计》读书笔记](/tags/ddd/)

本文大纲: 

- [唯一标识](#%E5%94%AF%E4%B8%80%E6%A0%87%E8%AF%86)
- [委派标识](#%E5%A7%94%E6%B4%BE%E6%A0%87%E8%AF%86)
- [标识稳定性](#%E6%A0%87%E8%AF%86%E7%A8%B3%E5%AE%9A%E6%80%A7)
- [实体及其本质特征](#%E5%AE%9E%E4%BD%93%E5%8F%8A%E5%85%B6%E6%9C%AC%E8%B4%A8%E7%89%B9%E5%BE%81)
    - [贫血领域模型](#%E8%B4%AB%E8%A1%80%E9%A2%86%E5%9F%9F%E6%A8%A1%E5%9E%8B)
    - [强类型实体标识](#%E5%BC%BA%E7%B1%BB%E5%9E%8B%E5%AE%9E%E4%BD%93%E6%A0%87%E8%AF%86)
    - [模型所扮演的角色](#%E6%A8%A1%E5%9E%8B%E6%89%80%E6%89%AE%E6%BC%94%E7%9A%84%E8%A7%92%E8%89%B2)
    - [不变条件](#%E4%B8%8D%E5%8F%98%E6%9D%A1%E4%BB%B6)
    - [验证](#%E9%AA%8C%E8%AF%81)
    - [跟踪变化](#%E8%B7%9F%E8%B8%AA%E5%8F%98%E5%8C%96)

当我们需要考虑一个对象的个性特征，或需要区分不同的对象时，我们引入实体这个领域概念。一个实体是一个唯一的东西，并且可以在相当长的时间内持续地变化。「**唯一的身份标识**」和「**可变性特征**」将实体和值对象区分开来。

> 常年进行 .NET 生态开发的人很容易把实体等同于 **Entity Framework** 中的 `Entity`，认为 `Entity` 就是数据库模型的对象映射，然而书中所说的实体完全是不同的概念，是面向业务领域的模型，数据映射模型因不具备任何行为的实体被称作「**贫血领域模型**」

## 唯一标识
以下是常用的创建实体身份标识的策略，从简单到复杂依次为：
- 用户提供一个或多个初始唯一值作为程序输入，程序应该保证这些初始值是唯一的
- 程序内部通过某种算法自动生成身份标识
- 程序依赖于持久化存储，比如数据库来生成唯一标识
- 另一个限界上下文已经决定出了唯一标识，这作为程序的输入，用户可以在一组标识中进行选择

聚合根实体对象的唯一标识是全局唯一的，在同一个聚合中，一般实体的唯一标识只要和聚合内的其他实体区分开来即可。

> 将唯一标识的生成放在「**资源库(Repository)**」中是一种自然的选择

从数据库中获取标识比直接从应用程序中生成标识要慢得多，一种解决方法是将数据库序列缓存在应用程序中，比如缓存在资源库中。

> 有时，标识的生成和赋值时间对于实体来说是重要的，及早标识生成和赋值发生在持久化实体之前。延迟标识生成和赋值发生在持久化实体的时候

## 委派标识
有些 `ORM` 工具通过自己的方式来处理对象的身份标识，如果我们自己的领域需要另外一种实体标识，此时两者将产生冲突。为了解决这个问题，需要使用两种标识，一种为领域所用，一种为 `ORM` 所用，在 `Hibernate` 中，被称为委派标识。委派标识与领域中的实体标识没有任何关系，委派标识只是为了迎合 `ORM` 创建的。

## 标识稳定性
在多数情况下，我们都不应该修改实体的唯一标识，这样可以在实体的整个生命周期中保持标识的稳定性。

## 实体及其本质特征

### 贫血领域模型
过多拥有 `getter` 和 `setter` 方法而缺乏行为的模式可以概括为贫血领域模型。

### 强类型实体标识
标识需要有特殊的类型还是可以使用简单的字符串？实体的唯一标识会用在很多地方，它可以用在不同限界上下文的所有实体上。在这种情况下，使用一个强类型的实体标识可以保证所有订阅方所持有的实体都能使用正确的标识。

> 这里所说的实体标识更多是指聚合根的实体标识？

### 模型所扮演的角色
在面向对象编程中，通常由接口来定义实现类的角色，在正确的设计情况下，一个类对于每一个它所实现的接口都存在一种角色。如果一个类没有显式的角色 - 即该类没有实现任何接口，那么默认情况下它扮演的即是本类的角色，也即，该类的公有方法表示该类的隐式接口。

### 不变条件
不变条件是在整个实体生命周期中都必须保持事务一致性的一种状态，有时一个实体维护了一个或多个不变条件。如果实体的不变条件要求该实体所包含的所有对象都不能为 null，那么这些状态需要作为参数传递给构造函数，并且在相应的 `setter` 方法中对新值进行非 `null` 检查来确保一致性。

### 验证
> **自封装**：无论从何处访问对象的状态，即使从对象内部访问数据，都必须通过 `getter` 和 `setter` 方法实现。

自封装首先为对象的实例变量和类变量提供了一层抽象。其次，我们可以方便地在对象中访问其所引用对象的属性。重要的是，自封装使验证变得非常简单。

验证的主要目的在于检查模型的正确性，我们将对模型进行三个级别的验证：
- 验证属性: 通过自封装的方式在 `setter` 方法中对属性进行验证
- 验证整体对象: 为了实现对整体对象的验证，可创建 `Entity` 层超类型，在其中定义 `Validate` 虚方法，实现类通过重写该方法按需调用验证逻辑，同时，由于验证逻辑的变化速度比实体本身还要快，所以应该将真正的验证逻辑委托给专门的验证类，实体在其 `Validate` 方法中使用这些验证类，从而使验证逻辑与实体解耦。
- 验证组合对象: 关注点从单个实体是否合法转向多个实体的是组合是否全部合法，包括一个或多个聚合实例。最好的方式是把这样的验证过程创建成一个领域服务，该领域服务通过资源库读取需要验证的聚合实例，然后对每个实例进行验证，可以是单独验证，也可以和其他聚合实例一起验证。

### 跟踪变化
领域专家可能会关心发生在模型中的一些重要事件，此时就需要对实体的一些特殊变化进行跟踪了。跟踪变化最实用的方法是「**领域事件**」和「**事件存储**」。可以为领域专家所关心的所有状态改变都创建单独的事件类型，事件的名字和属性表明发生了什么样的事件。当命令操作执行完后，系统发出这些领域事件，订阅方接收发生在模型上的所有事件。接收到事件后，订阅方将事件保存在事件存储中。
