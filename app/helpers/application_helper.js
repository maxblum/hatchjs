exports.__ = function (s) {
    return s;
};

exports.specialPagePath = function () {
    return '';
};

exports.openGraphTags = function () {
    var req = this.req,
        page = req.page,
        group = req.group,
        content = req.content,
        html = [],
        og = {
            title: content && content.title || page.metaTitle || page.title + ' - ' + group.name,
            description: content && (content.excerpt || exports.stripHtml(req.content.text, 280)) ||
            req.page.metaDescription || req.group.metaDescription,
        url: req.protocol + '://' + (req.content && req.content.url || req.page.url),
        type: req.content && 'article' || 'website',
        site_name: req.group.name
    };

    if (req.content && req.content.previewImage) {
        og['thumbnail'] = req.content && req.content.previewImage;
    }

    var html = [];
    for (var property in og) {
        if (og.hasOwnProperty(property)) {
            html.push('<meta property="og:' + property +
            '" content=' + JSON.stringify(og[property]) + ' />');
        }
    }
    return html.join('\n        ');
};

var javascripts = {
    common: [
        'jquery', 'bootstrap', 'bootstrap-typeahead', 'jquery-easyticker',
        'jquery-hoverintent', 'jquery-blink', 'jquery-valadd',
        'jquery-textarea-autogrow', 'jquery-noty', 'jquery-cookie',
        'jquery-pjax', 'jquery-hovercard', 'jquery-highlight', 'uploader',
        'rails', 'hatch-search', 'hatch', 'hatch-io', 'jquery-zoom',
        'application'
    ],
    privileged: [
        'jquery-ui.min', 'chosen.jquery', 'jquery-rule', 'jquery-datatables',
        'jquery-selectrange', 'jquery-blockui', 'jquery-spectrum',
        'jquery-colorscheme', 'hatch-dragdrop', 'hatch-css-properties',
        'hatch-styleeditor', 'hatch-inline-edit', 'hatch-management',
        'redactor/redactor'
    ],
    all: null
};

javascripts.all = javascripts.common.concat(javascripts.privileged);

exports.javascripts = function () {
    if (exports.isPrivileged.call(this)) {
        return javascripts.all;
    } else {
        return javascripts.public;
    }
}

exports.isPrivileged = function () {
    return !!(this.request.member && this.request.user.canEdit);
};

exports.pageTitle = function () {
    var req = this.req, page = req.page;
    return req.title || page.metaTitle || page.title + " - " + req.group.name;
};
