---
title: 搭建魔兽世界私服
date: 2018-10-06 23:09:17
description: 
categories:
tags: 
---

## 准备环境

### 准备服务端程序
```bash
# install necessory libs on ubuntu
$ sudo apt-get install build-essential gcc g++ automake git-core autoconf make patch libmysql++-dev mysql-server libtool libssl-dev grep binutils zlibc libc6 libbz2-dev cmake subversion libboost-all-dev

# create new user for running the server
$ sudo useradd -m -d /home/mangos -c "MaNGOS" -U mangos

# git clone necessory repositories & database
$ cd /home/mangos
$ sudo git clone git://github.com/cmangos/mangos-classic.git mangos
$ sudo git clone git://github.com/cmangos/classic-db.git

# create build directory and build
$ sudo mkdir build

# want compile CMaNGOS & the map extraction tools
$ sudo cmake ../mangos -DCMAKE_INSTALL_PREFIX=\../mangos/run -DBUILD_EXTRACTORS=ON -DPCH=1 -DDEBUG=0

# compile CMaNGOS and ScriptDev2
$ make

# install to your "run" directory
$ make install

$ cd ../mangos/run/etc
$ cp mangosd.conf.dist mangosd.conf
$ cp realmd.conf.dist realmd.conf
$ cp playerbot.conf.dist playerbot.conf
$ cp /home/mangos/mangos/src/game/AuctionHouseBot/ahbot.conf.dist.in ahbot.conf

$ sudo nano /home/mangos/mangos/run/etc/mangosd.conf

DataDir = "/home/mangos/mangos/run/data/"
```

### 安装数据库
确保工作目录在 `/home/mangos/mangos`，此处以经典旧世为例，其数据库名称为 `classicmangos`
```bash
# this will create a user (name mangos, password mangos) with rights to the databases "mangos" (world-db), characters and realmd
$ mysql -uroot -p < mangos/sql/create/db_create_mysql.sql

# initialize Mangos database
$ mysql -uroot -p classicmangos < mangos/sql/base/mangos.sql

# initialize DBC database
$ for sql_file in ls mangos/sql/base/dbc/original_data/*.sql; do mysql -uroot -p --database=classicmangos < $sql_file; done
$ for sql_file in ls mangos/sql/base/dbc/cmangos_fixes/*.sql; do mysql -uroot -p --database=classicmangos < $sql_file; done

# initialize character database
$ mysql -uroot -p classiccharacters < mangos/sql/base/characters.sql

# initialize realmd database
$ mysql -uroot -p classicrealmd < mangos/sql/base/realmd.sql

#
$ cd classic-db
$ ./InstallFullDB.sh

# This will create a config file named "InstallFullDB.config", looking like:
####################################################################################################
# This is the config file for the './InstallFullDB.sh' script
#
# You need to insert
#   MANGOS_DBHOST:	Your MANGOS database host
#   MANGOS_DBNAME:	Your MANGOS database schema
#   MANGOS_DBUSER:	Your MANGOS username
#   MANGOS_DBPASS:	Your MANGOS password
#   CORE_PATH:    	Your path to core's directory
#   MYSQL:        	Your mysql command (usually mysql)
#
####################################################################################################

## Define the host on which the mangos database resides (typically localhost)
MANGOS_DBHOST="localhost"

## Define the database in which you want to add clean DB
MANGOS_DBNAME="mangos" **("tbcmangos" if you're working with mangos-tbc)**

## Define your username
MANGOS_DBUSER="mangos"

## Define your password (It is suggested to restrict read access to this file!)
MANGOS_DBPASS="mangos"

## Define the path to your core's folder
##   If set the core updates located under sql/updates/mangos from this mangos-directory will be added automatically
CORE_PATH=""

## Define your mysql programm if this differs
MYSQL="mysql"

# Enjoy using the tool

$ sudo nano InstallFullDB.config

CORE_PATH="../mangos"


You have now a clean and recent Classic-DB database loaded into classicmangos
Enjoy using Classic-DB

$ cd ..

# Fill ScriptDev2 database
$ mysql -uroot -p classicmangos < mangos/sql/scriptdev2/scriptdev2.sql

# start server
```

