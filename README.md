# About Hatch.js

Hatch.js is CMS platform with social features. This package is an
express application which can be extended with additional modules. All parts of
this application are accesible via [CompoundJS API][compound-api].

## Dependencies

Hatch.js requires Node 0.8+ and Redis 2.6+ to be installed. Bower is also required to install client-side dependencies.

	npm install -g bower

## Installation

Use Hatch.js as an npm. Please see the examples for how to use Hatch.js in this way:

	npm install hatchjs

or standalone:

	git clone https://github.com/inventures/hatchjs

Then:

	npm install
	bower install

## Running Hatch.js

Like most node apps, Hatch.js listens by default on port 3000. We recommend using Nginx or similar to 
proxy requests via port 80 or 443.

	node server

Running in production mode is strongly recommended for live sites. Assets are automatically combined, minified and strongly cached, view templates are pre-compiled resulting in better performance all round:

	NODE_ENV=production node server

Visit [http://hostname:3000][localhost] to get started with your first group.

## Package Structure Overview

### [./server.js](./server.js)

Exports application server builder function. This is main entry point to
application. 

### [./app][app]

Hatch.js is express app structurized with [Compound MVC][compound], so this is
standard directory structure for MVC app. It contains core models, controllers,
views, helpers, assets and mailers.

### [./app/models][models]

Hatch.js models define all of the business object classes within the application. These can be extended by placing model class files within the `/app/models` folder of your app or your app's modules.

Models are accessed via the application context as follows:

```JavaScript
c.ModelName.functionName();
```

E.g.

```JavaScript
c.Content.all({ where: { groupId: 1 }}, function (err, posts) { 
	// do some stuff with the results
});
```

Hatch.js uses the RedisHQ driver which is part of [JugglingDB][jugglingdb]. Redis may seem like an unusual choice for a primary database. It was chosen because the requirements of Hatch.js and derived apps are usually fairly data-light + traffic-heavy. Redis is an ideal choice because of it's lightning quick performance. Due to the asynchronous nature of Node.js + Redis and the optimised implementation of MULTI batching within the [RedisHQ][redishq] driver, multiple duplicate requests within the same i/o callback context are also able to share queries and results-sets meaning that performance and scalability of the solution is significantly improved over what is achievable using a more conventional database such as MongoDB or MySQL. On rudimentary hardware (e.g. a standard 1 thread AWS micro instance), Hatch.js is easily able to cope with significant levels of traffic and a large number of concurrent users. We estimate the base performance is roughly 20-30x that of platforms such as Wordpress.

### [./lib][lib]

Hatch core. Contains API and core implementation. Hatch APIs are accessible in code as follows:

```JavaScript
c.compound.hatch.apiName.functionName();
```
	
or

```JavaScript
var compound = require('compound');
compound.hatch.apiName.functionName();
```

The available APIs, documentation and their functions can be found here: [./lib/api][apis]

### [./hatch_modules][modules]

Built-in modules for hatch. Each module is separate application mounted to root
application on `/do/{moduleName}` route.

Modules can modify the existing functionality or models or provide new features.
They can be enabled or disabled on a per-group or per-application basis via the
management area of each group.

### [./test][tests]

Before running tests ensure you have installed dev dependencies:

    npm install
    bower install

Use `make test` command to run all tests. While debugging / TDD use `make
testing` command which is the same as previous, but with `--watch` flag. For
verbose output run `make test-verbose`.

Every piece of code should be tested (ideally). Make sure tests included in pull request.

## Workflow

We are using workflow similar to [gitflow][gitflow], general idea: make commit
for some feature development into separate branch, then publish it and make pull
request to the `master` branch. It is recommended to start feature branches with
`feature/` refix.

This project uses Makefile to organize workflow as easy as [1][pull], [2][feature], [3][pr]

### 1.1. `make pull`: pulling changes

To get changes from `origin` remote use:

    make pull

this command just does `git pull origin $current-branch` command.

### 1.2. `make update`: smart pulling changes

To pull changes and perform some additional stuff use:

    make update

it will pull changes, install dependencies and run tests.

### 1.3. `make safe-update`: safe pulling changes

To pull changes safely use:

    make safe-update

it will pull changes with --no-commit flag, update dependencies and then run
tests and only commit merge when nothing was broken in tests.

### 2. `make feature`: working on feature

Run this command before start working on new feature (before first commit):

    make feature name-of-thing

this command will create new branch named `feature-name-of-thing`.

### 3. `make pr`: make pull request

When feature is done, run

    make pr

command to create pull request in GitHub

[compound]: https://github.com/1602/compound
[redishq]: https://github.com/jugglingdb/redis-hq-adapter
[jugglingdb]: http://jugglingdb.co/
[models]: /app/models
[apis]: /lib/api/index.js
[localhost]: http://localhost:3000
[tests]: ./test
[server.js]: ./server.js
[app]: ./app
[lib]: ./lib
[modules]: ./hatch_modules
[pull]: ./README.md#11-make-pull-pulling-changes
[feature]: ./README.md#2-make-feature-working-on-feature
[pr]: ./README.md#3-make-pr-make-pull-request
[compound-api]: http://compoundjs.github.com/guides
[gitflow]: http://nvie.com/posts/a-successful-git-branching-model/
