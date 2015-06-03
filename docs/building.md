---
id: build-process
title: Build process
category: Getting Started
---

Build process
===============

This document will explain how build process looks like in IMS.

You may want to start with [Getting started](./getting-started.md) doc first.

## Webpack

We're using [Webpack](http://webpack.github.io) for bundling and compilation because of it's flexibility, performance and possible code optimizations. Webpack can not only bundle JS files but also stylesheets and this feature is very important in our modules environment.

## Javascript

Interstellar is built using ECMAScript 6 standard of JavaScript. We're using [babel-loader](https://github.com/babel/babel-loader) to compile it to ES5 code. We strongly encourage you to use [ES6 Modules](https://github.com/lukehoban/es6features#modules) to load your files and export resources from your modules.

Interstellar apps have three entry points:
* `vendor.es6` - loaded in `<head>` section of your app and contains common Interstellar modules used by you app and modules.
* `head.es6` - loaded in `<head>` section of your app.
* `main.es6` -  loaded just before `</body>` of your app.

We will allow developers to create more entry points and change Webpack configuration in a near future.

## Stylesheets

_Read more about stylesheets in [solar-css](https://github.com/stellar/solar-css) repo._

Interstellar Module System frontend's building blocks are widgets. Every widget styles are attached to it's controller. This means that when developer decides to use a certain widget it's styles gets loaded too! But what if an application developer wants to change how it looks like? Interstellar concatenates project files and then is using [node-sass](https://github.com/sass/node-sass) to compile it. We're concatenating stylesheets in this order:

1. All widgets are using [solar-css](https://github.com/stellar/solar-css) so we load core styles and mixins first. They can be used later by modules and the app.
1. We check your application `styles` folder and concatenate all `*.header.scss` files. It's a great moment to add your core styles.
1. We concatenate all styles of loaded widgets.
1. We check your application `styles` folder again but this time we concatenate all `*.footer.scss` files. It's a great moment to overwrite widgets' styles.

## CLI

[`interstellar`](https://github.com/stellar/interstellar) is our CLI tool that performs all of the compilation steps. Use:

* `interstellar develop` to open your application in a browser a see changes as you work.
* `interstellar build` to build you application.

## Where to go from here?

* Check [`interstellar`](https://github.com/stellar/interstellar) CLI repo to read code.
* Join our [Slack channel](http://slack.stellar.org/) to discuss Interstellar and share ideas!
* Help us develop our [interstellar-stellar-client](https://github.com/stellar/interstellar-stellar-client).
* [Fix issues](https://github.com/issues?utf8=%E2%9C%93&q=is%3Aopen+repo%3Astellar%2Finterstellar+repo%3Astellar%2Finterstellar-core+repo%3Astellar%2Finterstellar-stellard+repo%3Astellar%2Finterstellar-stellar-client) in Interstellar modules.
