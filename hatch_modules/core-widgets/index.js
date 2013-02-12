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
    return require('compound').createServer(params);
};
