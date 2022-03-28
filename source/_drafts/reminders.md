---
title: Reminders
date: 2017-03-31 23:09:17
description:
categories:
tags:
---

## 在 Raspbian 上安装 HomeAssistant Docker Image

```bash
version: '3'
services:
  homeassistant:
    container_name: home-assistant
    image: homeassistant/raspberrypi3-homeassistant:stable
    volumes:
      - /home/pi/home-assistant/my-homeassistant-configs:/config
    environment:
      - TZ=Asia/Shanghai
    restart: always
    network_mode: host

```

## ACME 开源项目获取和更新 SSL 证书

下载 acme，目前由 rpi4b01 执行:

```bash
$ curl https://get.acme.sh | sh
```

编辑 `account.conf` 填入阿里云 DNS API Access Key:

```bash
export Ali_Key="LTAIW606RoKrwBPP"
export Ali_Secret="XXXXXXXXXXXX"
```

申请证书，并设置自动更新钩子，参考 https://deepzz.com/post/acmesh-letsencrypt-cert-auto-renew.html

```bash
acme.sh --issue --dns dns_ali -d *.frosthe.net -k ec-256 \
    --renew-hook "acme.sh --install-cert -d *.frosthe.net --ecc \
    --key-file       /home/pi/.ssl-certs/*.frosthe.net/key.pem \
    --fullchain-file /home/pi/.ssl-certs/*.frosthe.net/cert.pem \
    --reloadcmd      \"sudo systemctl reload nginx\""
```

至此，证书申请成功，证书颁发成功后，需要手动执行第一次安装

```bash
acme.sh --install-cert -d *.frosthe.net --ecc \
--key-file       /home/pi/.ssl-certs/*.frosthe.net/key.pem  \
--fullchain-file /home/pi/.ssl-certs/*.frosthe.net/cert.pem \
--reloadcmd      "sudo systemctl reload nginx"
```

之后，设置更新通知

## seafile docker 命令(已不可用)

docker run -d --name seafile \
-e SEAFILE_SERVER_HOSTNAME=cloud.frosthe.net \
-e SEAFILE_ADMIN_EMAIL=1035366983@qq.com \
-e SEAFILE_ADMIN_PASSWORD=Hejiaxun900419 \
-v /mnt/sda1/seafile:/shared \
-p 8000:80 \
-p 8443:443 \
seafileltd/seafile:pi

## Shadowsocks Server

```bash
docker pull shadowsocks/shadowsocks-libev
docker run --name ss-server -e PASSWORD=XXXXXXXX -e METHOD=aes-256-cfb -p 443:8388 -p 443:8388/udp -d shadowsocks/shadowsocks-libev
```

## Shadowsocks proxy on raspbian

### Clone shadowsocks pypi from master branch

```bash
$ git clone https://github.com/shadowsocks/shadowsocks.git shadowsocks-master
$ cd shadowsocks-master
$ git checkout master
$ python setup.py install

$ nano /etc/shadowsocks.json

{
"server": "c6s1.jamjams.net",
"server_port": 6909,
"local_address": "0.0.0.0", // allows any ip address to access
"local_port": 1080,
"password": "tcA7VbQouj",
"timeout": 600,
"method": "aes-256-gcm"
}

$ sudo sslocal -c /etc/shadowsocks.json -d start

```

### Convert Shadowsocks to HTTP proxy

```bash
$ apt-get install polipo
$ service polipo stop
$ sudo nano /etc/polipo/config

// the upstream socks5 servier
socksParentProxy = "127.0.0.1:1080"
socksProxyType = socks5

proxyAddress = "0.0.0.0"
proxyPort = 3128
allowedClients = 127.0.0.1,192.168.1.0/24

$ sudo systemctl restart polipo
```

### Configure auto start

```bash
$ sudo nano /etc/rc.local

fi
sslocal -c /etc/shadowsocks.json -d start
exit 0
```

## Shadowsocks Client on Raspbian

```bash
$ sudo apt-get install shadowsocks-libev
$ sudo nano /etc/shadowsocks-libev/config.json

{
    "server":"c6s3.jamjams.net",
    "server_port":31733,
    "local_address":"0.0.0.0", # allow other machaines to access the client
    "local_port":1080,
    "password":"tcA7VbQouj",
    "timeout":60,
    "method":"aes-256-cfb"
}

```

## 在 Raspbian 系统上连接 Xbox One Wireless Controller

