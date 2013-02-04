module.exports = function (compound) {

    var express = require('express');
    var app = compound.app;
    var hatch = require(app.root + '/lib/hatch');

    app.configure(function(){
        app.use(compound.assetsCompiler.init());
        app.use(express.static(app.root + '/public', { maxAge: 86400000 }));
        app.set('jsDirectory', '/javascripts/');
        app.set('cssDirectory', '/stylesheets/');
        app.set('cssEngine', 'stylus');
        // make sure you run `npm install browserify uglify-js`
        // app.enable('clientside');
        app.use(express.bodyParser());
        app.use(express.cookieParser('secret'));
        app.use(express.session({secret: 'secret'}));
        app.use(express.methodOverride());
        app.use(hatch.middleware(compound));
        app.use('/on', hatch.modules(compound));
        app.use(app.router);
    });

};