### 从 wow 1.12.x 版本中 Extract 内容
首先下载对应的客户端
在 `/home/mangos/mangos/run/bin/tools/` 下的:
- `ad`
- `vmap_assembler`
- `vmap_extractor`
- `MoveMapGen`

4 个二进制文件拷贝到 WoW 客户端根目录下，再将 `/home/mangos/mangos/contrib/extractor_scripts/` 目录下的:
- `ExtractResources.sh`
- `MoveMapGen.sh`

拷贝到 WoW 客户端根目录下。然后在该目录运行 `bash`，执行 `bash ExtractResources.sh`，必须 extract `DBC/maps` 和 `vmaps`，`mmaps` 是可选的(并且会花很长时间)。

执行完成后，将生成:
- `maps`: 拷贝至 `/home/mangos/mangos/run/data`
- `dbc`: `/home/mangos/mangos/run/data`
- `vmaps`: `/home/mangos/mangos/run/data`
- `mmaps`: 可选的
- `Buildings`: 删除

### 修改服务器列表地址(可选))
如果并不想在本机 host 服务器程序，执行以下 sql 语句:
```sql
DELETE FROM realmlist WHERE id=1;
INSERT INTO realmlist (id, name, address, port, icon, realmflags, timezone, allowedSecurityLevel)
VALUES ('1', 'MaNGOS', '<your-server-address>', '8085', '1', '0', '1', '0');
```

### 配置 WoW 1.12.x 客户端
在客户端根目录下找到 `realmlist.wtf`，拷贝一份命名为 `realmlist.wtf.old`，打开原来的文件修改如下:
```bash
set realmlist 127.0.0.1
# confirm the address in the database is the correct one.
```

### 运行服务端程序
一切准备就绪后，便可执行服务端程序了:
```bash
exec screen -dmS mangosd /home/mangos/mangos/run/bin/mangosd -c /home/mangos/mangos/run/etc/mangosd.conf -a /home/mangos/mangos/run/etc/ahbot.conf
exec screen -dmS realmd /home/mangos/mangos/run/bin/realmd -c /home/mangos/mangos/run/etc/realmd.conf
```
### 设置服务器程序开机启动
首先创建 `/home/mangos/cmangos-launcher.sh` 文件，并填充以下内容:
```bash
#!/bin/bash
exec screen -dmS mangosd /home/mangos/mangos/run/bin/mangosd -c /home/mangos/mangos/run/etc/mangosd.conf -a /home/mangos/mangos/run/etc/ahbot.conf++
exec screen -dmS realmd /home/mangos/mangos/run/bin/realmd -c /home/mangos/mangos/run/etc/realmd.conf++
```
以 `mangos` 用户打开 `crontab -e`:
```bash
@reboot /bin/bash /home/mangos/cmangos-launcher.sh
```

## 初始设置
### 创建账号
```bash
# create new account
$ account create [username] [password]
$ account set addon [username] 0
$ account set gmlevel [username] 0
```

## 准备汉化数据库

```bash
$ cd ~
$ git clone https://github.com/DecadeWoW/wow_db_chinese.git wow_db_chinese_classic

$ cd wow_db_chinese_classic

mysql -umangos -pmangos classicmangos < areatrigger_teleport.sql
mysql -umangos -pmangos classicmangos < creature_ai_texts.sql
mysql -umangos -pmangos classicmangos < creature_template.sql
mysql -umangos -pmangos classicmangos < creature_text.sql
mysql -umangos -pmangos classicmangos < db_script_string.sql
mysql -umangos -pmangos classicmangos < game_event.sql
mysql -umangos -pmangos classicmangos < gameobject_template.sql
mysql -umangos -pmangos classicmangos < game_tele.sql
mysql -umangos -pmangos classicmangos < gossip_menu_option.sql
mysql -umangos -pmangos classicmangos < item_set_names.sql
mysql -umangos -pmangos classicmangos < item_template.sql
mysql -umangos -pmangos classicmangos < npc_text.sql
mysql -umangos -pmangos classicmangos < page_text.sql
mysql -umangos -pmangos classicmangos < quest_template.sql
mysql -umangos -pmangos classicmangos < script_texts.sql

```



## TrinityCore Notes
```bash
$ cd /home/trinity/TrinityCore/cmake
$ cmake ../ -DCMAKE_INSTALL_PREFIX=/home/trinity/server

$ make
$ make install
```