module.exports = WidgetController;

function WidgetController() {
}

WidgetController.prototype.create = function create(c) {
    var Page = c.Page;
    Page.find(c.req.query.pageId, function (err, page) {
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
    });

};

WidgetController.prototype.update = function (c) {
    c.send('hello');
};
