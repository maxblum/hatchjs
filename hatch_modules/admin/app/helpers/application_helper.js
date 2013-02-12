
exports.__ = function (s) {
    return s;
};

exports._ = require('underscore');

exports.widgetAction = function (s, type) {
    return '/on/' + (type || this.widget.type).replace('/', '/widgets/') + '/' + s;
};

exports.widgetCoreAction = function (s) {
    return ['/on/admin/widget', this.page.id, this.widget.id, s].join('/');
};
