---
title: architecture-ddd-in-eshopcontainers-1
tags:
---

## 在 Windows 系统上开发 Docker 应用的闭环流程
{asset_img docker-development-cycle.png Docker 应用内环开发流程}

1. 搭建本地环境
   1. 安装 Docker CE for Windows
   2. 安装 Visual Studio 2017 及其 .NET Core cross-platform development
2. 基于现有 .NET 基础镜像创建 Dockerfile
   1. 每个服务都需要一个 Dockerfile
   2. Dockerfile 应该放在应用程序或服务的根目录中
   3. 多容器应用可包含一个 `docker-compose.yml` 文件
3. 创建自定义 Docker 镜像，在镜像中嵌入应用程序或服务
   1. 单容器应用程序，可执行 `docker build` 命令基于已定义的 `Dockerfile` 来创建镜像
   2. 多容器应用可借助 `docker-compose up-build` 命令基于 `docker-compose.yml` 文件中暴露的元数据来构建相关的镜像
4. 构建多容器 Docker 应用程序时，在 `docker-compose.yml` 文件中定义服务
   1. 在解决方案根目录创建该文件，以下是一个简化版的示例:
   ```yaml
    version: '3'
    services: 
      webmvc:
        image: eshop/web
        environment:
          - CatalogUrl=http://catalog.api
          - OrderingUrl=http://ordering.api
        ports:
          - "80:80"
        depends_on:
          - catalog.api
          - ordering.api
      catalog.api:
        image: eshop/catalog.api
        environment:
          - ConnectionString=Server=sql.data;Port=1433;Database=CatalogDB;…
        ports:
          - "81:80"
        depends_on:
          - postgres.data
      ordering.api:
        image: eshop/ordering.api
        environment:
          - ConnectionString=Server=sql.data;Database=OrderingDb;…
        ports:
          - "82:80"
        extra_hosts:
          - "CESARDLBOOKVHD:10.0.75.1"
        depends_on:
          - sql.data
      sql.data:
        image: mssql-server-linux:latest
        environment:
          - SA_PASSWORD=Pass@word
          - ACCEPT_EULA=Y
        ports:
          - "5433:1433"
   ```
   1. 上述 `docker-compose.yml` 文件范例中定义了 4 个服务: 1 个 `Web MVC` 服务(Web 应用程序)，2 个微服务(ordering.api 和 basket.api)，以及 1 个数据源容器: 基于 SQL Server for Linux 并以容器方式运行的 sql.data。每个服务都将作为一个容器来部署，所以对每个服务来说，必须具备一个Docker 镜像。
   2. 使用基于 Visual Studio 自带的「添加 Docker 支持」功能，会在解决方案目录下生成一个 `docker-compose.dcproj` 文件，并在其下添加一组 .yml 文件，以便于根据具体环境(development or production)和执行类型(debug or release)重写某些值。
5. 生成并运行 Docker 应用程序
   1. 单容器应用可执行 `docker run` 来运行容器
   2. 多容器应用可执行 `docker-compose up` 来运行所有容器
   3. Visual Studio 有一个附加的 F5 调试 Docker 的命令，该选项会运行解决方案级的 `docker-compose.yml` 文件所定义的所有容器，并支持常规断点的调试功能。
6. 用本地 Docker 主机测试 Docker 应用程序






## 集群和编排引擎
- 集群和编排引擎: 如果需要在多个 Docker 主机上横向扩展应用，尤其是大型微服务应用，必须能通过抽象底层平台的复杂性，像一个独立的集群一样管理所有主机。容器集群和编排引擎能帮我们做到这一点。编排引擎主要包括 Azure Service Fabric、Kubernetes、Docker Swarm 和 Mesosophere DC/OS，后面三个开源编排引擎可通过 Azure 容器服务在 Azure 上提供。
- 调度器: 调度意味着管理员可以启动集群容器，因此也需要提供界面。集群调度器有很多职责: 有效地使用集群资源、设置用户提供的约束条件、跨节点或主机有效地均衡容器的负载，以及确保高可用性的强容错能力。

从使用的角度来看，ACS(Azure Container Service) 的目标是通过使用流行的开源工具和技术来提供容器托管环境。为此，它为所选编排引擎暴露了标准 API 接口。通过这些 API，我们可以使用任何能与它通信的软件。例如，对于 Docker Swarm 的 API 可选择 Docker 命令行接口，对于 DC/OS 可选择 DC/OS CLI。

## 设计面向微服务的应用程序(P93)
### 应用规范
应用程序应该由下列类型的组件组成:
- 展示组件。负责处理 UI 和调用远程服务。
- 应用程序业务逻辑。
- 数据库访问逻辑。包括负责访问数据库（SQL或NoSQL）的数据访问组件。
- 应用集成逻辑。包括主要基于消息代理的消息通道。

### 开发团队环境
假设应用程序的开发过程如下:
- 有多个开发团队，专注于应用程序的不同业务领域。
- 新团队成员必须快速成长，应用程序必须易于理解和修改。
- 应用程序将具有长期演进和不断变化的业务规则。
- 需要良好的长期可维护性，这意味着在未来实现新变化时具有敏捷性，同时能在对其他子系统影响最小的前提下更新多个子系统。
- 希望实践应用程序的持续集成和持续部署。
- 在开发应用程序时，希望利用新兴技术（框架，编程语言等）的优势。不想在迁移到新技术时完全迁移应用程序，因为这将导致高成本并影响应用程序的可预测性和稳定性。

### 部署架构
- 应该将应用程序分解为独立的子系统，以协作微服务和容器的形式构建应用程序，其中一个微服务就是一个容器。
- 每个服务（容器）实现一组高内聚的功能。例如，应用程序可能包括目录服务、订单服务、购物篮服务、用户配置文件服务等服务。
- 微服务使用诸如 HTTP（REST）之类的协议通信，但会尽可能地使用异步方式（例如使用AMQP），特别是在利用集成事件传播更新时。
- 微服务开发和部署为彼此独立的容器。这意味着开发团队可以在不影响其他子系统的情况下开发和部署某个微服务。
- 每个微服务有自己的数据库，并与其他微服务完全解耦。必要时，使用应用程序级集成事件（通过逻辑事件总线），如命令查询职责分离（CQRS）实现来自不同微服务的数据库间一致性。因此，业务约束必须包含多个微服务器和相关数据库之间最终的一致性。

{%asset_img eshop-dev-arch.png eShopOnContainers 开发环境架构%}


### 外部与内部架构和设计模式
外部架构是由多个服务组成的微服务架构。然而，根据每个微服务的性质，很可能会使用不同的内部架构（每种都基于不同模式），有时这是更适合的做法。微服务甚至可以使用不同技术和编程语言。下图展示了这种多样性。
{%asset_img outer-and-inner-arch.png 外部与内部架构和设计%}

### 创建简单的数据驱动的 CRUD 微服务
- 在 docker-compose.yml 中定义的环境变量将在 container 启动时载入系统环境变量，可替换 appsettings.json 中对应的键。
- 机密信息可由 [Docker Swarm 加密管理](https://docs.docker.com/engine/swarm/secrets/)



## 使用 docker-compose.yml 定义多容器应用程序
