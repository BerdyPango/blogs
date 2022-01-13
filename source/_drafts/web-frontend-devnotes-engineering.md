---
title: Web Front-end Development Notes - Engineering
description: Notes of HTML5/CCS3
category:
    - WebFrontend
tags:
    - javascript
    - engineering
    - webpack
---

## NPM Notes

Common arguments for `npm install <package>`:

- `-g` or `--global`: install the package globally rather than locally.
- `--save`: 
- `--save-dev`: 
- `-D`: equal to `--save-dev`

### Package.json

___

## TypeScript Centralized World

To use TypeScript in a project, we need:

- [typescript](https://www.npmjs.com/package/typescript): The TypeScript language and compiler package.
- [tsc CLI Options](https://www.typescriptlang.org/docs/handbook/compiler-options.html): The CLI options references, most of which can be chunked out in a `tsconfig.json` file.

### TypeScript Tooling

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html): The handbook for references.
- [Playground](https://www.typescriptlang.org/play): An online playground for TypeScript.
- [TSConfig Reference](https://www.typescriptlang.org/tsconfig): An annotated reference to more than a hundred compiler options available in a `tsconfig.json` or `jsconfig.json`.
- [Type Search](https://www.typescriptlang.org/dt/search?search=): Search for npm modules with types from DefinitelyTyped or embedded in the module.

Since TypeScript becomes more and more popular in JavaScript world, it becomes 1st citizen when it comes to topics like linting, bundling, debugging, unit testing and so on. However, most of the tools are built in the first place for Javascript, there are some extra work to do to make them support TypeScript.

### TypeScript Linting

For historical reasons, TSLint has been deprecated since 2019. Instead of continuing using TSLint, [`typescript-eslint`](https://github.com/typescript-eslint/typescript-eslint) becomes the option for linting TypeScript.

In order to properly configure `eslint` and `typescript-eslint`, there are a set of packages needed and what they do:

- [ESLint](https://eslint.org/): The essential package required for Javascript linting, the [`eslint:recommended`](https://eslint.org/docs/rules/) ruleset is ESLint's inbuilt "recommended" config - it turns on a small, sensible set of rules which lint for well-known best-practices.
- [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint/tree/master/packages): `typescript-eslint` contains a set of packages, we pick the necessary ones to fulfill our needs:
  - [typescript-eslint/parser](https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/parser): This package is the custom implementation provided to ESLint, which is capable of parsing Tyescript source code, and delivering an AST which is compatible with the one ESLint expects.
  - [typescript-eslint/eslint-plugin](https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin): This package allows to use the typescript specific rules, it also provides the `plugin:@typescript-eslint/recommended` config - it's just like `eslint:recommended`, except it only turns on rules from TypeScript-specific plugin.
- [eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier#readme): This plugin works best if you disable all other ESLint rules relating to code formatting, this plugin ships with a `plugin:prettier/recommended` config that sets up both the plugin and `eslint-config-prettier` in one go.

Read [Getting Started - Linting your TypeScript Codebase](https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/README.md) for more details.

#### TypeScript Vue Project Linting

- [eslint-plugin-vue](https://github.com/vuejs/eslint-plugin-vue): Initially setup together with `vue-cli` created project, it provides the `vue-eslint parser` and some [predefined configs](https://eslint.vuejs.org/user-guide/#bundle-configurations) such as `plugin:vue/essential`.
- Vue Cli related eslint configs: The configs are specifically designed to be used by Vue CLI setups and is not meant for outside use
  - [@vue/eslint-config-typescript](https://github.com/vuejs/eslint-config-typescript#readme): It provides config `@vue/typescript/recommended` which is extended from the `plugin:@typescript-eslint/recommended` ruleset.
  - [@vue/eslint-config-prettier](https://github.com/vuejs/eslint-config-prettier#readme): Similar to `@vue/eslint-config-typescript` config, this package ships with the `@vue/prettier` and `@vue/prettier/@typescript-eslint` configs.

### TypeScript Unit Testing

#### Jest

Jest provides developers with a unit testing framework including built-in support for Javascript files.

- `jest`: The javascript unit test framework. Configuration references can be found at [Configuring Jest](https://jestjs.io/docs/configuration).
- [@types/jest](https://www.npmjs.com/package/@types/jest): This package contains type definitions for Jest.

To run jest unit test files, Jest also provide a cli with a rich set ot options. Explore more at [Jest CLI Options](https://jestjs.io/docs/cli);

There are some commonly used options:

- `testRegex`: The regexp pattern or array of patterns that Jest uses to detect test files.
- `transform`: A map from regular expressions to paths to transformers. A transformer is a module that provides a synchronous function for transforming source files.
  - [babel-jest](https://www.npmjs.com/package/babel-jest): If you are already using `jest-cli`, add `babel-jest` and it will automatically compile JavaScript code using Babel.
  - [ts-jest](https://www.npmjs.com/package/ts-jest): A TypeScript preprocessor with source map support for Jest that lets you use Jest to test projects written in TypeScript. The transformer used to handle `.ts` or `.tsx` files.
  - [jest-transform-stub](https://www.npmjs.com/package/jest-transform-stub): Jest doesn't handle non JavaScript assets by default. You can use this module to avoid errors when importing non JavaScript assets.
  - [vue-jest](https://www.npmjs.com/package/vue-jest): Jest Vue transformer with source map support. The transformer used to handle `.vue` file.
- `moduleNameMapper`: A map from regular expressions to module names or to arrays of module names that allow to stub out resources, like images or styles with a single module. Modules that are mapped to an alias are unmocked by default, regardless of whether automocking is enabled or not.

### Webpack

Webpack is used to compile JavaScript modules. Once installed, you can interact with webpack either from its [CLI](https://webpack.js.org/api/cli/) or [API](https://webpack.js.org/api/node/).

- [webpack](https://www.npmjs.com/package/webpack): 
- [webpack-cli](https://www.npmjs.com/package/webpack-cli): If you're using webpack v4 or later and want to call `webpack` from the command line, you'll also need to install the CLI.

Commonly used options in `webpack.config.js`:

- `entry`: Tell webpack the starting point to build the dependency graph.
- `output`: Tell webpack the output file or folder it should put.
- `target`: Instructs webpack to target a specific environment. Defaults to `'browserslist'` or to `'web'` when no browserslist configuration was found.

Dependency Graph: 

Any time one file depends on another, webpack treats this as a dependency. This allows webpack to take non-code assets, such as images or web fonts, and also provide them as dependencies for your application. Starting from these entry points, webpack recursively builds a dependency graph that includes every module your application needs, then bundles all of those modules into a small number of bundles - often, just one - to be loaded by the browser.

Webpack Concepts:

- `Entry`: An entry point indicates which module webpack should use to begin building out its internal dependency graph.
- `Output`: The output property tells webpack where to emit the bundles it creates and how to name these files.
- `Loaders`: Out of the box, webpack only understands JavaScript and JSON files. Loaders allow webpack to process other types of files and convert them into valid modules that can be consumed by your application and added to the dependency graph.
  - `test`: The `test` property identifies which file or files should be transformed.
  - `use`: The `use` property indicates which loader should be used to do the transforming.
- `Plugins`: While loaders are used to transform certain types of modules, plugins can be leveraged to perform a wider range of tasks like bundle optimization, asset management and injection of environment variables.
- `Mode`: By setting the `mode` parameter to either `development`, `production` or `none`, you can enable webpack's built-in optimizations that correspond to each environment. The default value is `production`. Learn more about the [mode configuration](https://webpack.js.org/configuration/mode/) and what optimizations take place on each value.


#### Webpack with TypeScript

- [typescript](https://www.npmjs.com/package/typescript): The TypeScript language and compiler package.
- [ts-loader](https://www.npmjs.com/package/ts-loader): TypeScript loader for webpack. `ts-loader` uses `tsc`, the TypeScript compiler, and relies on your `tsconfig.json` configuration. Make sure to avoid setting `module` to "CommonJS", or webpack won't be able to tree-shake your code.

#### Write Webpack Configuration in TypeScript

To write the webpack configuration in TypeScript, you would first install the necessary dependencies, i.e., TypeScript and the relevant type definitions from the DefinitelyTyped project:

```
npm install --save-dev typescript ts-node @types/node @types/webpack
# and, if using webpack-dev-server
npm install --save-dev @types/webpack-dev-server
```

- [ts-node](https://www.npmjs.com/package/ts-node): TypeScript execution and REPL for node.js, with source map support. Works with `typescript@>=2.7`.
  - `ts-node` does not support any module syntax other than `commonjs`.
- [@types/node](https://www.npmjs.com/package/@types/node): TypeScript definitions for Node.js
- [@types/webpack](https://www.npmjs.com/package/@types/webpack): TypeScript definitions for webpack

There are issues writing webpack configuration in TypeScript, see more at [Configuration Languages](https://webpack.js.org/configuration/configuration-languages/).

## VSCode Debugging

TBD