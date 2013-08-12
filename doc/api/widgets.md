hatch-widgets(3) - Hatch Widgets
================================

## DESCRIPTION

Widget is a view connected to controller that renders part of page html.

## BASICS

### Structure, config: ./config/widgets.yml

Configuration file that lists all widgets in module. It has simple structure:

    widget-name:
      title: Title of widget
      desctiption: Some description
      icon: icon-name

Optionally it may have `settings` object, which consists of set of fields or
tabs. For example:

  settings:
    fields:
      displayMode:
        type: select
        title: What to display
        options:
          - 'members:Members'
          - 'following:Following'
          - 'followers:Followers'
        default: 'members'

### Structure, controller: ./app/controllers/widgets/widget-name_controller.js

Widget controller should be written in eval form starting with the following
line:

    load('widgets/common');

This is only requirement to widget controller, it's necessary to initialize
controller environment for rendering widget and define canonical form of show
action (each widget should have at least show action):

    action(function show() {
        render();
    });

Any widget controller can override that default definition as wel as add more
actions to widget controller. Widget actions can be accessed using
widgetCoreAction helper which described below.

### Structure, view: ./app/views/widgets/widget-name/action-name.ejs

No specific requirements or limitations for views.

### Helpers

Both server-side and client-side codebase provide some helpers and html tag
data-attributes for convenient use of widgets.

TODO: describe helpers, and data-attributes for widgets
