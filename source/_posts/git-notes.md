---
title: Git Notes
date: 2018-07-04 21:11:22
description: Handy notes when using Git
categories: 
- Git
tags:
- git
---

## Clear Git Cache
Sometimes it does not take effect when you append new tries in `.gitignore` file. This is because the files are already in the repository, you need to untrack the specified file and track it again, then it will respect the new rules.
```
$ git rm -r --cached .
```
Be careful with this operation, commit your changes first before doing this.

## Case sensitive on Windows
By default, Git on windows is not case sensitive. Set the `git.core.ignoreCase=false` in git configs in `%USERPROFILE%\.gitconfig`:
```yaml
[core]
    ignoreCase = false
```
Now, existing files are tracked and it will not take effect, clear the cache first:
```
$ git rm --cached {path-to-file}
```