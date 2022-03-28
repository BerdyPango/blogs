---
title: Openwrt 实现全局科学上网
date: 2017-01-31 11:27:01
description: 文本记录了利用网件 WNDR 4300 路由器安装 OpenWrt 实现全局科学上网的路径与原理
category: 
- Router
tags:
- linux
- openwrt
reward_settings:
  enable: true
  comment: Donate comment here.
---

## 原理
[Openwrt](https://openwrt.org/) 是一个开源的路由器固件项目，支持市面上大多数主流路由器，Openwrt 除了路由器功能，还允许安装其他由第三方提供的增强功能，其中之一便是 `****socks`。

### ****socks-libev
`****socks-libev` 是一个 `****socks` 协议的轻量级实现，其依赖于 [libev](http://software.schmorp.de/pkg/libev.html)，是 `****socks-android`, `****socks-ios` 以及 `****socks-openwrt` 等客户端的上游项目。

`****socks-libev` 包括服务端和客户端两部分，一共三个模块。
1. ss-server: 服务器端，部署在远程服务器，提供 `****socks` 服务。
2. ss-local: 客户端，提供本地 socks5 协议代理。
3. ss-redir: 客户端，提供本地透明代理，需要与 NAT 配合使用
4. ss-tunnel: 客户端，本地端口转发

具体可参考[「官网地址」](https://github.com/****socks/****socks-libev)。

## 准备一台安装 ****socks-libev 的海外服务器

首先准备一台国外的服务器安装并运行 `****socks` 服务端。
```bash
$ sudo apt-get update
$ sudo apt-get install ****socks-libev
```
> 具体系统安装指南参考 [Github](https://github.com/****socks/****socks-libev)。

上述命令会:
- 安装 `ss-local` `ss-redir` `ss-server` `ss-tunnel` 到 `/usr/bin`
- 新增开机启动脚本至 `/etc/init.d/****socks-libev`
- 配置文件 `/etc/****socks-libev/config.json` (旧版是 `/etc/****socks/config.json`)
- 一些默认启动配置 `/etc/default/****socks-libev` (旧版是 `/etc/default/****socks`)

### 配置服务端
```bash
$ sudo vi /etc/****socks-libev/config.json

{
    "server": "1.0.9.8",
    "server_port": 1098,
    "password": "your-password",
    "method": "aes-256-cfb"        
}
```
必须把 `server 1.0.9.8` 替换为海外服务器的 ip 地址，或改成 0.0.0.0 表示监听本机。

### 修改防火墙设置
```bash
$ sudo ufw allow 1098
```
> 1098 只是举例，配置文件中是哪个端口号，这里就是多少

### 控制 ****socks-libev
```bash
$ sudo service ****socks-libev start
$ sudo service ****socks-libev stop
```

### 查看 ss-server 是否已经启动并且带有 -u 启动参数
```bash
$ ps ax | grep ss-server

/usr/bin/ss-server -c /etc/****socks-libev/config.json -a root -u -f /var/run/****socks-libev/****socks-libev.pid
```
> 其中有 `-u` 选项。如果 `****socks` 客户端启用了 udp relay, 而服务端启动时不带 -u 参数，将无法正常工作。

## 在 OpenWrt 路由器上配置 ****socks-libev 客户端
```bash
$ vi /etc/****socks.json

{
    "server": "1.0.9.8",
    "server_port": 1098,
    "local_port": 7654,
    "password": "killgfw",
    "method": "aes-256-cfb"
}
```
> 配置中几项参数需与服务端配置匹配。客户端的安装请至「[这里](https://sourceforge.net/projects/openwrt-dist/files/****socks-libev/)」

一切就绪后，使用 `ss-local -c /etc/****socks.json` 在路由器测试代理上网。

## 让 OpenWRT 正常安装软件(Optional)

当我们刚给路由器刷上 OpenWRT 后，其只具备基本的上网功能，如果使用 `opkg update` 安装软件时，发现其根本不能 update，因为它连接的 `download.operwrt.org` 本身也在黑名单中(或速度奇慢)。

### 方法1: 为 opkg 配置代理

使用 SSH 远程登录路由器系统，找到 `/etc/opkg.conf` 文件，添加代理选项:
```bash
option http_proxy http://proxy.example.org:8080/
option ftp_proxy ftp://proxy.example.org:2121/

# 使用以下选项进行服务器认证
option proxy_username xxxx
option proxy_password xxxx
```
有时，因为 `busybox` 中 `wget` 的限制，代理服务器的认证可能失败。这时，可以尝试在代理服务器的 URL 中传入用户名和密码：
```bash
option http_proxy http://username:password@proxy.example.org:8080/
option ftp_proxy http://username:password@proxy.example.org:2121/
```
参考官方文档: https://wiki.openwrt.org/zh-cn/doc/techref/opkg

### 方法2: 调整本地 opkg 仓库
参考 https://softwaredownload.gitbooks.io/openwrt-fanqiang/content/ebook/02.15.html

## OpenWrt 上网原理
家庭网络所有流量都会经过路由器，而路由器会解析该条请求域名，至 `/etc/dnsmasq.d` 目录中查询 `accelerated-domains.china.conf` 配置清单，例如: 
```bash
  server=/10010.com/114.114.114.114
  server=/115.com/114.114.114.114
```
如果任何用户访问 10010.com，`dnsmasq` 发现匹配项，则转发至国内域名服务器 114.114.114.114 查询该域名的 ip 地址。同一目录下的 `gfwlist.conf` 中包含:
```bash
server=/#/127.0.0.1#3210
```
`#` 表示通配符，意为匹配所有域名，该文件将匹配的所有域名转发至本地端口 3210。由于 `dnsmasq` 会优先匹配具体规则，如果找不到该规则，则匹配泛化规则。因此，dnsmasq 会首先匹配 `accelerated-domains.china.conf` 上的域名，如果找不到匹配项，则匹配 `gfwlist.conf` 并转发至本地 `3210` 端口进行域名查询，而 `3210` 由本地 ss-tunel 客户端到远程服务器进行域名查询。

### /etc/init.d/****socks 脚本
查看 `/etc/init.d/****socks` 脚本文件可得到:
```bash
START=95

SERVICE_USE_PID=1
SERVICE_WRITE_PID=1
SERVICE_DAEMONIZE=1

start() {
	sed -i 's/114.114.114.114/127.0.0.1#3210/' /etc/dnsmasq.d/gfwlist.conf
	/etc/init.d/dnsmasq restart

	service_start /usr/bin/ss-redir -b 0.0.0.0 -c /etc/****socks.json -f /var/run/****socks.pid
	service_start /usr/bin/ss-tunnel -b 0.0.0.0 -c /etc/****socks.json -l 3210 -L 8.8.8.8:53 -u 
	/usr/bin/****socks-firewall
}

stop() {
	sed -i 's/127.0.0.1#3210/114.114.114.114/' /etc/dnsmasq.d/gfwlist.conf
	/etc/init.d/dnsmasq restart

	service_stop /usr/bin/ss-redir
	service_stop /usr/bin/ss-tunnel
	killall ss-redir
	killall ss-tunnel
	/etc/init.d/firewall restart
}
```
该脚本的大致逻辑为:
- 停止 `****socks` 服务时，将 `dnsmasq` 泛域名匹配的规则改为查询国内 dns 域名的规则，即 `sed -i 's/127.0.0.1#3210/114.114.114.114/' /etc/dnsmasq.d/gfwlist.conf`
- 启动 `****socks` 服务时，如果以前停止过 `****socks` 服务，要把泛域名匹配的解析改成通过`ss-tunnel 3210` 端口转发，`sed -i 's/114.114.114.114/127.0.0.1#3210/' /etc/dnsmasq.d/gfwlist.conf`。同时开启 `3210` 端口，并将收到的请求走 `ss-tunnel` 通道向远程服务器的发送向 `8:8:8:8:53` 查询 dns，即 `service_start /usr/bin/ss-tunnel -b 0.0.0.0 -c /etc/****socks.json -l 3210 -L 8.8.8.8:53 -u`
- `dnsmasq` 只负责域名查询分配转发，查询到 IP 地址后，再通过 `usr/bin/****socks-firewall` 脚本判断是否要通过 `****socks` 加密请求内容。

> 运行 `/etc/init.d/****socks stop` 有时并没有结束 `ss-redir` 或 `ss-tunnel` 进程，即使 `killall` 有时还是不能杀掉进程，这种情况就只能重启路由器了。也就是说，修改了翻墙配置，有时必须重启路由器才能生效。

### /usr/bin/****socks-firewall 脚本
1. 如果请求指向自建 `****socks` 服务器地址，立即返回，不做处理
```bash
#create a new chain named ****socks
iptables -t nat -N ****socks
iptables -t nat -N ****socks_WHITELIST

# Ignore your ****socks server's addresses
# It's very IMPORTANT, just be careful.
iptables -t nat -A ****socks -d 1.0.9.8 -j RETURN    
#iptables -t nat -A ****socks -d 1.0.9.7 -j RETURN
#iptables -t nat -A ****socks -d 1.0.9.6 -j RETURN
```
2. 如果本地发出至局域网的请求，立即返回，不做处理
```bash
# Ignore LANs IP address
iptables -t nat -A ****socks -d 0.0.0.0/8 -j RETURN
iptables -t nat -A ****socks -d 10.0.0.0/8 -j RETURN
iptables -t nat -A ****socks -d 127.0.0.0/8 -j RETURN
iptables -t nat -A ****socks -d 169.254.0.0/16 -j RETURN
iptables -t nat -A ****socks -d 172.16.0.0/12 -j RETURN
iptables -t nat -A ****socks -d 192.168.0.0/16 -j RETURN
iptables -t nat -A ****socks -d 224.0.0.0/4 -j RETURN
iptables -t nat -A ****socks -d 240.0.0.0/4 -j RETURN
```
3. 如果发出到中国的 IP 地址，立即返回，不做处理
```bash
# Ignore China IP address
for white_ip in `cat /etc/chinadns_chnroute.txt`;
do
    iptables -t nat -A ****socks_WHITELIST -d "${white_ip}" -j MARK --set-mark 1
done

# Check whitelist
iptables -t nat -A ****socks -j ****socks_WHITELIST
iptables -t nat -A ****socks -m mark --mark 1 -j RETURN
```
4. 其他全部转发至 `****socks-libev` 本地客户端 `ss-redir` 监听的端口，由 `ss-redir` 负责和服务端进行加密通讯。
```bash
#for hulu.com
iptables -t nat -A ****socks -p tcp --dport 1935 -j REDIRECT --to-ports 7654
iptables -t nat -A ****socks -p udp --dport 1935 -j REDIRECT --to-ports 7654

# for Chrome browser and youtube.com
iptables -t nat -A ****socks -p udp --dport 443 -j REDIRECT --to-ports 7654

# Anything else should be redirected to ****socks's local port
iptables -t nat -A ****socks -p tcp -j REDIRECT --to-ports 7654
# Apply the rules
iptables -t nat -A PREROUTING -p tcp -j ****socks
```
> `iptables -t nat -A ****socks -p tcp -j REDIRECT --to-ports 7654` 这里 7654 必须和 `OpenWrt` 路由器 `/etc/****socks.json` 里的 `local_port` 保持一致
> 
> 首先运行全代理模式，然后再执行白名单。在白名单比较长时冷启动的速度会比较快。

> 中国的 IP 列表较长，如果路由器硬件配置不是太好，可以把 Ignore China IP address 段注释掉，启用 Ignore Asia IP address 段。

### 控制 ****socks 本地客户端
```bash
$ /etc/init.d/dnsmasq restart # 重启 dnsmasq 
$ /etc/init.d/****socks stop
$ /etc/init.d/****socks start
$ /etc/init.d/****socks enable # 设置 ****socks 在 OpenWrt 路由器启动时自动启动
$ /etc/init.d/****socks disable # 取消 ****socks 随机启动
```

## 套用 bbr 拥塞算法
首先查看内核版本:
```bash
$ uname -r

2.6.32-042stab128.2
```
更新至最新版本内核:
```bash
$ sudo apt update
$ sudo apt install --install-recommends linux-generic-hwe-16.04
```
更新内核版本完成后，重启服务器:
```bash
$ sudo reboot
```