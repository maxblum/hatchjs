var _ = require('underscore');
var Widget = require(process.env.HATCH_WIDGETCONTROLLERPATH);

function MainMenuController(init) {
    Widget.call(this, init);
    init.before(setupPages);
}

module.exports = MainMenuController;
require('util').inherits(MainMenuController, Widget);

function setupPages (c) {
    var pages;
    var current = c.req.page;

    switch (this.widget.settings.display) {
        case 'current':
            pages = c.locals.group.pagesCache.filter(function(page) {
                return page.parentId == current.parentId;
            });
            break;
        case 'current+below':
            pages = c.locals.group.pagesCache.filter(function(page) {
                return page.parentId == current.id || page.parentId == current.parentId;
            });
            break;
        case 'below':
            pages = c.locals.group.pagesCache.filter(function(page) {
                return page.parentId == current.id;
            });
            break;
        case 'all':
        case '':
            pages = c.locals.group.pagesCache;
            break;
    }

    // filter out special pages
    pages = pages.filter(function(page) {
        return page && [null, '', 'page', 'home'].indexOf(page.type) > -1;
    });

    // reduce the level by that of the lowest level page
    var lowest = _.sortBy(pages, function(page) {
        return -page.level;
    }).pop();

    if (lowest) {
        pages = pages.map(function(page) {
            page = _.clone(page);
            page.level -= lowest.level;
            return page;
        });
    }

    c.locals.pages = pages;
    c.next();
}