# Hatch.js modules

A module is an application which is mounted when the main Hatch.js process loads. It can contain a combination of:

- Code which is executed once at app load time.
- Model classes which can extend existing models or add new ones which will be available via the context object.
- Define it's own routes which are mounted at `/do/{moduleName}/{route}`.
- Define widgets which can be added to a page and interacted with by users.

## Creating a module

A module in it's most basic form consists of one `index.js` file which is loaded by the main application.

```JavaScript
var compound = require('compound');

module.exports = function (c) {
    // do initialisation stuff here
    ...
    
    // return the module to app
    return compound.createServer({root: __dirname});
};
```

## Models

Model extension classes are loaded automatically. They must be placed in `app/models` within your module's folder.

Extending a model such as `User.js` works like this:

```JavaScript
module.exports = function (compound, User) {
    // get the user's first initial
    User.prototype.getFirstInitial = function () {
        return this.firstName && this.firstName.substring(0, 1);
    };
};
```
