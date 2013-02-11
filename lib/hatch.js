var express = require('express');
var fs = require('fs');

exports.HatchPlatform = function HatchPlatform(app) {
    this.api = {app: app}; // temp stub hatch api
    this.grids = {};
    this.modules = {};

    var gridsDir = app.root + '/app/grids';
    fs.readdirSync(gridsDir).forEach(function (file) {
        this.grids[file.replace(/\.ejs$/, '')] = fs.readFileSync(
            app.root + '/app/grids/' + file
        ).toString().split('\n\n')
    }.bind(this));

    app.config = {};
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
    compound.on('structure', function (s) {
        if (!s.helpers.application_helper) {
            s.helpers.application_helper = {};
        }
        s.helpers.application_helper.pathFor = compound.controllerExtensions.pathFor;
        s.helpers.application_helper.moduleEnabled = compound.controllerExtensions.moduleEnabled;
    });

    fs.readdirSync(compound.root + '/hatch_modules').forEach(function (m) {
        var mod = require(compound.root + '/hatch_modules/' + m)();
        if (mod.compound.parent) {
            return;
        }
        mod.compound.parent = compound;
        compound.hatch.modules[m] = mod;
        mod.compound.models = mod.models = compound.models;
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
            mod.stack[gotRouter] = {
                route: '',
                handle: exports.middleware(compound)
            };
        });

        mediator.use('/' + m, mod);
    });
    return mediator;
};

exports.middleware = function (compound) {

    return function hatchMiddleware(req, res, next) {

        var Group = compound.models.Group;
        var User = compound.models.User;

        req.user = new User({
            email: 'user101@example.com',
            memberships: [{groupId: 4}, {groupId: 5}]
        });

        req.member = true;
        req.user.canEdit = true;

        // load root group
        var host = req.headers.host;
        Group.findOne({where: { url: host }}, function (err, group) {
            if (err) {
                return next(err);
            }
            if (!group) {
                return next(new Error('404'));
            }
            req.group = group.match(req.url);
            // if (req.group && req.url.match(/\/on\//)) {
                // req.url = '/on/' + req.url.split('/on/')[1];
            // }
            if (!(req.group instanceof Group)) {
                console.log('finding group');
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
