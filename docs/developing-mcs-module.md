---
id: developing-interstellar-module
title: Developing Interstellar module
category: Getting Started
---

Developing Interstellar module
===============

This document will guide you through a process of developing your own Interstellar module that will be used by Interstellar application.

You may want to start with [Getting started](./getting-started.md) doc first.

## Contents

1. [What is a module?](#what-is-a-module)
1. [Prerequisites](#prerequisites)
1. [Installing `interstellar` command line tool](#installing-interstellar-command-line-tool)
1. [Generating sample app and sample module files](#generating-sample-app-and-sample-module-files)
1. [Interstellar module architecture](#interstellar-module-architecture)
1. [Creating a widget](#creating-a-widget)
1. [Checking if module works](#checking-if-module-works)
1. [Where to go from here?](#where-to-go-from-here)

## What is a module?

Modules are building blocks of IMS which export services, widgets and helpful classes for developers.

Technically, a module is a NPM package and [AngularJS module](https://docs.angularjs.org/guide/module).

## Prerequisites

Before you start make sure you have [Node](https://nodejs.org/) v0.10 installed (use [nvm](https://github.com/creationix/nvm) if you don't) and [npm](https://npmjs.com).

Interstellar is written in JavaScript. We're using ECMAScript 6 standard thanks to [Babel](https://babeljs.io/) and [Webpack](http://webpack.github.io/) for bundling. Knowledge of [AngularJS](https://angularjs.org/) will be very helpful.

Please install [Yeoman](http://yeoman.io/) to quickly generate sample project in this tutorial:
```bash
npm install -g yo generator-interstellar
```

## Installing `interstellar` command line tool

[`interstellar` command line tool](https://github.com/stellar/interstellar) will help you build and develop your projects. To install `interstellar` run:

```bash
npm install -g interstellar
```

Make sure it's successfully installed by running `interstellar stroopy`. You may want to check out [Stroopy adventures](https://www.stellar.org/stories/adventures-in-galactic-consensus-chapter-1/) too :).

## Generating sample app and sample module files

Let's start with bootstraping our module:

```bash
mkdir interstellar-friendbot
cd interstellar-friendbot
yo interstellar:module interstellar-friendbot
npm link
cd ..
```

We're using [`npm link`](https://docs.npmjs.com/cli/link) to create a symbolic link to our sample module to be able to use a module in a sample application during development.

Now, let's bootstrap our application using `yo`:

```bash
mkdir sample-app
cd sample-app
yo interstellar sample-app
```

We need some working application to test our module. To install our previously linked module we need to run in a new application directory:

```bash
npm link interstellar-friendbot
```

If you're developing multiple modules in the same time you may find [`npm-workspace`](https://www.npmjs.com/package/npm-workspace) package very useful. Check our [`interstellar-stellar-client`](https://github.com/stellar/interstellar-stellar-client) repo to find out how we use it.

## Interstellar module architecture

Let's look at our sample module code and discuss the most important parts. If you have no experience with ECMAScript 6 code, please read about [ES6 features](https://github.com/lukehoban/es6features).

### Module definition

Open `index.es6` file. We start by creating a new `Module` object and giving it a name. It's important to export our new module as a default value:

```js
import {Module} from "interstellar-core";

const mod = new Module('interstellar-friendbot');
export default mod;
```

Module can contain it's own Angular elements like controllers, services, templates etc. They are autoloaded using:

```js
app.controllers = require.context("./controllers", true);
app.directives = require.context("./directives", true);
app.templates = require.context("raw!./templates", true);
```

We're using Webpack [require.context](http://webpack.github.io/docs/context.html) to load many files at a time.

### Module configuration

Modules can export a default configuration object. All of the values exposed by a module can be overwritten later by an application that's using it. To add a module configuration we use [`interstellar-core.Config`](https://github.com/stellar/interstellar-core#interstellar-coreconfig-service) provider's `addModuleConfig` method.

It's important to do all of above steps in application `config` block (read more about [configuration and run blocks](https://docs.angularjs.org/guide/module)).

```js
let addConfig = ConfigProvider => {
  ConfigProvider.addModuleConfig(mod.name, {
    amount: 1000
  });
};
addConfig.$inject = ['interstellar-core.ConfigProvider'];
mod.config(addConfig);
```

To learn more please read [`interstellar-core.Config`](https://github.com/stellar/interstellar-core#interstellar-coreconfig-service) documentation.

Finally, we need to run `define` method to register module artifacts: 

```js
mod.define();
```

### Module exports

Module can additionally export normal JS classes and objects. You can do it by using ES6 [`export`](https://github.com/lukehoban/es6features#modules) statement.

### Widgets

The last important part of modules we will mention in this document are widgets. Widgets are complex solutions that are reponsible for a single task, like: showing account balances. They consist of templates, controllers and directives. Widget can be embeded in an application by putting a directive name in an application template. For example:

```html
<interstellar-network-widgets-balance></interstellar-network-widgets-balance>
```

Widget name is a concatenation of module name and directive name with a hyphen in the middle.

## Creating a widget

In this tutorial we will develop a _friendbot_ module that will send us some [testnet](https://github.com/stellar/stellar-core/blob/master/docs/testnet.md) stellars to play with.

To create a widget we need to create widget's controller, directive, template and styles. Let's start with a [directive](https://docs.angularjs.org/guide/directive):

```js
let friendbotWidget = function () {
  return {
    restrict: "E",
    templateUrl: "interstellar-friendbot/friendbot-widget"
  }
};

module.exports = function(mod) {
  mod.directive("friendbot", friendbotWidget);
};
```

For devs familiar with AngularJS it's nothing new except the last 3 lines. We need these to register a directive in Interstellar.

Every widget has it's template. Let's open our friendbot widget template:

```html
<div ng-controller="interstellar-friendbot.FriendbotWidgetController as widget">
  <div class="interstellar-network-modules-receive-receiveContainer">
    <button ng-click="widget.friendbot()">Friendbot</button><span ng-if="widget.friendbotSent">Sent!</span>
  </div>
</div>
```

Read more about styling your widgets [here](kelp-readme).

Now, let's look at a widget controller:

```js
require('../styles/friendbot-widget.scss');

@Inject("$scope", "interstellar-core.Config", "interstellar-sessions.Sessions", "interstellar-network.Server")
class FriendbotWidgetController {
  constructor($scope, Config, Sessions, Server) {
    if (!Sessions.hasDefault()) {
      console.error('Active session is required by this widget.');
      return;
    }
    this.$scope = $scope;
    this.Config = Config;
    this.Server = Server;
    this.session = Sessions.default;
  }

  friendbot() {
    this.Server.friendbot(this.session.getAddress(), {
        amount: Config.get('modules.interstellar-friendbot.amount')
      }).then(() => {
        this.$scope.$apply();
      })
  }
}

module.exports = function(mod) {
  mod.controller("FriendbotWidgetController", FriendbotWidgetController);
};

```

There are a couple of important things to mention here:

First, you should tie your widget styles to a controller by putting your `require` statement here. In the future, Interstellar will provide conditional `require`s mechanism - when application is not using your widget, styles won't be loaded too.

Next, you can notice that modules can use other modules services. In an example above `FriendbotWidgetController` is using `interstellar-sessions.Sessions` and `interstellar-network.Server` services.

Another interesting part of this controller is an example of using `interstellar-core.Config` service to read configuration value.

Finally, again we need to register controller to Interstellar with the last 3 lines.

## Checking if module works

We're ready to check if our module works. To use our `<interstellar-friendbot-friendbot>` widget we simply need to insert it somewhere in our application templates, like this:

```html
<interstellar-friendbot-friendbot></interstellar-friendbot-friendbot>
```

Then run `interstellar develop` to compile and open a sample application in your browser.

## Where to go from here?

* Develop your own module!
* Join our [Slack channel](http://slack.stellar.org/) to discuss Interstellar and share ideas!
* Help us develop our [interstellar-stellar-client](https://github.com/stellar/interstellar-stellar-client).
* [Fix issues](https://github.com/issues?utf8=%E2%9C%93&q=is%3Aopen+repo%3Astellar%2Finterstellar+repo%3Astellar%2Finterstellar-core+repo%3Astellar%2Finterstellar-stellard+repo%3Astellar%2Finterstellar-stellar-client) in Interstellar modules.