layout('widgets');

before('init env', function () {
    if (params.action !== 'settings' && !body.token && body.token !== 'test') {
        return next(403, 'Unauthorized');
    }
    var locals = this;
    this.inlineEditAllowed = true;
    var data = JSON.parse(body.data);
    this.user = req.user || new User(data.user);
    this.data = data.data;
    this.canEdit = true;

    if (data.pageId) {
        Page.find(data.pageId, gotPage);
    } else {
        Group.find(data.groupId, function (err, group) {
            if (err || !group) {
                return gotPage(err || Error('404'));
            }
            console.log('definePage');
            group.definePage(data.pageUrl.replace(/^.*?\//, ''), gotPage);
        });
    }
    function gotPage(err, page) {
        if (err || !page) {
            return next(err || new Error('404'));
        }
        locals.page = page;
        locals.widget = locals.page.widgets[data.widgetId];
        locals.widget.settings = locals.widget.settings || {};
        next();
    }
});

action(function show() {
    render();
});
