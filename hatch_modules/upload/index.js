var Compound = require('compound').Compound;
var db = require('jugglingdb');
var express = require('express');

module.exports = function instantiateModule() {
    var server = express();
    server.configure(function() {
    });

    new Compound(server, __dirname)
    .on('routes', function (map) {
        map.post('add', 'upload#create');
    })
    .on('structure', function (structure) {
        structure.controllers.upload = require('./controller');
    });
    return server;
};
