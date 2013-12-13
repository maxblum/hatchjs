//
// Hatch.js is a CMS and social website building framework built in Node.js 
// Copyright (C) 2013 Inventures Software Ltd
// 
// This file is part of Hatch.js
// 
// Hatch.js is free software: you can redistribute it and/or modify it under the terms of the
// GNU Affero General Public License as published by the Free Software Foundation, version 3
// 
// Hatch.js is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
// without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
// 
// See the GNU Affero General Public License for more details. You should have received a copy of the GNU
// General Public License along with Hatch.js. If not, see <http://www.gnu.org/licenses/>.
// 
// Authors: Marcus Greenwood, Anatoliy Chakkaev and others
//

'use strict';

var _ = require('underscore');

// Load the required data and populate the locals
function populateLocals(c) {
    var locals = this;
    this.pageName = c.actionName;
    this.sectionName = c.controllerName;
    this._ = _;
    this.req = c.req;
    this.tabs = _.sortBy(c.compound.tabs, 'rank');
    locals.group = c.req.group;
    if (c.req.query.pageId && isNaN(parseInt(c.req.query.pageId, 10))) {
        var url = c.req.query.pageId.replace(/^.*?\//, '/');
        c.req.group.definePage(url, c, function(err, page) {
            c.req.page = page;
            c.next();
        });
    } else if (c.req.query.pageId) {
        c.Page.find(c.req.query.pageId, function (err, page) {
            c.req.page = page;
            c.next();
        });
    } else {
        c.next();
    }
}

// Check whether the current user can manage this group.
function checkPermissions(c) {
    var isAdmin = c.req.user && c.req.user.adminOf(c.req.group);
    if (isAdmin) {
        c.next();
    } else {
        c.redirect('//' + c.req.page.url)
    }
}

// load all of the different content types that have been defined in the app
function loadContentTypes(c) {
    c.locals.contentTypes = c.compound.hatch.contentType.getAll();
    c.locals.editableContentTypes = c.compound.hatch.contentType.getEditable();
    c.next();
}

// setup the default member roles for the app
function loadMemberRoles(c) {
    c.locals.memberRoles = [
        { name: 'members', icon: 'user', filter: 'member' },
        { name: 'editors', icon: 'star', filter: 'editor' },
        { name: 'pending', icon: 'time', filter: 'pending' },
        { name: 'blacklisted', icon: 'flag', filter: 'blacklisted' }
    ];
    c.next();
}

/**
 * Instantiate the admin application base controller. Handles security
 * and loads data required by all of the admin controllers.
 * 
 * @param  {context} init - initialiser.
 */
var Application = function Application(init) {
    init.before(checkPermissions);
    init.before(populateLocals);
    init.before(loadContentTypes);
    init.before(loadMemberRoles);
};

module.exports = Application;

/**
 * Set the active sub-tab and filter tab.
 * 
 * @param {HttpContext} c - context
 */
Application.setActiveTab = function (c) {
    // set the active subtab
    c.locals.subTabs.map(function (tab) {
        if (c.req.originalUrl.split('?')[0] == (c.pathTo[tab.url] || tab.url)) {
            tab.active = true;
        }
    });

    if (c.locals.filterTabs) {
        // set the active subtab
        c.locals.filterTabs.map(function (tab) {
            if (c.req.originalUrl.split('?')[0] == (c.pathTo[tab.url] || tab.url)) {
                tab.active = true;
            }
        });
    }
};
