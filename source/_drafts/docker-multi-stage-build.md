---
title: 在 Dockerfile 中使用多阶段生成(Multi-Stage Builds)
date: 2018-02-15 20:57:58
description: 本文介绍了如何在 Dockerfile 中使用多阶段生成
category:
- Docker
tags:
- ops
- docker
- docker-multi-stage-build
---

Docker 17.05 以上版本开始支持 multi-stage builds，该功能帮助试图优化 Dockerfile 的开发人员将这些文件保持得易读且干净。

## 在 Multi-Stage Builds 之前
生成 Image 的最大的挑战之一便是将其保持在一个合理的大小。Dockerfile 中的每一条指令都向 Image 添加一「层」，在继续下一条指令之前，开发人员需要首先清除掉那些不必要的内容。为了编写一个高效的 Dockerfile，传统的办法是加入 shell 脚本及其他逻辑来确保每一「层」都仅包含其所需的内容。

过去，维护两个 Dockerfile 非常常见，一个用于开发和调试，另一个用于生产环境，但这种方案并不完美，以下是一个例子，分别以 `Dockerfile.build` 和 `Dockerfile` 命名:
```bash Dockerfile.build
FROM golang:1.7.3
WORKDIR /go/src/github.com/alexellis/href-counter/
COPY app.go .
RUN go get -d -v golang.org/x/net/html \
  && CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .
```
`RUN` 指令中有意将两个命令通过 `&&` 合并在同一行，这是为了防止在 Image 中创建额外的「层」，但这非常不易维护，很容易忘记在插入新行时指定 `\` 字符。
```bash Dockerfile
FROM alpine:latest  
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY app .
CMD ["./app"]  
```
```bash build.sh
#!/bin/sh
echo Building alexellis2/href-counter:build

docker build --build-arg https_proxy=$https_proxy --build-arg http_proxy=$http_proxy \  
    -t alexellis2/href-counter:build . -f Dockerfile.build

docker container create --name extract alexellis2/href-counter:build  
docker container cp extract:/go/src/github.com/alexellis/href-counter/app ./app  
docker container rm -f extract

echo Building alexellis2/href-counter:latest

docker build --no-cache -t alexellis2/href-counter:latest .
rm ./app
```
当执行 `build.sh` 时，首先需要生成第一个 Image，从该 Image 创建一个 Container，然后将所需内容拷贝出来，再创建第二个 Image。两个 Image 都会占用系统空间。

Multi-stage builds 极大简化了该解决方案

## 使用 Multi-Stage Builds
通过 multi-stage builds，可在 Dockerfile 中多次使用 `FROM` 指令，每个 `FROM` 都可基于不同的 Image，且每个都会开启生成流程中的新阶段(Stage)。可以在各个阶段之间拷贝内容，或是在生成最终 Image 时将所有不需要的内容丢弃，现在将上述例子改造:
```bash Dockerfile
FROM golang:1.7.3
WORKDIR /go/src/github.com/alexellis/href-counter/
RUN go get -d -v golang.org/x/net/html  
COPY app.go .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .

FROM alpine:latest  
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=0 /go/src/github.com/alexellis/href-counter/app .
CMD ["./app"]  
```
仅仅需要一个 Dockerfile，也不需要额外的生成脚本，直接执行 `docker build`。

```bash
$ docker build -t alexellis2/href-counter:latest .
```
结果与之前一样，省去了大量的中间环节。第二个 `FROM` 指令开启新的生成阶段并将 `alpine:latest` 作为其基础 Image，`COPY --from=0` 将前一阶段的生成内容拷贝到新的阶段，而 Go SDK 和其他所有中间内容都被丢弃。

## 给生成阶段命名
默认情况下，生成阶段不会被命名，仅使用整数值来引用它们，生成阶段从 `0` 开始计数。第一个 `FROM` 指令为 0，以后递增。更好的办法是对不同的生成阶段进行命名，通过为 `FROM` 指令添加 `as <NAME>` 为阶段命名，以下例子在前一个例子的基础上使用阶段命名和在 `COPY` 指令中对阶段以命名进行引用优化了可读性，这意味着即使未来 Dockerfile 调整了各个阶段的顺序，那么 `COPY` 也不会失效。
```bash
FROM golang:1.7.3 as builder
WORKDIR /go/src/github.com/alexellis/href-counter/
RUN go get -d -v golang.org/x/net/html  
COPY app.go    .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .

