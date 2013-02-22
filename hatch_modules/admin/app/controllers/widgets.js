module.exports = WidgetController;

function WidgetController(init) {

    init.before(function loadPage(c) {
        var id = c.req.query.pageId || c.req.params.pageId;
        var widgetId = c.req.query.widgetId || c.req.params.widgetId;
        this.canEdit = c.req.user.canEdit;
        c.Page.find(id, function (err, page) {
            this.page = c.req.page = page;
            if (widgetId) {
                this.widget = page.widgets[widgetId];
            }
            c.next();
        }.bind(this));
    });

}

WidgetController.prototype.create = function create(c) {
    var page = this.page;
    var type = c.body.addWidget;
    var widget = {type: type, settings: {}};
    var w = page.widgets.push(widget);
    w.save(function () {
        page.renderWidget(w, c.req, function (err, html) {
            c.send({
                code: err ? 500 : 200,
                html: html,
                widget: w,
                error: err
            });
        });
    });

};

WidgetController.prototype.render = function render(c) {
    this.page.renderWidget(this.widget, c.req, function (err, html) {
        c.send(html);
    });
};

WidgetController.prototype.update = function update(c) {
    var widgetId = parseInt(c.req.params.id, 10);
    this.page.performWidgetAction(widgetId, c.req, function (err, res) {
        c.send({
            code: err ? 500 : 200,
            res: res,
            error: err
        });
    });
};

WidgetController.prototype.destroy = function destroy(c) {
    var page = this.page;
    page.widgets.remove(parseInt(c.req.param('id'), 10));
    page.save(function() {
        // TODO: normalize widget response [API]
        c.send('ok');
    });
};

WidgetController.prototype.settings = function settings(c) {
    this.widgetCore = c.compound.hatch.widget.getWidget(this.widget.type);
    var s = this.widgetCore.info.settings;
    if (s && s.custom) {
        this.page.widgetAction(this.widget.id, 'settings', null, c.req, function (e, s) {
            c.send(s);
        });
    } else {
        this.inlineEditAllowed = this.widget.inlineEditAllowed;
        c.render();
    }
};

WidgetController.prototype.configure = function configure(c) {
    var settings = this.widget.settings;
    Object.keys(c.body).forEach(function(key) {
        settings[key] = c.body[key];
    });
    this.widget.save(function () {
        // TODO: normalize widget response [API]
        c.send('ok');
    });
};

WidgetController.prototype.contrast = function contrast(c) {
    var map = { 0: 1, 1: 2, 2: 0 };
    var settings = this.widget.settings;
    settings.contrastMode = map[(settings.contrastMode || 0)];
    this.widget.save(function() {
        // TODO: normalize widget response [API]
        c.send('ok');
    });
};

WidgetController.prototype.__missingAction = function __missingAction(c) {
    this.page.widgetAction(this.widget.id, c.requestedActionName, c.req.body, c.req, function (err, res) {
        c.send({
            code: err ? 500 : 200,
            res: res,
            error: err
        });
    });
};
