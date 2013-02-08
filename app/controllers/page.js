var Application = require('./application');

module.exports = PageController;

function PageController(init) {
    Application.call(this, init);
}

require('util').inherits(PageController, Application);

PageController.prototype.show = function (c) {
    var Page = c.Page;

    if (!c.req.group) {
        console.log('no group matched');
        return c.next();
    }

    var page = c.req.group.matchPage(c.req.url);
    if (!page) {
        return c.next();
    }

    Page.find(page.id, function (err, page) {

        c.req.page = page;

        page.renderHtml(c.req, function (err, html) {
            if (err) {
                return c.next(err);
            }
            c.render({
                page: html,
                title: page.title,
                req: c.req
            });
        });

    });
};
