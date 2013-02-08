#!/usr/bin/env node

/**
 * Server module exports method which returns new instance of application server
 *
 * @param {Object} params - railway/express webserver initialization params.
 * @returns CompoundJS powered express webserver
 */
var app = module.exports = function getServerInstance(params) {
    params = params || {};
    // specify current dir as default root of server
    params.root = params.root || __dirname;
    var app = require('compound').createServer(params);
    var fs = require('fs');
    app.compound.hatch = {
        api: {app: app},
        grids: {},
        modules: {}
    };
    fs.readdirSync(__dirname + '/app/grids').forEach(function (file) {
        app.compound.hatch.grids[file.replace(/\.ejs$/, '')] = fs.readFileSync(
            __dirname + '/app/grids/' + file
        ).toString().split('\n\n')
    });
    app.config = {};
    return app;
};

if (!module.parent) {
    var port = process.env.PORT || 3000;
    var host = process.env.HOST || '0.0.0.0';

    var server = app();
    server.listen(port, host, function () {
        console.log(
            'Compound server listening on %s:%d within %s environment',
            host, port, server.set('env')
        );
    });
}

