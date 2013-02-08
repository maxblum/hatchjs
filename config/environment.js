module.exports = function (compound) {

    var express = require('express');
    var app = compound.app;
    var hatch = require(app.root + '/lib/hatch');

    app.configure(function(){
        app.set('jsDirectory', '/javascripts/');
        app.set('cssDirectory', '/stylesheets/');
        app.set('cssEngine', 'stylus');

        app.use(compound.assetsCompiler.init());
        app.use(express.static(app.root + '/public', { maxAge: 86400000 }));
        app.use(express.bodyParser());
        app.use(express.cookieParser('secret'));
        app.use(express.session({secret: 'secret'}));
        app.use(express.methodOverride());
        app.use('/on', hatch.modules(compound));
        app.use(hatch.middleware(compound));
        app.use(app.router);
        app.use(function (err, req, res, next) {
            if (err.message == '404') {
                res.render(compound.structure.views['common/404']);
            } else {
                console.log(err);
                res.render(compound.structure.views['common/500']);
            }
        });
    });

};
