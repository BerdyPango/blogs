---
title: ASP.NET Core 框架基础 - 服务注册
date: 2016-06-07 20:35:31
description: 采用依赖注入的服务均由某个 ServiceProvider 实例提供，但是 ASP.NET Core 管道涉及两个不同的 ServiceProvider，其中一个是在管道成功构建后创建并绑定到 WebHost 上的 ServiceProvider；另一个 ServiceProvider 则是在管道处理每个请求时即时创建的，绑定到表示当前请求的上下文上，两个 ServiceProvider 是父子关系。
category:
- Web
- ASP.NET Core

tags: asp.net core
---

ASP.NET Core 的依赖注入框架仅仅涉及 `ServiceCollection` 和 `ServiceProvider` 这两个核心对象。我们预先将服务描述信息注册到 `ServiceCollection` 之上，然后利用 `ServiceCollection` 来创建 `ServiceProvider`，并最终利用它获取指定服务类型的实例。

# WebHost 的 ServiceProvider
下图揭示了 WebHostBuilder 创建 WebHost，以及 WebHost 在启动过程针对依赖注入这两个核心对象的使用:
{%asset_img di_01.png WebHost 创建过程中的依赖注入%}
ASP.NET Core 管道在构建过程中会使用同一个 `ServiceCollection`，所有注册的服务都被添加到这个对象上。这个 `ServiceCollection` 对象最初由 `WebHostBuilder` 创建。在 WebHost 的创建过程中， WebHostBuilder 需要向这个 ServiceCollection 对象注册两种类型的服务：一种是确保管道能够被成功构建并顺利处理请求所必需的服务，我们不妨将它们称为系统服务；另一种则是用户通过调用ConfigureServices方法自行注册的服务，我们姑且称它们为用户服务。