FROM alpine:latest  
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /go/src/github.com/alexellis/href-counter/app .
CMD ["./app"]  
```

## 在特定的生成阶段中止
当生成 Image 时，不需要对 Dockerfile 定义的每个阶段都进行生成，可以指定一个目标生成阶段以中止后续阶段的生成。以下命令展示了如何在名为 `builder` 的生成阶段中止生成:
```bash
$ docker build --target builder -t alexellis2/href-counter:latest .
```
该功能在一些特定场景下非常有用:
- 调试一个特定的生成阶段
- 定义了一个包含所有调试工具的调试阶段和一个干净的生产环境阶段
- 定义了一个包含测试数据的测试阶段，而生产环境阶段使用真实数据

## 将外部 Image 用作生成阶段
当使用 multi-stage builds 时，将不会将复制内容局限在定义在 Dockerfile 中的前序生成阶段，也可以用 `COPY --from` 复制来自一个外部 Image 的内容，Docker 客户端将拉取该 Image 并赋值其内容:
```bash
COPY --from=nginx:latest /etc/nginx/nginx.conf /nginx.conf
```

## 最佳实践

### 创建尽可能小的 Container
这意味着 Dockerfile 定义的 Image 应该尽可能的轻量，能够随时停止和销毁，并能够以最小配置信息被重建出来。

### 排除 .dockerignore 
使用 `.dockerignore` 文件来排除与生成不相关的文件，该文件支持与 `.gitignore` 文件相同的模式匹配。详情可参考 [.dockerignore 文件](https://docs.docker.com/engine/reference/builder/#dockerignore-file)。

### 使用 multi-stage builds
Docker 17.05 以上版本支持 [Multi-stage builds](https://docs.docker.com/develop/develop-images/multistage-build/)，该功能使得最终生成的 Image 大小可显著降低，无需再手动删除所有的中间层和多余文件，由于 Image 是由生成流程的最后阶段生成的，可以利用[生成缓存](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#leverage-build-cache)来最小化 Image 的大小。

例如，如果 Dockerfile 定义了很多「层」，可按照拟修改频率调整它们的顺序，修改频率可能性最低的「层」应排在前面，而修改频率可能性较大的「层」放在后面:
 - 安装必须的工具
 - 安装或更新依赖库
 - 生成应用程序

一个 Go 程序的 Dockerfile 可能看上去如下:
```bash
FROM golang:1.9.2-alpine3.6 AS build

# Install tools required for project
# Run `docker build --no-cache .` to update dependencies
RUN apk add --no-cache git
RUN go get github.com/golang/dep/cmd/dep

# List project dependencies with Gopkg.toml and Gopkg.lock
# These layers are only re-built when Gopkg files are updated
COPY Gopkg.lock Gopkg.toml /go/src/project/
WORKDIR /go/src/project/
# Install library dependencies
RUN dep ensure -vendor-only

# Copy the entire project and build it
# This layer is rebuilt when a file changes in the project directory
COPY . /go/src/project/
RUN go build -o /bin/project

# This results in a single layer image
FROM scratch
COPY --from=build /bin/project /bin/project
ENTRYPOINT ["/bin/project"]
CMD ["--help"]
```

### 最小化「层」的数量
- 在 Docker 1.10 及更高版本中，只有 `RUN`，`COPY`，`ADD` 指令会创建「层」，其他指令只会创建临时 Image 且不会直接增加生成的大小。
- 在 Docker 17.05 及更高版本中，可使用 multi-stage-builds 并仅将生成最终 Image 所需的内容取出。这样，调试和编译的工具仅作为中间生成环节存在而不会增大最终 Image 的大小。

Dockerfile 指令可参考: [Dockerfile Instructions](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#dockerfile-instructions)
