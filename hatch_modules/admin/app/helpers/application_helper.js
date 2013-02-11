
exports.__ = function (s) {
    return s;
};

exports.widgetAction = function (s, type) {
    return '/on/' + (type || this.widget.type).replace('/', '/widgets/') + '/' + s;
};
