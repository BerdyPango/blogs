---
title: To-Add Posts Lists
date: 2018-03-07 15:23:18
categories: Archietecture
tags: 
---

- Asp.net core 框架揭秘
    - ASP.NET Core Docker Support
    - dapper
    - .net core ef
- WPF 问题总结
- 消息队列和同步机制
    - RabbitMQ
- 数据库索引原理
- Ionic 开发
- 重构
- CLR via C# 多线程编程
- 洋葱架构
- google ai
- Saga
- Linux
    - symlink and hardlink
    - Jetkins 持续集成
- Python
    - install package only in a specific package.
- 内网穿透 DDNS


What I did to unity the whole wechat staff:
- LeapVR.Web.Grpc.Shell.Server -> config.json
    - Change all wechat configuration to productive public account configuration
    - Change 'NotifyHost' to the domain pointing to our general wechat service.
    - Change the 'StationQrLoginUrl' with '/dev'
    - Change the 'NotifyUrl' with '/dev'
- LeapVR.Web.RestApi.Management -> appsettings.json
    - Change 'BindWeChatWithdrawAccountRedirectUrl' from '.../api/withdraw/accounts/wechat/bind' to '.../withdraw-accounts/wechat/bind'
- LeapVR.Web.Site.Wechat -> appsettings.json
    - Append new config entry 'PathBase' to 'GeneralConfiguration' with environment value
    - Change all wechat related configuration to the productive configuration
    - Add 'ConnectionString' entry.
