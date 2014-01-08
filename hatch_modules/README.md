# Hatch.js modules

A module is an application which is mounted when the main Hatch.js process loads. It can contain a combination of:

- Code which is executed once at app load time.
- Model classes which can extend existing models or add new ones which will be available via the context object.
- Define it's own routes which are mounted at `/do/{moduleName}/{route}`.
- Define widgets which can be added to a page and interacted with by users.
