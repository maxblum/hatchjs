# About

Hatch-compound is CMS platform with social features. This package is just
express application which could be extended with additional modules. Any part of
this application accesible via [CompoundJS API][compound-api].

## Package Structure Overview

### ./index.js

Exports application server builder function. This is main entry point to
application. When you run `node .` or `compound server 3003` this file
automatically included.

### ./app

Hatch-compound is express app structurized with Compound MVC, so this is
standard directory structure for MVC app. It contains core models, controllers,
views, helpers, assets and mailers.

### [./lib][lib]

Hatch core. Contains API and core implementation.

### [./hatch_modules][modules]

Built-in modules for hatch. Each module is separate application mounted to root
application on `/do/{moduleName}` route.

### ./test

Before running tests ensure you have installed dev dependencies:

    npm install

Use `make test` command to run all tests. While debugging / TDD use `make
testing` command which is the same as previous, but with `--watch` flag. For
verbose output run `make test-verbose`.

[lib]: https://github.com/marcusgreenwood/hatch-compound/tree/master/lib
[modules]: https://github.com/marcusgreenwood/hatch-compound/tree/master/hatch_modules
[compound-api]: http://compoundjs.github.com/guides
