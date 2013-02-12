var express = require('express');
var co = require('compound');
var fs = require('fs');
var WidgetAPI = require('./api/widget');

exports.HatchPlatform = function HatchPlatform(app) {
    this.api = {app: app}; // temp stub hatch api
    this.app = app;
    this.compound = app.compound;
    this.grids = {};
    this.modules = {};

    var gridsDir = app.root + '/app/grids';
    fs.readdirSync(gridsDir).forEach(function (file) {
        this.grids[file.replace(/\.ejs$/, '')] = fs.readFileSync(
            app.root + '/app/grids/' + file
        ).toString().split('\n\n')
    }.bind(this));

    app.config = {};

    this.widget = new WidgetAPI(this);
};

exports.modules = function (compound) {
    var mediator = express();

    compound.controllerExtensions.moduleEnabled = function (moduleName) {
        if (!this.req.group) return false;
        var found = false;
        this.req.group.modules.forEach(function (m) {
            if (m.name === moduleName) {
                found = true;
            }
        });
        return found;
    };

    compound.controllerExtensions.pathFor = function (m) {
        return compound.hatch.modules[m].compound.map.pathTo;
    };

    fs.readdirSync(compound.root + '/hatch_modules').forEach(function (m) {
        var modPath = compound.root + '/hatch_modules/' + m;
        var mod = require(modPath)();
        if (mod.compound.parent) {
            return;
        }
        mod.compound.name = m;
        mod.compound.parent = compound;
        mod.compound.hatch = compound.hatch;
        compound.hatch.modules[m] = mod;
        mod.compound.models = mod.models = compound.models;

        mod.compound.on('structure', function (s) {
            if (!s.helpers.application_helper) {
                s.helpers.application_helper = {};
            }
            s.helpers.application_helper.pathFor = compound.controllerExtensions.pathFor;
            s.helpers.application_helper.moduleEnabled = compound.controllerExtensions.moduleEnabled;
        });

        mod.compound.on('routes', function () {
            var gotRouter, i, l = mod.stack.length;
            mod.stack.forEach(function (r, i) {
                if (r.handle === mod.router) {
                    gotRouter = i;
                }
            });
            for (i = l; i > gotRouter; i--) {
                mod.stack[i] = mod.stack[i - 1];
            }
            if (gotRouter) {
                mod.stack[gotRouter] = {
                    route: '',
                    handle: exports.middleware(compound)
                };
            } else {
                mod.use(exports.middleware(compound));
                mod.use(mod.router);
            }
        });

        mediator.use('/' + m, mod);

        if (fs.existsSync(modPath + '/config/widgets.yml')) {
            var ws = require(modPath + '/config/widgets.yml')[0];
            if (ws) {
                Object.keys(ws).forEach(function (w) {

                    compound.hatch.widget.register(m, w, {info: ws[w]});
                });
            }

            mod.compound.on('routes', function (map) {
                map.namespace('widgets', function (widgets) {
                    widgets.post(':controller/:action');
                });
            });

            mod.compound.on('structure', function (structure) {
                structure.controllers['widgets/common_controller'] = compound.structure.controllers['widgets_common_controller'];
                structure.views['layouts/widgets_layout'] = compound.structure.views['layouts/widgets_layout'];
                if (structure.helpers['application_helper']) {
                    Object.keys(compound.structure.helpers['widgets_common_helper']).forEach(function (helperName) {
                        structure.helpers['application_helper'][helperName] = compound.structure.helpers['widgets_common_helper'][helperName];
                    });
                } else {
                    structure.helpers['application_helper'] = compound.structure.helpers['widgets_common_helper'];
                }
            });

        }
    });
    return mediator;
};

exports.middleware = function (compound) {

    return function hatchMiddleware(req, res, next) {
        var User = compound.models.User;

        // TODO: unstub user stuff (implement user module)
        req.user = new User({
            email: 'user101@example.com',
            memberships: [{groupId: 4}, {groupId: 5}]
        });

        req.member = true;
        req.user.canEdit = true;
        loadGroup(req, next);
    }

    function loadGroup(req, next) {
        var Group = compound.models.Group;
        var host = req.headers.host;
        Group.findOne({where: { url: host }}, function (err, group) {
            if (err) {
                return next(err);
            }
            if (!group) {
                return next(new Error('404'));
            }
            req.group = group.match(req.url);
            if (!(req.group instanceof Group)) {
                Group.find(req.group.id, function (err, group) {
                    req.group = group;
                    next();
                });
            } else {
                next();
            }
        });
    }
};

co.controllers.widgetsCommonController = function () {
    return WidgetsCommonController;

    function WidgetsCommonController(init) {
        init.layout('widgets');

        init.before('init env', function (c) {
            if (c.params.action !== 'settings' && !c.body.token &&
            c.body.token !== 'test') {
                return next(403, 'Unauthorized');
            }
            this.inlineEditAllowed = true;
            var data = JSON.parse(c.body.data);
            this.page = new c.Page(c.data.page);
            this.widget = this.page.widgets[data.widgetId];
            this.user = c.req.user || new c.User(data.user);
            this.data = data.data;
            this.canEdit = true;
            c.next();
        });
    }
};
