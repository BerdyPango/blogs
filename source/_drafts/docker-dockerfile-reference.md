---
title: Dockerfile 主要指令部分参考
date: 2018-12-29 11:22:41
description:
category:
tags:
---

文本参考:
- [Dockerfile reference](https://docs.docker.com/engine/reference/builder/#usage)

Docker 通过读取 `Dockerfile` 中定义的指令自定生成镜像，`Dockerfile` 是一个包含了一系列可执行的指令以生成镜像的文本文件。通过执行 `docker build`，用户可发起一个自动生成镜像的流程。

`docker build` 从一个 `Dockerfile` 文件和一个 `context` 生成镜像。`context` 指由 `PATH` 或 `URL` 指令指定的一系列文件。`PATH` 指令指向本地主机的某个物理目录的路径，`URL` 指令指向一个 Git 仓库的位置。

`context` 将递归包含 `PATH` 下的子目录或 `URL` 的子模块(submodules)，以下示例展示了一个将当前目录作为 `context` 进行生成的命令:
```bash
$ docker build
Sending build context to Docker daemon  6.51 MB
...
```

Build 由 Docker 守护进程执行。build 流程做的第一件事就是将整个 `context` 发送给守护进程。大多数情况下的实践为，新建一个空的目录并将 `Dockerfile` 文件及其他与生成镜像相关的文件放置在该目录下。

可在 `context` 目录中创建 `.dockerignore` 文件来排除不想要发送的文件或目录。

Docker 守护进程在开始 build 之前会检查 `Dockerfile` 的语法错误，如果验证失败，将中止 build 流程并抛出错误信息。

Docker 守护进程会逐行执行定义在 `Dockerfile` 中的指令，并在必要的时候将上一个指令的执行结果提交到一个新的中间镜像中，Docker 守护进程最终会清理 `context` 目录。值得注意的是，每一条指令都是独立执行的，这意味着类似 `RUN cd /tmp` 将不会对下一条指令的上下文产生任何影响。

## Dockerfile 格式
`Dockerfile` 的标准格式为:
```bash
# Comment
INSTRUCTION arguments
```
指令本身是大小写不敏感的，但为了更好的与它们的参数区分开，约定对指令使用全大写。以 `#` 开头的行将被视为注释，除非该行是一个有效的**转换**指令，有关转换指令可参考 [Parser directives](https://docs.docker.com/engine/reference/builder/#parser-directives)。

## 环境变量
在 `Dockerfile` 中以 `ENV` 语法声明的都是环境变量，在 `Dockerfile` 的其他指令行以 `${env_variable_name}` 引用环境变量。环境变量语法支持标准的 `bash` 修饰符:
- `${variable:-word}`: 表明如果未指定环境变量值，则以 `word` 作为值，如果指定了环境变量值，则以环境变量作为值。
- `${variable:+word}`: 表明如果环境变量被设置了值，则以 `word` 作为值，如果环境变量没有设置值，则以空字符串作为值。

其中 `word` 只是举例，它可以是任何值或其他环境变量。在环境变量前添加转义符形为 `\${foo}`。

## FROM 指令
Docker 按顺序执行 `Dockerfile` 中定义的指令，其第一行指令**必须**为 `FROM` 指令。
```bash
FROM <image> [AS <name>]

FROM <image>[:<tag>] [AS <name>]

FROM <image>[@<digest>] [AS <name>]
```
`FROM` 指令初始化一个新的生成 `stage` 并为后续指令设置基镜像。

- `FROM` 指令之前只能插入一个或多个 `ARG` 指令，该指令用于声明将要在 `FROM` 指令中使用的参数。
- `FROM` 指令在单个 `Dockerfile` 中可出现多次以创建多个镜像或将一个生成 `stage` 用作另一个生成 `stage` 的依赖。`FROM` 指令将清楚所有前序指令保存的状态。
- 为 `FROM` 指令指定 `AS name` 可为新的生成 `stage` 定义名称，**该名称可由后续的 `FROM` 和 `COPY --from<name|index>` 指令引用**。
- `tag` 或 `digest` 都是可选的，如果忽略其中任何一个，生成器将 `latest` 作为 `tag` 的缺省值。

### ARG 和 FROM 的交互
`FROM` 仅支持定义在其之前的来自 `ARG` 的变量值，如:
```bash
ARG  CODE_VERSION=latest
FROM base:${CODE_VERSION}
CMD  /code/run-app

FROM extras:${CODE_VERSION}
CMD  /code/run-extras
```
定义在 `FROM` 指令之前的 `ARG` 声明不属于任何生成 `stage`，因为它的值不能由任何 `FROM` 指令之后的指令引用。如果的确需要使用该 `ARG` 定义的值，可在一个生成 `stage` 中使用 `ARG` 指令而不赋值:
```bash
ARG VERSION=latest
FROM busybox:$VERSION
ARG VERSION
RUN echo $VERSION > image_version
```

## RUN 指令
`RUN` 指令有两种形式:

- `RUN <command>`: shell 形式，命令在 shell 中执行，Linux 的默认 shell 环境为 `/bin/sh -c`，Windows 的默认 shell 环境为 `cmd /S /C`
- `RUN ["executable", "param1", "param2"]`: (exec 形式)

`RUN` 指令将**基于当前镜像在新的「层」中执行命令并提交结果**，得到的新镜像将用于 `Dockerfile` 中的下一条指令。分层化 `RUN` 指令和生成提交保证了 Docker 的核心概念——提交很 cheap，任何 container 都可基于这些提交创建，很像版本管理。


## WORKDIR 指令
```bash
WORKDIR /path/to/workdir
```
`WORKDIR` 指令为其后续的 `RUN`，`CMD`，`ENTRYPOINT`，`COPY`，`ADD` 指令设置工作目录。

- 如果指定的 `WORKDIR` 目录不存在，将自动创建。
- `WORKDIR` 可在一个 `Dockerfile` 中指定多次，如果指定相对路径，其将以前一个 `WORKDIR` 指定的路径作为基准值，例如:
  ```bash
  WORKDIR /a
  WORKDIR b
  WORKDIR c
  RUN pwd

  # `pwd` 命令的最终输出目录为 `/a/b/c`
  ```
- `WORKDIR` 可解析之前由 `ENV` 指令显式声明的环境变量，例如:
  ```bash
  ENV DIRPATH /path
  WORKDIR $DIRPATH/$DIRNAME
  RUN pwd

  # `pwd` 命令的最终输出目录为 `/path/$DIRNAME`
  ```

## COPY 指令
```bash
COPY [--chown=<user>:<group>] <src>... <dest>

COPY [--chown=<user>:<group>] ["<src>",... "<dest>"]
```
`COPY` 指令从 `<src>` 将文件或目录拷贝至 `container` 文件系统的 `<dest>` 目录。

可指定多个 `<src>` 目录，该目录是基于 `context` 的相对路径。
`<dest>` 是一个绝对路径或相对于 `WORKDIR` 的相对路径。

以下是 `COPY` 指令举例:
```bash
COPY test relativeDir/   # adds "test" to `WORKDIR`/relativeDir/
COPY test /absoluteDir/  # adds "test" to /absoluteDir/
```
所有被拷贝的目录和文件都被默认指定 UID 和 GID = 0，除非指定了 `--chown` 选项，例如:
```bash
COPY --chown=55:mygroup files* /somedir/
COPY --chown=bin files* /somedir/
COPY --chown=1 files* /somedir/
COPY --chown=10:11 files* /somedir/
```
`COPY` 指令可可选接收 `--from<name|index>` 选项，该选项将以该 `FROM .. AS <name>` 的生成 `stage` 作为源位置而忽略 `context`。

`COPY` 指令遵循以下规则:
- `<src>` 必须位于 `context` 中，不能随意 `COPY ../something /something`。
- 如果 `<src>` 是一个目录，该目录下所有的内容将被拷贝，但目录本身不会被拷贝。