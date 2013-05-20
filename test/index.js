module.exports = require('should');
require('reds');

process.env.NODE_ENV = 'test';

if (!process.env.TRAVIS) {
    var semicov = require('semicov');
    if (typeof __cov === 'undefined') {
        process.on('exit', function () {
            semicov.report();
        });
    }

    semicov.init('lib', 'Hatch.js Core');
}

var Seed = require('seedjs/lib/seed.js');
var supertest = require('supertest');

var app = require('../')();
var seed = new Seed(app.compound);

before(function(done) {
    var schema = app.compound.orm._schemas[0];
    if (schema.connected) {
        done();
    } else {
        schema.once('connected', done);
    }
});

global.getApp = function(done) {
    var schema = app.compound.models.User.schema;
    delete schema.log;
    schema.adapter.client.flushdb(function() {
        var seed = new Seed(app.compound);
        seed.on('complete', function() {
            if (process.env.DEBUG_REDIS) {
                schema.log = function(x) {
                    console.log(x);
                };
            }
            done();
        });
        seed.plant(app.compound, (app.get('seeds') || app.root + '/db/seeds')+ '/test/');
    });

    return app;
};

global.getClient = function(app) {
    var request = supertest(app);

    return {
        get: function(url) {
            return wrap(request.get(url));
        },
        post: function(url) {
            return wrap(request.post(url));
        }
    };

    function wrap(req) {
        return req
        .set('Host', 'example.com')
        .set('Accept', 'application/json');
    }
};
