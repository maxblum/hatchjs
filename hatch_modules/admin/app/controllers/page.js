//
// Hatch.js is a CMS and social website building framework built in Node.js 
// Copyright (C) 2013 Inventures Software Ltd
// 
// This file is part of Hatch.js
// 
// Hatch.js is free software: you can redistribute it and/or modify it under the terms of the
// GNU General Public License as published by the Free Software Foundation, version 3
// 
// Hatch.js is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
// without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
// 
// See the GNU General Public License for more details. You should have received a copy of the GNU
// General Public License along with Hatch.js. If not, see <http://www.gnu.org/licenses/>.
// 
// Authors: Marcus Greenwood, Anatoliy Chakkaev and others
//

var _ = require('underscore');

var Application = require('./application');

module.exports = PageController;

function PageController(init) {
    Application.call(this, init);

    init.before(function loadPage(c) {
        var Page = c.Page;
        Page.find(c.req.query.pageId, function (err, page) {
            c.req.page = page;
            page.grid = page.grid || '02-two-columns';
            c.next();
        });
    });
}

require('util').inherits(PageController, Application);

//shows the edit console
PageController.prototype.editconsole = function editConsole(c) {
    c.req.widgets = [];
    var groupModulesIndex = {};
    var tab = c.req.query.tab || '';

    c.req.group.modules.forEach(function (m) {
        if (m) groupModulesIndex[m.name] = m;
    });

    // c.api.widget.getWidgets().forEach(function (w) {
    //     if (groupModulesIndex[w.module]) {
    //         c.req.widgets.push({
    //             name: w.name,
    //             module: w.module,
    //             info: w.widget.info
    //         });
    //     }
    // });
    c.req.widgets.push({
        name: 'static',
        module: 'admin',
        info: {
            title: 'Static content',
            icon: 'icon-edit',
            settings: {
                fields: {
                    anchor: {
                        type: 'checkbox',
                        title: 'Create anchor link'
                    }
                }
            }
        }
    });

    c.req.grids = [];
    var hatch = c.app.parent.parent.compound.hatch;
    Object.keys(hatch.grids).forEach(function (name) {
        c.req.grids.push({
            name: name,
            html: hatch.grids[name][0],
            preview: hatch.grids[name][1]
        });
    });

    //load the template pages and then render
    var Page = c.Page;

    Page.all({ where: { groupId: c.req.group.id, type: 'template' }}, function (err, templates) {
        c.templates = templates;
        // c.locals.themes = c.api.themes.getThemes();
        c.render('editconsole' + tab, { layout : false, req: c.req, templates: templates, themes: [] });
    });

};

//updates the widgets in the grid
PageController.prototype.updateGrid = function updateGrid() {
    var Page = this.model('Page');
    var page = this.req.page;
    var ctx = this;
    var oldTemplateId = page.templateId;

    page.templateId = this.body.grid == null ? this.body.templateId : 0;
    page.grid = this.body.grid;

    var grid = this.api.layout.getLayoutGrid(this.body.grid || '02-two-columns');

    if (typeof page.columns === 'string') {
        page.columns = JSON.parse(page.columns);
    }

    page.columns.forEach(function (col) {
        col.size = false;
    });

    //if we are modifying a page which doesn't yet exist in the database (default special page), use the createPage function instead of save
    if(!page.id) {
        page.save = function(done) {
            Page.createPage(page, done);
        }
    }

    //save the page and re-render the column contents
    page.save(function (err, newPage) {
        if(err) throw err;
        page = newPage;

        if(page.templateId) {
            Page.find(page.templateId, function(err, template) {
                page.mergeTemplate(template);
                render();
            });
        }
        else if(oldTemplateId) {
            //if we're switching from a template to no template, copy the widgets from the template header onto the page
            Page.find(oldTemplateId, function(err, template) {
                page.reload(function(err, reloadedPage) {
                    page = reloadedPage;

                    var header = template.columns[0];
                    delete page.columns[0].fromTemplate;

                    if(_.filter(page.widgets, function(widget) { return widget && page.columns[0].widgets.indexOf(widget.id) > -1; })) {
                        template.widgets.forEach(function(widget) {
                            if(header.widgets.indexOf(widget.id) == -1) return;

                            widget.id = page.widgets.length;
                            page.widgets.push(widget);
                            page.columns[0].widgets.push(widget.id);
                        });
                    }

                    page.save(function(err) {
                        render();
                    });
                });
            });
        }
        else render();
    });

    function render() {
        Page.find(page.id, function(err, page) {
            page.render(grid.html, ctx, function (html) {
                ctx.send({html: html});
            });        
        });
    }
};

//updates the column widths
exports.updateColumns = function updateColumns() {
    var page = this.req.page;
    page.columns = JSON.parse(this.body.widgets);
    page.save(function (err) {
        this.send('ok');
    }.bind(this));
};

//shows the richtext insert image modal dialog
exports.image = function(c) {
    //load this user's media
    var Media = c.model('Media');

    Media.all({where: { userId: c.req.user.id, type: 'image'}, order: 'createdAt DESC'}, function(err, images) {
        c.locals.images = images;
        c.render('page/image', { layout: false });
    });
};

//searches for images on google
exports.imageSearch = function(c) {
    var googleImages = require('google-images');
    googleImages.search(c.req.body.query, function(err, images) {
        c.send(images);
    });
};

//shows the richtext link modal dialog
exports.link = function(c) {
    c.render('page/link', { layout: false });
};

//searches for links on google
exports.linkSearch = function(c) {
    var google = require('google');
    google(c.req.body.query, function(err, next, links) {
        c.send(links);
    });
};
