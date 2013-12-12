#!/usr/bin/env node

var HatchPlatform = require('./lib/hatch').HatchPlatform;
var createServer = require('compound').createServer;
var cluster = require('cluster');

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
    var app = createServer(params);
    app.compound.hatch = new HatchPlatform(app);
    return app;
};

if (!module.parent) {
    var port = process.env.PORT || 3000;
    var host = process.env.HOST || '0.0.0.0';

    var server = app();

    if (cluster.isMaster && process.env.CLUSTER) {
        // Count the machine's CPUs
        var cpuCount = require('os').cpus().length;

        console.log('Starting Hatch cluster with %d threads', cpuCount);

        // Create a worker for each CPU
        for (var i = 0; i < cpuCount; i += 1) {
            cluster.fork();
        }
    } else {
        server.listen(port, host, function () {
            console.log(
                'Hatch server listening on %s:%d within %s environment',
                host, port, server.set('env')
            );
        });
    }
}

