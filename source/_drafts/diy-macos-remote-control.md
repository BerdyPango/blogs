---
title: DIY - 在 Windows 环境下远程控制 MacOS
date: 2015-06-30 19:51:53
categories: MacOS
tags: 
- make-the-best-of-my-macmini 
- diy
- ssh
---

为了把闲置已久的 Mac mini 变成一个可在 Windows 环境下远程操作的小型私有服务器，需要现实至少以下两点目标：
 - 使用 `ssh` 客户端远程登录，类似通过 PuTTy 管理其他类 Linux 系统
 - 使用 `sftp`客户端实现文件传输的需求

同时，要确保 MacOS 主机与客户端主机在网络上是互通的，要么在同一局域网下通过 ip 地址访问，要么使用域名映射固定 ip 地址。

<!-- more -->

准备工作
===

MacOS 自带了 `ssh`，但默认是禁用的，通常我们进行以下步骤的确认：

``` bash
$sudo systemsetup -getremotelogin
Remote Login: Off
```
该命令查询本地计算机远程登录功能是否启用，如果显示 Off，则执行以下命令开启：
``` bash
$sudo systemsetup -setremotelogin on
```
再次执行查询命令以确认上一条命令生效并且该功能启用：
``` bash
$sudo systemsetup -getremotelogin
Remote Login: On
```

> `$sudo systemsetup -getremotelogin` 将同时启用 `ssh` 以及 `sftp server`

在这些命令前加上 `sudo` 是必须的，因为这些操作均要求管理员权限。

在 Windows 下远程操作 MacOS
===
现在，在 Windows 系统下使用 bash 或 PuTTy 客户端，连接到该 Mac 所在的 ip 地址：
``` bash
ssh username@ipaddress
```
登录完成后便与在 MacOS 本机上使用该账号操作 `terminal` 一样了。

> 远程登录同时开启了 `sftp` 服务，这意味着如果使用类似 `winscp` 之类的文件传输客户端也可以连接 MacOS 并完成文件传输。

为远程登录添加安全访问机制
===
`ssh` 针对不同 group 的用户提供了不同的远程访问策略，使用密码登录是一件非常不安全的，如果该 MacOS 主机在通过内网穿透或拥有公网 ip 暴露在互联网下，那么随时有遭受攻击的可能，为了加强安全性，我们可以：
- 禁止使用密码验证登录
- 开启 `ssh key pair` 验证登录

确保我们已经进行远程登录后，首先导航到 `ssh` 配置所在的目录：
``` bash
cd /etc/ssh/
```
列出文件列表：
``` bash
ls -ll
```
使用 [vim](https://github.com/vim/vim) 编辑器打开 `sshd_config` 文件：
``` bash
vi sshd_config
```
按下 'i' 使 `vim` 进入 `insert` 模式
找到 `#PasswordAuthentication yes` 一行，删除行头的 '#' 字符，并将 'yes' 改为 'no'
> '#' 表示对该行进行注释

找到 `#PubKeyAuthentication yes` 一行，删除行头的 '#' 字符，按下 'esc' 键退出 'insert' 模式，按下 ':wq' 以保存并退出 `vim` 编辑器。
> 若要修改生效， `sshd` 进程需要重新读取该配置，但这会让已经通过密码登录的会话中断，并且在 public key 部署前没有任何机会重新进行远程连接，所以这一步放到最后来做。

现在，复制先准备好的 `ssh public key` 的值，回到登录用户的主目录并导航到 `.ssh` 目录下：
``` bash
cd #
cd .ssh
```
新建 `authorized_keys` 文件并使用 `vim` 编辑器编辑：
``` bash
touch authorized_keys
$sudo vi authorized_keys
```
粘贴已经复制到剪贴板中的 `ssh public key` 的值，':wq' 保存并退出。
> 在前文提及的 `/etc/ssh/sshd_config` 中有一行 `AuthorizedKeyFiles`，该行的默认值为 `.ssh/authorized_keys`，该项配置是 `sshd` 进程提取 `public key` 的依据，如果对该值进行了修改，那么这里新建的文件也必须要与之对应。

现在，重新读取 sshd 的配置文件信息
``` bash
$sudo launchctl load -w /System/Library/LaunchDaemons/ssh.plist
```