```bash
$ sudo apt-get update
$ sudo apt-get upgrade
# 安装 xbox driver
$ sudo apt-get install xboxdrv
$ sudo bash -c 'echo 1 > /sys/module/bluetooth/parameters/disable_ertm'
```


## Install Chinses font

```bash
$ sudo apt-get install xfonts-wqy
$ sudo apt-get install ttf-wqy-zenhei
```

## 电信光猫

友华 PT632 超级管理员密码:

```bash
username="telecomadmin"
web_passwd="XjbAwQrs"
```

上网用户名/密码:

```bash
USERNAME="CD0283382330583"
PASSWORD="12345678"
```

## WNDR4300 OpenWrt 连接 USB3.0 外置硬盘并启用 SAMBA

### 安装 USB 3.0 驱动

```bash
$ opkg update
$ opkg install kmod-usb-core
$ opkg install kmod-usb-storage

# install usb 3.0 drivers
$ opkg install kmod-usb3
$ insmod xhci-hcd

# install support for UASP aka USB Attached SCSI (supported by many USB drives and drive enclosures, especially if USB 3.0. It enhances performance if it's supported by both the drive and the host controller in your device)
$ opkg install kmod-usb-storage-uas

$ ls -l /dev/sd*
brw-------    1 root     root        8,   0 Jun  1 15:25 /dev/sda
brw-------    1 root     root        8,   1 Jun  1 15:25 /dev/sda1
```

### 挂载外置硬盘

```bash
# This command will download the tools needed to create and fix ext4 (and older versions)
$ opkg install e2fsprogs

# If in the list of supported filesystems in your device you don't see ext4, you must install also the driver itself
$ opkg install kmod-fs-ext4
$ opkg install kmod-fs-xfs


# install the block tool to get more info about existing partitions
$ opkg install block-mount

# check if sda is recognisable:
$ block info
/dev/sda1: UUID="fef3c944-2wqd-4aeb-ws24-6f567c50ea6c" LABEL="NT2" TYPE="xfs"

# Generate a config entry for the fstab file
$ block detect | uci import fstab

# Now enable automount on that config entry
$ uci set fstab.@mount[-1].enabled='1'
$ uci commit fstab

# Optionally enable autocheck of the file system each time the OpenWrt device powers up
$ uci set fstab.@global[0].check_fs='1'
$ uci commit fstab

# reboot to verify automount works
$ reboot

# Now sda1 entry should be seen in the result
$ block info
...
/dev/sda1: UUID="fef3c944-2wqd-4aeb-ws24-6f567c50ea6c" LABEL="NT2" TYPE="xfs"
```

### SAMBA Share

```bash
$ smbd -V
$ opkg list | grep samba

# install samba server storage, here is samba36
$ opkg install samba36-server
# Optional: If you want a simple LuCi GUI config for samba, also install:
$ opkg install luci-app-samba

# configure samba server
$ vi /etc/config/samba
config sambashare
	option name 'HomeShare'
	option path '/mnt/sda1'
	option create_mask '0700'
	option dir_mask 'dir_mask' '0700'
	option browseable 'yes'
	option read_only 'no'
	option guest_ok 'no'

# add a new user to access sambe
$ vi /etc/passwd
frosthe:*:1000:65534:frosthe:/var:/bin/false

# set an idependent password for the newly added user:
$ smbpasswd -a frosthe
New SMB password:
Retype SMB password:
hejiaxun123

# restart samba server
$ service samba restart
```

> Note: Current user/password: pi/Hejiaxun900419

## Blog feature routemap

- Foodmap for Chengdu with baidu map embeded widgets
- Year grid for all commited posts
- Multiple photo pages

## Setup Raspbian

### Raspbian Buster 更换科大镜像源

See http://mirrors.ustc.edu.cn/help/raspbian.html

```bash
$ cd /etc/apt
# backup the file
$ sudo cp sources.list sources.list.save

$ sudo nano sources.list

deb http://mirrors.ustc.edu.cn/raspbian/raspbian/ buster main contrib non-free rpi
#deb-src http://mirrors.ustc.edu.cn/raspbian/raspbian/ buster main contrib non-free rpi

$ sudo apt-get update

```

___

## 在 Raspbian 上启用 proxy

