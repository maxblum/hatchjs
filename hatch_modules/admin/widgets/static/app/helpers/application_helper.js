
exports.__ = function (s) {
    return s;
};

exports.widgetAction = function (s) {
    return '/on/' + this.widget.type + '/widget/' + s;
};
