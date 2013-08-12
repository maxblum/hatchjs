hatch(3) - Hatch Platform
=========================

## DESCRIPTION

Hatch is a platform for building websites with social features, hatch consists
of core and number of modules, all parts of hatch (core, modules) are CompoundJS
apps. Each module implements some limited piece of functionality such as admin
area or user-related features. Hatch provides API to bundle all that pieces
together and to inject additional functionalities such as widgets, special pages
and number of API extensions to compound modules.

## OVERVIEW

### Modules

Module is a pluggable part of functionality, usually it is separate compound app
with own controllers, views, models. It can be mounted to main app or just
extend main app without creating new routes namespace. Module can add widgets,
models and special pages to global namespace.

Each module can be enabled on particular group.

See hatch-module(3), hatch-group(3)

### Widgets

Widget is a view connected to controller that renders part of page html. Hatch
provides multi-column interface to manage widgets on the page: widgets can be
moved, configured, stylized using convenient interface.

Any complex page can be built using set of widgets, for example if we building
blogging platform we can use widgets for creating index page such as blog roll,
tags, latest comments, popular post, etc.. And widgets for post page: view post,
similar posts, comments, social bar, etc..

See hatch-widgets(3)

### Special pages

TODO: describe special pages

See hatch-special-pages(3)

### Groups

TODO: describe group

See hatch-group(3)

### Pages

### Content

## SEE ALSO

hatch-widgets(3) hatch-api(3) hatch-module(3) hatch-middleware(3)
