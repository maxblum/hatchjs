
exports.__ = function (s) {
    return s;
};

exports._ = require('underscore');

exports.widgetAction = function (s, type) {
    return '/do/' + (type || this.widget.type).replace('/', '/widgets/') + '/' + s;
};

exports.widgetCoreAction = function (s) {
    return ['/do/admin/widget', this.page.id, this.widget.id, s].join('/');
};
