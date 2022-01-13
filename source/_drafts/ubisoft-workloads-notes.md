---
title: Working in Ubi
date: 2019-10-29 16:21:58
description: 
category:
- Work
tags:
- Notes
---


## Setup Jenkins on local machine
Make sure the following features are enabled:
- JRE8 is installed
- Virtualization is enabled
- Docker CE is installed

```bash
$ docker run --name myjenkins -p 8080:8080 -p 50000:50000 -v /C/Users/jxhe/.jenkins:/var/jenkins_home jenkins
docker run \
  -u root \
  --rm \
  --name jenkins \
  -d \
  -p 8090:8080 \
  -p 50000:50000 \
  -v /c:/Users/jxhe/jenkins_home:/var/jenkins_home \
  jenkinsci/blueocean
```

## UIRouter

`oneClaim` 用 `$rootScope.getUserInfo().role` 来检查是否包含某个 `claim`.
`TableDirective` 中的  `FreeTextFilter` 使用基类 `filterBase` 中定义的 `triggerFilterDebounce` 来调用基类中的 `triggerFilter` 方法使筛选生效