var express = require('express');
var co = require('compound');
var fs = require('fs');
var WidgetAPI = require('./api/widget');
var ImportStreamAPI = require('./api/importStream');
var HooksAPI = require('./api/hooks');
var NotificationAPI = require('./api/notification');
var PageAPI = require('./api/page');
var ErrorsAPI = require('./api/errors');

exports.HatchPlatform = function HatchPlatform(app) {
    this.api = {app: app}; // temp stub hatch api
    this.__defineGetter__('app', function () { return app} );
    this.__defineGetter__('compound', function () { return app.compound});
    this.grids = {};
    this.modules = {};

    var gridsDir = app.root + '/app/grids';
    fs.readdirSync(gridsDir).forEach(function (file) {
        this.grids[file.replace(/\.ejs$/, '')] = fs.readFileSync(
            app.root + '/app/grids/' + file
        ).toString().split('\n\n')
    }.bind(this));

    app.__defineGetter__('config', function () { return app.settings });

    this.widget = new WidgetAPI(this);
    this.importStream = new ImportStreamAPI(this);
    this.hooks = new HooksAPI(this);
    this.notification = new NotificationAPI(this);
    this.page = new PageAPI(this);
    this.errors = new ErrorsAPI(this);
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
        var module = compound.hatch.modules[m];
        if (module) {
            return module.compound.map.pathTo;
        } else {
            return {};
        }
    };

    compound.controllerExtensions.specialPagePath = function (type, params) {
        var sp = compound.hatch.page.get(type);
        if (!sp) return '';
        return sp.path(this.req.group, params);
    };

    compound.on('structure', loadCommonStuff);

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

        mod.compound.on('structure', loadCommonStuff);

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
                Object.keys(structure.controllers).forEach(function (name) {
                    if (name.match(/widgets\/.*?_controller/) &&
                        name !== 'widgets/common_controller' &&
                        !structure.controllers[name].match(/load\(['"]widgets\/common['"]\)/)) {
                        structure.controllers[name] = 'load(\'widgets/common\');\n' + structure.controllers[name];

                    }
                });
                structure.controllers['widgets/common_controller'] = compound.structure.controllers['widgets_common_controller'];
                structure.views['layouts/widgets_layout'] = compound.structure.views['layouts/widgets_layout'];
                if (structure.helpers['application_helper']) {
                    var source = compound.structure.helpers['widgets_common_helper'];
                    var destination = structure.helpers['application_helper'];
                    Object.keys(source).forEach(function (helperName) {
                        destination[helperName] = source[helperName];
                    });
                } else {
                    structure.helpers['application_helper'] = compound.structure.helpers['widgets_common_helper'];
                }
            });

        }

        var pagesPath = modPath + '/app/pages/';
        if (fs.existsSync(pagesPath)) {
            fs.readdirSync(pagesPath).forEach(function (file) {
                var name = file.replace(/\.(js|coffee)$/, '');
                compound.hatch.page.register(name, require(pagesPath + file));
            });
        }
    });

    return mediator;

    // TODO use some common API for adding helpers and controller methods
    function loadCommonStuff(structure) {
        var exts = compound.controllerExtensions;
        if (!structure.helpers.application_helper) {
            structure.helpers.application_helper = {};
        }
        structure.helpers.application_helper.pathFor = exts.pathFor;
        structure.helpers.application_helper.specialPagePath = exts.specialPagePath;
        structure.helpers.application_helper.moduleEnabled = exts.moduleEnabled;
        structure.helpers.application_helper.stripHtml = stripHtml;
    }
};

/**
 * Strip HTML from the specified HTML and return text
 *
 * @param {String} html - html to strip.
 * @param {Number} maxLength - limit to this many characters.
 *
 * @returns {String} - text without html ended with '...' if length was > maxLength
 */
function stripHtml(html, maxLength) {
    var text = (html || '').replace(/(<([^>]+)>)/ig, ' ');
    if(maxLength && maxLength > 0) {
        if(text.length > maxLength) {
            text = text.substring(0, maxLength);
            if(text.lastIndexOf(' ') > -1) text = text.substring(0, text.lastIndexOf(' '));
            text += '...';
        }
    }
    return text.replace(/^\s+|\s+$/g, '');
};

exports.middleware = function (compound) {
    var Group, User;
    var hatch = compound.hatch;

    return function hatchMiddleware(req, res, next) {
        User = compound.models.User;
        Group = compound.models.Group;
        if (req.method === 'POST' && req.body.token) {
            loadEnvForAPI(req, res, next);
            return;
        }
        console.log('Hatch middleware');

        // TODO: unstub user stuff (implement user module)
        req.user = new User({
            email: 'user101@example.com',
            memberships: [{groupId: 4}, {groupId: 5}]
        });

        req.member = true;
        req.user.canEdit = true;
        loadGroup(req, next);
    }

    function loadEnvForAPI(req, res, next) {
        var data = JSON.parse(req.body.data);
        req.user = req.user || new User(data.user);
        req.data = data;

        Group.find(data.groupId, function (err, group) {
            if (err || !group) {
                return gotPage(err || Error('404'));
            }
            req.group = group;
            next();
        });
    }

    function loadGroup(req, next) {
        Group = compound.models.Group;
        var groupId = req.query.groupId;
        if (groupId) {
            Group.find(groupId, gotGroup);
        } else {
            Group.findOne({where: { url: req.headers.host}}, gotGroup);
        }

        function gotGroup(err, group) {
            if (err) {
                return next(err);
            }
            if (!group) {
                return next(new Error('404'));
            }
            if (req.query.groupId) {
                req.group = group;
                return next();
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
        }
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
