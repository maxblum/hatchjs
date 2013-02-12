module.exports = WidgetController;

function WidgetController(init) {

    init.before(function loadPage(c) {
        var Page = c.Page;
        var id = c.req.query.pageId || c.req.params.pageId;
        var widgetId = c.req.query.widgetId || c.req.params.widgetId;
        this.canEdit = c.req.user.canEdit;
        Page.find(id, function (err, page) {
            this.page = c.req.page = page;
            if (widgetId) {
                this.widget = page.widgets[widgetId];
            }
            c.next();
        }.bind(this));
    });
}

WidgetController.prototype.create = function create(c) {
    var page = c.req.page;
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

WidgetController.prototype.update = function (c) {
    var widgetId = parseInt(c.req.params.id, 10);
    c.req.page.performWidgetAction(widgetId, c.req, function (err, res) {
        c.send({
            code: err ? 500 : 200,
            res: res,
            error: err
        });
    });
};

WidgetController.prototype.destroy = function (c) {
    var page = c.req.page;
    page.widgets.remove(parseInt(c.req.param('id'), 10));
    page.save(function() {
        c.send('ok');
    });
};

WidgetController.prototype.settings = function(c) {
    this.widgetCore = c.compound.hatch.widget.getWidget(this.widget.type);
    this.inlineEditAllowed = this.widget.inlineEditAllowed;
    c.render();
};

WidgetController.prototype.configure = function (c) {
    this.widget.settings = c.body;
    this.widget.save(function () {
        c.send('ok');
    });
};

WidgetController.prototype.contrast = function(c) {
};
