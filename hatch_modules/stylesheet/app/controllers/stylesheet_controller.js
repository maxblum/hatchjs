var fs = require('fs');

action(function show() {
    header('Content-Type', 'text/css; charset=UTF-8');

    send(fs.readFileSync(app.parent.parent.root + '/public/stylesheets/theme-cerulean.css'));
});

