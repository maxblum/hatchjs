layout('widgets');

before('init env', function (c) {
    if (params.action !== 'settings' && !body.token && body.token !== 'test') {
        return next(403, 'Unauthorized');
    }
    var locals = this;
    locals.inlineEditAllowed = true;
    var data = JSON.parse(body.data);
    locals.user = req.user || new User(data.user);
    locals.data = data.data;
    locals.canEdit = true;

    Group.find(data.groupId, function (err, group) {
        if (err || !group) {
            return gotPage(err || Error('404'));
        }
        group.definePage(data.pageUrl.replace(/^.*?\//, ''), c, gotPage);
    });
    function gotPage(err, page) {
        if (err || !page) {
            return next(err || new Error('404'));
        }
        locals.page = page;
        var wc = data.templateWidget ? 'templateWidgets' : 'widgets';
        locals.widget = page[wc][data.widgetId];
        console.log(data.widgetId, locals.widget);
        if (locals.widget) {
            locals.widget.settings = locals.widget.settings || {};
        }
        next();
    }
});

action(function show() {
    render();
});
