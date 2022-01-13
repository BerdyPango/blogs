---
title: docker-docker-compose-best-practice
tags:
---


## 从一个简单的 Web Api 容器说起
现有一个简单的 docker-compose.yml 文件:
```yaml
catalog.api:
  image: eshop/catalog.api
  environment:
    - ConnectionString=Server=catalog.data;Initial Catalog=CatalogData;User Id=sa;Password=your@password
  expose:
    - "80"
  ports:
    - "5101:80"
  #extra hosts can be used for standalone SQL Server or services at the dev PC
  extra_hosts:
    - "CESARDLSURFBOOK:10.0.75.1"
  depends_on:
    - sql.data
```
- 有一个名为 `catalog.api` 的服务需要运行
- `expose`: 暴露 80 端口，以便从内部访问 Docker 主机中的 `catalog.api` 服务
- `ports`: 将容器暴露的端口 80 转发到 Docker 主机上的端口 5101
- `depends_on`: 将 `catalog.api` 服务连接到 sql.data 服务。设置此依赖项时，只有 `sql.data` 容器已经启动，才能启动 `catalog.api` 容器。
- `extra_hosts`: 配置为允许访问外部服务器：`extra_hosts` 设置允许我们访问外部服务器或 Docker 主机之外的机器，例如在开发 PC 上的本地 SQL Server 实例。

## 使用 docker-compose 文件面向多种目标环境
`docker-compose.yml` 能够被理解该格式的多种基础架构使用。此例中最直接的工具是 `docker-compose` 命令，但编排引擎(如 Docker Swarm)也能理解这种文件。要让其他编排引擎(Azure Service Fabric、Mesos DC/OS、Kubernetes 等)也能理解这种格式，则需要额外添加对应的设置和元数据。

面向不同环境时，应该使用多个 compose 文件，借此便可根据环境创建多个配置。默认情况下，Compose 会读取两个文件: 一个 `docker-compose.yml` 和一个可选的 `docker-compose.override.yml` 文件。按照惯例，`docker-compose.yml` 包含基本配置和其他静态设置。这意味着服务配置不应根据面向的部署环境而改变。

`docker-compose.override.yml` 则可根据面向的部署环境重写基本配置的配置设置，例如:
{%asset_img docker-compose-override.png 面向不同部署环境的 docker-compose-override 文件%}
通常来说，`docker-compose.override.yml` 将用于开发环境，运行 `docker-compose up` 时，可添加 `-f` 选项来指定 `docker-compose.yml` 文件，以下代码展示了这种方式:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```
该命令将自动读取重写，效果等同于这两个文件合并。

### 在 docker-compose 文件中使用环境变量
可以通过 `${my_var}` 引用环境变量，例如，假设 `docker-compose.prod.yml` 定义了如下内容:
```
IdentityUrl=http://${ESHOP_PROD_EXTERNAL_DNS_NAME_OR_IP}:5105
```
`docker-compose` 支持使用 `.env` 文件创建这些环境变量的默认值。将 `.env` 文件放在执行 `docker-compose` 命令相同的文件夹中即可。以下是一个 `.env` 的例子:
```bash
# .env file
ESHOP_EXTERNAL_DNS_NAME_OR_IP=localhost
ESHOP_PROD_EXTERNAL_DNS_NAME_OR_IP=10.121.122.92
```
`docker-compose` 要求 `.env` 文件中每行的格式为 `<variable>=<value>`。

> 运行时环境中设置的值将始终重写 `.env` 文件中定义的值。同样，通过命令行参数传递的值也将重写 `.env` 文件中设置的默认值。