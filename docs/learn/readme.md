---
id: readme
title: Getting Started
category: Getting Started
---

# `interstellar`

The Interstellar Module System is an open [ecosystem of modules](https://github.com/stellar/interstellar/blob/master/docs/module-list.md) that aims to make it easy to build a web application on the Stellar network. This repository (`interstellar`) contains a command line tool that standardizes the build process for Stellar web applications based on the module configuration.

Read the [introductory blog post](https://www.stellar.org/blog/developer-preview-interstellar-module-system/), [get started](https://github.com/stellar/interstellar/blob/master/docs/readme.md) or take a look at [interstellar-client](https://github.com/stellar/interstellar-client) to see the system in action.

Getting started
===============

This document will guide you through main concepts and advantages of Interstellar Module System and will help you develop your first Interstellar application.

## Contents

1. [Why Interstellar?](#why-interstellar)
2. [Quick Overview](#quick-overview)
1. [Prerequisites](#prerequisites)
1. [Installing `interstellar` command line tool](#installing-interstellar-command-line-tool)
1. [Generating sample app](#generating-sample-app)
1. [Interstellar application architecture](#interstellar-application-architecture)
1. [Where to go from here?](#where-to-go-from-here)
2. [Get a Stellar testnet account](#get-a-stellar-testnet-account)
2. [List of modules](https://github.com/stellar/interstellar/blob/master/docs/module-list.md)

## Why Interstellar?

People often think of modularity in silos:
- Feature modules
- Interface modules (header, navigation, buttons, tables)
- Code modules (libraries, services, dependencies)

**Interstellar aims to connect disparate models of modular systems into one holistic, expressive, interconnected system.**

####Interstellar has several technical design goals. It should enable:
- Development of different apps from reusable, modular pieces of the same system
- Development of features without codependencies (i.e., no house-of-cards style collapsing if you decide to pull out one feature)
- On-the-fly tests of beta features without impact on existing features
- Easy third-party customization

##Quick overview

![overview](https://www.stellar.org/wp-content/uploads/2015/06/interstellar-overview.png)

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

## Generating sample app

Let's start with bootstrapping our application using `yo`:
```bash
mkdir sample-app
cd sample-app
yo interstellar sample-app
```

Now, simply run: `interstellar develop` and a browser window with a sample app should open.

## Interstellar application architecture

Let's look at our sample app code and discuss the most important parts. If you have no experience with ECMAScript 6 code, please read about [ES6 features](https://github.com/lukehoban/es6features).

### Modules

Open `main.es6` file. In the top of the file you will notice `import` statements:
```js
import interstellarCore, {App, Inject, Intent} from "interstellar-core";
import interstellarSessions from "interstellar-sessions";
import interstellarNetwork from "interstellar-network";
import interstellarNetworkWidgets from "interstellar-network-widgets";
```
The most important concept of Modular Client System is modularity. Right now, there are several modules that provides different kinds of functionality for developers and [`interstellar-network`](https://github.com/stellar/interstellar-network) and [`interstellar-sessions`](https://github.com/stellar/interstellar-sessions) are two of them.

Modules can:
* Export helpful classes like `App`, `Inject` and `Intent` in the example above.
* Create angular providers, services, filter and directives that can be used by other modules and apps. `interstellar-core` adds `interstellar-core.Config` service that allows to read configuration variables by other modules.
* Create widgets that can be used by application developers. You can read more about widgets below.

### App configuration

As mentioned above `interstellar-core` provides some interesting classes and `App` is one of them. `App` instance represents a single Interstellar application. To create an app we need to pass two parameters to a constructor: application name and application config:

```js
let config = require('./config.json');
export const app = new App("sample-app", config);
```

Conceptually, an application's configuration presents itself as a simple nested json object. The interesting part, however, is that you can not only configure your application but also modules you included. When no modules configuration is present in you app config a module sets its default values. However, sometimes you may want to change it, for example [horizon](https://github.com/stellar/go-horizon) server hostname. To do it, simply add `modules.{module-name}` field in your config json and extend it with your custom variables. For example:

```json
{
  "nested": {
    "value": true
  },
  "modules": {
    "interstellar-network": {
      "horizon": {
        "server"
      }
    }
  }
}
```

To get a configuration variable you can use `interstellar-core.Config` service.

```js
let value = Config.get('nested.value');
console.log(value) // true
```

### App bootstrap

Every module that will be used by an app must be registered with `use` method, like:

```js
app.use(interstellarCore);
app.use(interstellarSessions);
app.use(interstellarNetwork);
app.use(interstellarNetworkWidgets);
```

This will make all Angular parts of a module (providers, services etc.) accessible from your app.

An application can contain its own Angular elements like controllers, services, templates etc. They are autoloaded using following code:

```js
app.controllers = require.context("./controllers", true);
app.templates = require.context("raw!./templates", true);
```

We're using Webpack [require.context](http://webpack.github.io/docs/context.html) to load many files at the same time.

We can configure app's [ui-router](https://github.com/angular-ui/ui-router):
```js
app.routes = ($stateProvider) => {
  $stateProvider.state('index', {
    url: "/",
    templateUrl: "sample-app/index"
  });

  $stateProvider.state('balance', {
    url: "/balance",
    templateUrl: "sample-app/balance"
  });
};
```

And finally, we can add Angular `config` and `run` blocks.

After adding all elements we can bootstrap the app using:

```js
app.bootstrap();
```

### Intents

Modules (and apps) in Interstellar communicate by broadcasting `Intent` objects using an [Android-inspired](http://developer.android.com/guide/components/intents-filters.html) intent system. Modules can:
* **Broadcast Intents** to trigger some events in other modules,
* **Register Broadcast Receivers** to listen to Intents sent by other modules.

Every Intent has a type which must be one of standard intent types. For a complete list of Intent types please check [`interstellar-core` documentation](https://github.com/stellar/interstellar-core#intent-class).

Broadcast Receivers should be registered in `run` phase:

```js
let registerBroadcastReceivers = ($state, IntentBroadcast) => {
  IntentBroadcast.registerReceiver(Intent.TYPES.SHOW_DASHBOARD, intent => {
    $state.go('balance');
  });
};
registerBroadcastReceivers.$inject = ["$state", "interstellar-core.IntentBroadcast"];
app.run(registerBroadcastReceivers);
```

Intents are sent using `interstellar-core.IntentBroadcast` service's `sendBroadcast` method. Let's analyze how a controller can broadcast an Intent, open: `index.controller.es6` file:
```js
this.IntentBroadcast.sendBroadcast(
  new Intent(
    Intent.TYPES.SHOW_DASHBOARD
  )
);
```
`SHOW_DASHBOARD` intent tells all receivers that user should see your application dashboard. You can see that our broadcast receiver changes a current state of router to our dashboard.

Intent system is the important mechanism of communication between widgets.

### Dependency Injection

Interstellar application is the AngularJS application and it also makes use of [Dependency Injection](https://docs.angularjs.org/guide/di) design pattern which Angular implements. In Interstellar you can use `$inject` property annotation to inject services but you can also use `@Inject` [decorator](https://github.com/wycats/javascript-decorators) provided by `interstellar-core` module like this:

```js
import {Inject} from 'interstellar-core';

@Inject("interstellar-core.Config", "interstellar-core.IntentBroadcast", "interstellar-sessions.Sessions")
class IndexController {
  constructor(Config, IntentBroadcast, Sessions) {
    // constructor code
  }
}
```

Important thing to notice is how services names are generated. Basically, a service name is a concatenation of module name and service name with a dot in the middle. Check a table below to find out how other artifacts names are generated:

Artifact type | Artifact name | Generated name
--- | --- | ---
Controller | `FooController` | `interstellar-module.FooController`
Directive | `fooDirective` | `interstellar-module-foo-directive`
Service | `FooService` | `interstellar-module.FooService`
Provider | `FooProvider` | `interstellar-module.FooProvider`

### Widgets

The last important part of Interstellar we will mention in this document are widgets. Widgets are complex solutions that are reponsible for a single task, like: showing account balances. They consist of templates, controllers and directives. Widgets can be used by writing a directive name in your application template:

```html
<interstellar-network-widgets-balance></interstellar-network-widgets-balance>
```

As with services, widget name is a concatenation of module name and service name but this time with a hyphen in the middle.

You can find full list of classes, services and widgets provided by each module in its documentation.

## Where to go from here?

<!-- this section is copied in other .md files in this docs folder -->
* Join our [Slack channel](http://slack.stellar.org/) to discuss Interstellar and share ideas!
* Help us develop our [interstellar-client](https://github.com/stellar/interstellar-client).
* [Fix issues](https://github.com/issues?utf8=%E2%9C%93&q=is%3Aopen+repo%3Astellar%2Finterstellar+repo%3Astellar%2Finterstellar-core+repo%3Astellar%2Finterstellar-network+repo%3Astellar%2Finterstellar-network-widgets+repo%3Astellar%2Finterstellar-wallet+repo%3Astellar%2Finterstellar-sessions+repo%3Astellar%2Finterstellar-client) in Interstellar modules.
* Develop your own module!

## Getting a Stellar testnet account
The yeoman generator generates a testnet account for you automatically, but you can also create one for yourself using our [friendbot](https://www.stellar.org/galaxy#friendbot).
