
exports.widgetTitle = function (def) {
    var s = this.widget.settings;
    if (s && s.title || def) {
        return '<h2>' + (s && s.title || def) + '</h2>';
    } else {
        return '';
    }
};

exports.escape = function (s) {
    return JSON.stringify(s).replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
};

exports.titleToAnchor = function (title) {
    return title.toLowerCase()
        .replace(/[^-a-zA-Z0-9\s]+/ig, '')
        .replace(/\s/gi, "-");
};

