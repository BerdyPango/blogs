---
title: 《实现领域驱动设计》读书笔记(1) - 总览
date: 2017-02-18 12:09:17
description: 本文记录了领域驱动设计的概念及主要涵盖的内容
categories: 
- Domain-Driven Design
tags: 
- ddd
---

系列大纲: [《实现领域驱动设计》读书笔记](/tags/ddd/)

本文大纲: 
- [前言](#%E5%89%8D%E8%A8%80)
- [领域模型](#%E9%A2%86%E5%9F%9F%E6%A8%A1%E5%9E%8B)
    - [什么是领域模型？](#%E4%BB%80%E4%B9%88%E6%98%AF%E9%A2%86%E5%9F%9F%E6%A8%A1%E5%9E%8B)

# 前言
面向对象编程的博大精深至今只浅尝一二，开发实践中一直希望能够持久向好的设计方向上靠而不过度设计。2015 年时第一次接触到领域驱动设计，当时看了 《实现领域驱动设计》这本书，初看时晦涩难懂，许多概念与当时的理解存在很大偏差，一度不理解为何要那样设计。在经过了几个项目的实战之后，如今再翻出来看，对书中总结的思考方式和方法论有了一番新的体会。现在看来，领域驱动设计之所以难以理解，在于**其方法论的概念是抽象于任何语言和技术实现的**，长期工作在一线的开发人员想要脱离出自己所在的技术栈去理解类似「**值对象**」，「**标准类型**」等这样的概念，需要一些时间。

「**领域驱动设计**」或者 `DDD`，是一个非常庞大的体系，它既不是设计模式，也不代表任何技术实现，其中涵盖了软件系统中涉及的方方面面。决定记下本系列的初衷在于不断修正自己对 DDD 的理解和在实践上遇到的启发，以供来日回顾。
# 领域模型
{% blockquote ——《领域驱动设计》 %}
## 什么是领域模型？
领域模型是关于某个特定业务领域的软件模型。通常，领域模型通过对象来实现，这些对象同时包含了「**数据**」和「**行为**」，并且表达了准确的业务含义
{% endblockquote %}

---

「实现领域驱动」全书由高层视角深入到实现的细枝末节来组织章节，其索引大致为：

- 战略建模
    - 通用语言(Ubiquitous Language)
    - 领域，子域和核心域
    - 限界上下文(Bounded Context)
    - 上下文映射图(Context Mapping)
    - 架构(Archiecture)
- 战术建模
    - 实体(Entity)
    - 值对象(Value Object)
    - 领域服务(Domain Service)
    - 领域事件(Domain Event)
    - 模块(Module)
    - 聚合(Aggregate)
    - 工厂(Factory)
    - 资源库(Repository)
    - 集成限界上下文(Integrating Bounded Contexts)
    - 应用程序

设计一个系统所需的所有建模工具都能在以上这些概念中找到，书中针对这些概念的应用场景也提出了指导意见和最佳实践。这些内容会在后续的笔记中一一提到，只提取我个人认为精华的部分记录下来。