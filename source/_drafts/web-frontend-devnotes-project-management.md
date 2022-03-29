---
title: Web Front-end Notes - Package Management
date: 2021-10-14 16:21:58
description: Notes of Web front-end package management
category:
    - WebFrontend
tags:
    - javascript
    - engineering
---

___
## NPM

Common arguments for `npm install <package>`:

- `-g` or `--global`: install the package globally rather than locally.
- `--save`: as project dependency.
- `--save-dev`: as dev dependency.
- `-D`: equal to `--save-dev`
- [npm ci](https://docs.npmjs.com/cli/v7/commands/npm-ci): This command is similar to `npm install`, except it's meant to be used in automated environments such as test platforms, continuous integration, and deployment -- or any situation where you want to make sure you're doing a clean install of your dependencies.

### Package.json

- `version`: Conforms to semantic versioning.
- `main`: The entry module exposed, as the returned object when codes import your module. See [main](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#main).

### .npmrc

### Nvm

### Package Publishment
