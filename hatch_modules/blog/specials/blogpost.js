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

exports.defaultPath = 'blog/:id';

exports.defaultPage = {
    title: 'View blog post',
    grid: '01-one-column',
    columns: [{size: 12, widgets: [1, 2]}, {size: 12, widgets: [3]}],
    widgets: [
        {id: 1, type: 'core-widgets/group-header'},
        {id: 2, type: 'core-widgets/mainmenu'},
        {id: 3, type: 'core-content/permalink-content'}
    ]
};

exports.handler = function (c, callback) {
    if (!c.req.post && parseInt(this.specialPageParams.id)) {
        c.Content.find(this.specialPageParams.id, function (err, post) {
            c.req.post = post;
            callback();
        });
    } else {
        callback();
    }
};

exports.contentType = 'blogpost';

