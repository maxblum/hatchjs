
exports.__ = function (s) {
    return s;
};

exports._ = require('underscore');

exports.widgetAction = function (s, type) {
    return '/do/' + (type || this.locals.widget.type).replace('/', '/widgets/') + '/' + s;
};

exports.widgetCoreAction = function (s) {
    return ['/do/admin/widget', this.locals.page.id, this.locals.widget.id, s].join('/');
};
