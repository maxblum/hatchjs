
exports.titleToAnchor = function (title) {
    return title.toLowerCase()
        .replace(/[^-a-zA-Z0-9\s]+/ig, '')
        .replace(/\s/gi, "-");
};

exports.escape = function (string) {
    return JSON.stringify(string);
};

