---
title: Dockerfile 最佳实践
date: 2018-02-13 20:01:49
description: 本文介绍了定义 Dockerfile 的注意事项
category:
- Docker
tags:
- ops
- docker
- dockerfile
---

参考资料:
- [Dockerfile Instructions](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#dockerfile-instructions)
- [Docker RUN vs CMD vs ENTRYPOINT](http://goinbigdata.com/docker-run-vs-cmd-vs-entrypoint/)
- [Building Minimal Docker Containers for Python Applications](https://blog.realkinetic.com/building-minimal-docker-containers-for-python-applications-37d0272c52f3)

## Docker Image 和 层
创建一个 Image 由 Dockerfile 中的一系列指令组成，这些指令从现有 Image 或 OS 之上添加「层」，OS 是每个 Image 的起始点，于其上添加「层」来创建新的 Image。每一「层」参考前一层针对上下文进行修改，就像一个洋葱，OS 位于最内层。考虑以下 Dockerfile:
```bash
FROM ubuntu:15.04
COPY . /app
RUN make /app
CMD python /app/app.py
```
每一行指令都创建一层:
- `FROM`: 创建一层从 `ubuntu:15.04` 的 Docker Image
- `COPY`: 从 Docker 客户端的当前目录添加文件
- `RUN`: 调用 `make` 生成应用程序
- `CMD`: 指示 Container 应该执行什么命令

当运行 Container 时，实际上是在所有「层」之上添加了一个可写「层」，针对运行 `Container` 的所有改变，如写入新文件，修改现有文件或删除文件，都在该「层」中进行

## 理解生成 Context
当执行 `docker build` 命令时，当前的工作目录被称为 _build context_。命令行工具默认情况下会假设 `Dockerfile` 位于此目录下，但也可通过 `-f` 选项来指定文件路径。

## RUN，CMD 和 ENTRYPOINT 的区别
### Shell 形式
Shell 形式通常为 `<instruction> <command>`，例如:
```bash
RUN apt-get install python3
CMD echo "Hello world"
ENTRYPOINT echo "Hello world"
```
三个指令都可以写为 Shell 形式，当指令以 Shell 形式执行时，实际上指令是以 `/bin.sh -c <command>` 进行调用的，如果 Dockerfile 中存在如下指令:
```bash
ENV name John Dow
ENTRYPOINT echo "Hello, $name"
```
那么执行 `docker run -it <image>` 将得到:
```bash
Hello, John Dow
```
可以看到，变量在执行时得到了解析
### EXEC 形式
EXEC 形式是 `CMD` 和 `ENTRYPOINT` 指令推荐的形式，该形式以字符串数组的来传递命令行的每一个 Arg，其形如:
```bash
<instruction> ["executable", "param1", "param2"]

RUN ["apt-get", "install", "python3"]
CMD ["/bin/echo", "Hello world"]
ENTRYPOINT ["/bin/echo", "Hello world"]
```
指令以这种方式执行时，将绕过 shell 环境直接调用可执行程序，如果在 Dockerfile 中定义如下指令:
```bash
ENV name John Dow
ENTRYPOINT ["/bin/echo", "Hello, $name"]
```
那么执行 `docker run -it <image>` 将得到:
```bash
Hello, $name
```
此处变量没有被解析，如果希望得到跟前一个例子相同的结果，那么需要在 ENTRYPOINT 中制定 shell 环境的可执行程序:
```bash
ENV name John Dow
ENTRYPOINT ["/bin/bash", "-c", "echo Hello, $name"]

Hello John Dow
```

### RUN
`RUN` 指令在当前 Image 之上执行命令并创建一个新的「层」，创建新的 Image，并加入 `RUN` 指令的执行结果。`RUN` 指令可用 Shell 或 EXEC 形式书写，通常用来安装依赖库，如:
```bash
RUN apt-get update && apt-get install -y \
  bzr \
  cvs \
  git \
  mercurial \
  subversion
```
### CMD
CMD 指令用来指定一个缺省指令，仅当 Docker Container 未指定任何命令时起作用。如:
```bash
CMD echo "Hello world" 
$ docker run -it <image>
Hello world
```
如果执行 `docker run -it <image> /bin/bash`，那么 CMD 将被忽略，并得到:
```bash
root@7de4bed89922:/#
```
### ENTRYPOINT
`ENTRYPOINT` 用于配置将 Container 以可执行程序的方式执行，该指令与 `CMD` 很相似，区别在于 `ENTRYPOINT` 指令不会被忽略。`ENTRYPOINT` 有两种形式: Shell 和 EXEC 形式。选择不同的形式将导致不一样的结果。
#### EXEC 形式
该形式允许 `ENTRYPOINT` 指令通过 `CMD` 指令接收候补参数，例如:
```bash
ENTRYPOINT ["/bin/echo", "Hello"]
CMD ["world"]
# 当 docker run -it <image> 时得到
Hello world
# 但当 docker run -it <image> John 时得到
Hello John
```
#### Shell 形式
以此形式书写时，`ENTRYPOINT` 将忽略来自 `CMD` 和 `docker run` 命令行的命令。

### 通用指南
- 使用 `RUN` 指令在初始 Image 上添加新的「层」来生成最终的 Image。
- 通过 `CMD` 指令来指定缺省命令
- 通过 `ENTRYPOINT` 和 `CMD` 来创建可执行程序的 Image 并提供一个可被覆盖的初始命令。


如果 Dockerfile 定义了多个 CMD 指令，只有最后一个会生效。CMD 有三种形式:
- `CMD ["executable", "param1", "param2"]`: EXEC 形式，推荐
- `CMD ["param1", "param2"]`: 作为 ENTRYPOINT 的候补命令参数
- `CMD command param1 param2`: Shell 形式