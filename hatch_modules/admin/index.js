/**
 * Server module exports method which returns new instance of application
 * server
 *
 * @param {Compound} parent - railway/express parent webserver
 * @returns CompoundJS powered express webserver
 */
var app = module.exports = function getServerInstance(parent) {
    app = require('compound').createServer({root: __dirname});
    app.compound.tabs = [
        { name: 'users',      url: 'community',  rank: 10, icon: 'user' },
        { name: 'content',    url: 'content',    rank: 20, icon: 'align-left' },
        { name: 'pages',      url: 'pages',      rank: 30, icon: 'book' },
        { name: 'group',      url: 'group',      rank: 40, icon: 'cog' },
        { name: 'modules',    url: 'modules',    rank: 50, icon: 'cogs' }
    ];

    if (parent) {
        // setup the content edit forms
        app.compound.on('ready', function() {
            Object.keys(parent.structure.views).forEach(function(key) {
                if(key.indexOf('content/edit/') === 0) {
                    app.compound.structure.views[key] = parent.structure.views[key];
                }
            });
        });

        // register the permissions for this module
        var permissions = require(__dirname + '/config/permissions.yml')[0].permissions;
        parent.hatch.permissions.register(permissions);
    }

    return app;
};
