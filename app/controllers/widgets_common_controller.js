layout('widgets');

before('init env', function () {
    if (params.action !== 'settings' && !body.token && body.token !== 'test') {
        return next(403, 'Unauthorized');
    }
    this.inlineEditAllowed = true;
    var data = JSON.parse(body.data);
    this.page = new Page(data.page);
    this.widget = this.page.widgets[data.widgetId];
    this.user = req.user || new User(data.user);
    this.data = data.data;
    this.canEdit = true;
    next();
});

