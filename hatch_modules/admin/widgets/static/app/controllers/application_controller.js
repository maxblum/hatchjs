
before('init widget', function () {
    this.inlineEditAllowed = true;
    var data = JSON.parse(body.data);
    this.widget;
    data.page.widgets.forEach(function (w) {
        if (w.id == data.widgetId) {
            this.widget = w;
        }
    }.bind(this));
    next();
});
