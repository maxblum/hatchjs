var express = require('express');
var fs = require('fs');

exports.modules = function (compound) {
    var mediator = express();
    fs.readdirSync(compound.root + '/hatch_modules').forEach(function (m) {
        var mod = require(compound.root + '/hatch_modules/' + m)();
        mod.compound.parent = compound;
        mediator.use('/' + m, mod);
    });
    return mediator;
};

exports.middleware = function (compound) {

    return function (req, res, next) {

        var Group = compound.models.Group;

        // load root group
        var host = req.headers.host;
        Group.findOne({where: { url: host }}, function (err, group) {
            req.group = group;
            next();
        });

    }
};