```bash
$ sudo nano /etc/environment

export http_proxy="http://192.168.0.104:7890"
export https_proxy="http://192.168.0.104:7890"
export no_proxy="localhost, 127.0.0.1"

$ sudo visudo

Defaults    env_keep+="http_proxy https_proxy no_proxy"
```

___
## Rotate Screen

```bash
$ sudo nano /boot/config.txt

lcd_rotate=2
```

### Enable right click

On Stretch, it works, but not on Buster.

```bash
$ sudo nano /etc/X11/xorg.conf

Section "InputClass"
   Identifier "calibration"
   Driver "evdev"
   MatchProduct "FT5406 memory based driver"

   Option "EmulateThirdButton" "1"
   Option "EmulateThirdButtonTimeout" "750"
   Option "EmulateThirdButtonMoveThreshold" "30"
EndSection
```

#### Enable Right Click Raspberry Pi 7'' Offical Touch Screen On Buster

Followed [this article](https://fmirkes.github.io/articles/20190827.html).

___

## 电子相册

### 配置 OneDrive 同步盘

#### 为树莓派安装 OneDrive client

Build for Raspberry: https://github.com/abraunegg/onedrive/blob/master/docs/INSTALL.md

#### 配置 `~/.config/onedrive/config`

```bash
# When changing a config option below, remove the '#' from the start of the line
# For explanations of all config options below see docs/USAGE.md or the man page.
#
# sync_dir = "~/OneDrive"
# log_dir = "/var/log/onedrive/"

# only allow download
download_only = "true"
```

#### 限定文件夹同步

新建 `~/.config/onedrive/sync_list` 配置：

```bash
# sync_list supports comments
# 
# The ordering of entries is highly recommended - exclusions before inclusions
#
# Only Photos/Rpi/800x480
Photos/Rpi/800x480/*
```

#### 设置系统服务

```bash
$ sudo systemctl enable onedrive@pi.service

$ sudo systemctl start onedrive@pi.service

$ sudo systemctl status onedrive@pi.service

# 查看日志
$ journalctl --unit=onedrive@pi -f
```

### 配置 feh

#### 准备脚本

```bash
$ nano digital-frames.sh

#!/bin/sh
$ feh -q -p -z -F -R 60 -Y -D 15.0 ~/OneDrive/Photos/Rpi/800x480

```

- `-q, --quiet`: Don't report non-fatal errors for failed loads.
- `-p, --preload`: Preload images. This doesn't mean hold them in RAM, it means run through them and eliminate unloadable images first.
- `-z, --randomize`: When viewing multiple files in a slideshow, randomize the file list before displaying.
- `-F, --fullscreen`: Make the window fullscreen. 
- `-R, --reload`: *int*, Reload filelist and current image after *int* seconds. Useful for viewing HTTP webcams or frequently changing directories. (Note that filelist reloading is still experimental.) Set to zero to disable any kind of automatic reloading.
- `-Y, --hide-pointer`: Hide the pointer (useful for slideshows).
- `-D, --slideshow-delay`: *float*, For slideshow mode, wait *float* seconds between automatically changing slides. Useful for presentations. Specify a negative number to set the delay (which will then be float * (-1)), but start feh in paused mode.

```
$ cd Desktop
$ nano "Digital Frames.desktop"

[Desktop Entry]
Version=1.1
Type=Application
Encoding=UTF-8
Name=Digital Frames
Comment=Digital Frames
Icon=/home/pi/Pictures/sekiro_shadows_die_twice_001.jpg
Exec=/bin/sh /home/pi/digital-frames.sh
Terminal=false
Categories=Graphics
```

___

## Retropie 设置

### 蓝牙连接 XBox One S 无线控制器

```bash
$ sudo nano /opt/retropie/configs/all/autostart.sh


sudo bash -c 'echo 1 > /sys/module/bluetooth/parameters/disable_ertm'
emulationstation #auto
```

### Retro 派屏幕游戏屏幕比例

进入游戏后，按住 HotKey + Y 进入 RetroArch，按下 X 回到 Main Menu -> Settings -> Video -> Scaling -> Aspect Ratio, 并设置对应的 Width 和 Height 为屏幕尺寸。回到 Menu Menu -> Configuration File -> Save Current Configuration

### Make PlayStation 1 Game Look Better

Hotkey + Y 进入 Quick Menu, Options -> Enhanced Resolution(Slow) & Enhanced Resolution(Speed Hack)-> ON

Back to Main Menu -> Settings -> Video -> Bilinear Filtering -> ON

Save Configuration
