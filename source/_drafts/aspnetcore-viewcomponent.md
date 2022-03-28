---
title: ASP.NET Core 应用 - 视图组件
description: ASP.NET Core 视图组件简介，阅读微软官网文档的摘抄和心得
date: 2017-07-15 19:21:13
categories: 
- ASP.NET Core
tags: 
- aspnet-core
- aspnet-core-mvc
---

参考资料: 
- [View components in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/mvc/views/view-components?view=aspnetcore-2.1)


本文大纲: 
- [前言](#%E5%89%8D%E8%A8%80)
- [创建视图组件](#%E5%88%9B%E5%BB%BA%E8%A7%86%E5%9B%BE%E7%BB%84%E4%BB%B6)
- [视图组件方法](#%E8%A7%86%E5%9B%BE%E7%BB%84%E4%BB%B6%E6%96%B9%E6%B3%95)
- [视图查找路径](#%E8%A7%86%E5%9B%BE%E6%9F%A5%E6%89%BE%E8%B7%AF%E5%BE%84)
- [调用视图组件](#%E8%B0%83%E7%94%A8%E8%A7%86%E5%9B%BE%E7%BB%84%E4%BB%B6)
- [使用标签的方式调用视图组件](#%E4%BD%BF%E7%94%A8%E6%A0%87%E7%AD%BE%E7%9A%84%E6%96%B9%E5%BC%8F%E8%B0%83%E7%94%A8%E8%A7%86%E5%9B%BE%E7%BB%84%E4%BB%B6)
- [从控制器中调用视图组件](#%E4%BB%8E%E6%8E%A7%E5%88%B6%E5%99%A8%E4%B8%AD%E8%B0%83%E7%94%A8%E8%A7%86%E5%9B%BE%E7%BB%84%E4%BB%B6)


# 前言
ASP.NET Core 只有两种组件作为路由系统的入口点:
- Views: 以  Controller 为基础返回的视图
- Razor Pages: 直接返回 Razor Page

两种组件都可以在其内部渲染 Partial 视图，但任何一种组件都不能直接渲染另一种，一个可选的方案是，View Component(下称**「视图组件」**)。

视图组件不会使用模型绑定系统，仅仅依赖于传递给它的数据，它:
- 仅渲染一块内容而非整个 Response
- 依然保有职责分离的特性
- 可以包含参数及业务逻辑
- 可以从模板页面从调用

视图组件用于封装可重用的，但分部视图无法胜任的渲染逻辑，例如:
- 动态导航菜单
- 标签云(需访问数据库)
- 购物车
- 最近发布的文章
- 博客的侧边内容
- 根据用户登录状态展示的登录面板，已登录或未登录

视图组件由两部分组成，继承自 `ViewComponent` 的类和对应的视图。

# 创建视图组件
有以下方式可以创建视图组件:
- 从 `ViewComponent` 类型派生
- 使用 `[ViewComponent]` 特性标记一个类型，或一个派生自被 `[ViewComponent]` 特性标记的类型
- 创建一个以 *ViewComponent* 为后缀的类型

视图组件类型必须为公开的，非嵌套，非抽象类。视图组件的名称是其类型名称移除 *ViewComponent* 的部分，该名称也可通过 `ViewComponentAttribute.Name` 进行显式指定，视图组件类型:
- 完全支持依赖注入
- 不同于控制器的生命周期，所以无法对其应用过滤器

# 视图组件方法
视图组件将逻辑定义在 `InvokeAsync` 方法中，该方法返回一个 `IViewComponentResult` 类型的实例，方法参数由调用者传递而非来自模型绑定系统，视图组件不会直接处理请求。通常，视图组件初始化一个模型，并调用 `View` 方法将该模型传递至视图。视图模型的方法:
- 定义一个 `InvokeAsync` 方法，该方法返回一个 `IViewComponentResult` 类型的实例
- 初始化一个模型，并调用 `View` 方法将该模型传递至视图
- 方法参数由调用者传递而非来自模型绑定系统
- 并非一个 HTTP 请求的入口点，它们通常由视图调用
- 由方法重载传递不同的参数

# 视图查找路径
运行时从以下路径查找视图:
- `Views/<controller_name>/Components/<view_component_name>/<view_name>`
- `Views/Shared/Components/<view_component_name>/<view_name>`: 官方推荐的组织方式

# 调用视图组件
编写以下代码调用视图组件: 
``` html
@Component.InvokeAsync("Name of view component", *anonymous type containing parameters*)

@await Component.InvokeAsync("PriorityList", new { maxPriority = 4, isDone = true })
```
第二行代码表示，调用名为 `PriorityList` 的视图组件，匿名类型中的两个参数将传递给类型中的 `InvokeAsync` 方法。

# 使用标签的方式调用视图组件
形如: 
``` html
<vc:priority-list max-priority="2" is-done="false">
</vc:priority-list>
```
`vc` 元素用来调用视图组件，以 Pascal 风格命名的类型和方法将被转换为对应的小写 [kebab case](https://lodash.com/docs#kebabCase) 风格。注意，为了以标签形式使用视图组件，必须使用 `@addTagHelper` 注册包含视图组件的程序集，例如，包含视图组件的程序集名为 `MyWebApp`，那么将以下声明加入 `_ViewImports.cstml` 文件: 
``` html
@addTagHelper *, MyWebApp
```

# 从控制器中调用视图组件
视图组件通常是由视图调用的，但也可以直接从控制器方法中调用它们，控制器方法通过返回一个 `ViewComponentResult` 实例来使用视图组件，例如: 
{%codeblock lang:csharp%}
public IActionResult IndexVC()
{
    return ViewComponent("PriorityList", new { maxPriority = 3, isDone = false });
}
{%endcodeblock%}

关于视图组件用法案例，参考: [Walkthrough: Creating a simple view component](https://docs.microsoft.com/en-us/aspnet/core/mvc/views/view-components?view=aspnetcore-2.1#walkthrough-creating-a-simple-view-component)