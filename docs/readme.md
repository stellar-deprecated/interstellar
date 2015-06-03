---
id: readme
title: Getting Started
category: Getting Started
---

Getting started
===============

This document will guide you through main concepts and advantages of Interstellar Module System and will help you develop your first Interstellar application.

## Contents

1. [Why Interstellar?](#why-interstellar)
1. [Prerequisites](#prerequisites)
1. [Installing `interstellar` command line tool](#installing-interstellar-command-line-tool)
1. [Generating sample app](#generating-sample-app)
1. [Interstellar application architecture](#interstellar-application-architecture)
1. [Where to go from here?](#where-to-go-from-here)

## Why Interstellar?

Interstellar Module System was designed to allow easy development of [Stellar](https://www.stellar.org/) network client applications. IMS ecosystem consists of modules created by Stellar Development Foundation and open-source developers.

_TODO expand this section_

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
import interstellarStellard from "interstellar-stellard";
```
The most important concept of Modular Client System is modularity. Right now, there are several modules that provides different kinds of functionality for developers and [`interstellar-core`](https://github.com/stellar/interstellar-core) and [`interstellar-stellard`](https://github.com/stellar/interstellar-stellard) are two of them.

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

Conceptually, an application's configuration presents itself as a simple nested json object. The interesting part, however, is that you can not only configure your application but also modules you included. When no modules configuration is present in you app config a module sets it's default values. However, sometimes you may want to change it, for example [horizon](https://github.com/stellar/go-horizon) server hostname. To do it, simply add `modules.{module-name}` field in your config json and extend it with your custom variables. For example:

```json
{
  "nested": {
    "value": true
  },
  "modules": {
    "interstellar-stellard": {
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
app.use(interstellarStellard);
```

This will make all Angular parts of a module (providers, services etc.) accessible from your app.

Application can contain it's own Angular elements like controllers, services, templates etc. They are autoloaded using following code:

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

Modules (and app) in Interstellar communicate by broadcasting `Intent` objects using [Android-inspired](http://developer.android.com/guide/components/intents-filters.html) intent system. Modules can:
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

@Inject("interstellar-core.Config", "interstellar-core.IntentBroadcast", "interstellar-stellard.Sessions")
class IndexController {
  constructor(Config, IntentBroadcast, Sessions) {
    // contructor code
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
<interstellar-stellard-balance></interstellar-stellard-balance>
```

As with services, widget name is a concatenation of module name and service name but this time with a hyphen in the middle.

You can find full list of classes, services and widgets provided by each module in it's documentation.

## Where to go from here?

* Join our [Slack channel](http://slack.stellar.org/) to discuss Interstellar and share ideas!
* Help us develop our [interstellar-stellar-client](https://github.com/stellar/interstellar-stellar-client).
* [Fix issues](https://github.com/issues?utf8=%E2%9C%93&q=is%3Aopen+repo%3Astellar%2Finterstellar+repo%3Astellar%2Finterstellar-core+repo%3Astellar%2Finterstellar-stellard+repo%3Astellar%2Finterstellar-stellar-client) in Interstellar modules.
* Develop your own module!