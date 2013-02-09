module.exports = WidgetController;

function WidgetController(init) {

    init.before(function loadPage(c) {
        var Page = c.Page;
        Page.find(c.req.query.pageId, function (err, page) {
            c.req.page = page;
            c.next();
        });
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
                html: html,
                widget: w
            });
        });
    });

};

WidgetController.prototype.update = function (c) {
    c.send('ok');
};

WidgetController.prototype.destroy = function (c) {
    var page = c.req.page;
    page.widgets.remove(parseInt(c.req.param('id'), 10));
    page.save(function() {
        c.send('ok');
    });
};
