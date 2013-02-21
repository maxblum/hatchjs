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

//load the correct set of pages
exports.init = function (c, params, next) {
    var current = _.find(c.req.group.pagesCache, function(page) { return page.id == c.req.page.id; });

    switch(c.widget.settings.display) {
        case "current":
            c.widget.pages = _.filter(c.req.group.pagesCache, function(page) { return page.parentId == current.parentId; });
            break;
        case "current+below":
            c.widget.pages = _.filter(c.req.group.pagesCache, function(page) { return page.parentId == current.id || page.parentId == current.parentId; });
            break;
        case "below":
            c.widget.pages = _.filter(c.req.group.pagesCache, function(page) { return page.parentId == current.id; });
            break;
        case "all":
        default:
            c.widget.pages = c.req.group.pagesCache;
            break;
    }

    //filter out special pages
    c.widget.pages = _.filter(c.widget.pages, function(page) { return [null, '', 'page', 'home'].indexOf(page.type) > -1; });

    //reduce the level by that of the lowest level page
    var lowest = _.sortBy(c.widget.pages, function(page) { return -page.level; }).pop();
    if(lowest) {
        c.widget.pages = c.widget.pages.map(function(page) {
            var page = _.clone(page);
            page.level -= lowest.level;
            return page;
        });
    }

    next();
};

