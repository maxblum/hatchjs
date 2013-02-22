
exports.widgetTitle = function (def) {
    var s = this.widget.settings;
    if (s && s.title || def) {
        return '<h2>' + (s && s.title || def) + '</h2>';
    } else {
        return '';
    }
};

