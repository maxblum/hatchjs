//
// Hatch.js is a CMS and social website building framework built in Node.js
// Copyright (C) 2013 Inventures Software Ltd
//
// This file is part of Hatch.js
//
// Hatch.js is free software: you can redistribute it and/or modify it under the
// terms of the GNU Affero General Public License as published by the Free Software
// Foundation, version 3
//
// Hatch.js is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
// A PARTICULAR PURPOSE.
//
// See the GNU Affero General Public License for more details. You should have received
// a copy of the GNU General Public License along with Hatch.js. If not, see
// <http://www.gnu.org/licenses/>.
//
// Authors: Marcus Greenwood, Anatoliy Chakkaev and others
//

var Application = require('./application');
var _ = require('underscore');
var async = require('async');
var moment = require('moment');

module.exports = ContentController;

function ContentController(init) {
    Application.call(this, init);
    init.before(setDateTimeFormat);
    init.before(loadTags);
    init.before(findContent);
    init.before(function (c) {
        this.sectionName = 'content';
        c.next();
    });
}

require('util').inherits(ContentController, Application);

// Load the content tags for this group to display on the left navigation
function loadTags(c) {
    c.Tag.all({ where: { groupIdByType: c.req.group.id + '-Content' }}, function (err, tags) {
        delete tags.countBeforeLimit;
        c.locals.tags = tags;
        c.next();
    });
}

function setDateTimeFormat (c) {
    c.locals.datetimeformat = c.app.get('datetimeformat');
    c.next();
}

// Render a content type input form which is defined in the contentType API
function renderInputForm(c, next) {
    var type = c.locals.post.type;
    var contentType = c.compound.hatch.contentType.getContentType(type);

    c.prepareViewContext();
    c.locals.editForm = c.renderContent(c.locals.post, 'editForm');

    next();
}

// Load content based on the current filter/critera
function loadContent(c, callback) {
    var cond = {
        groupId: c.req.group.id
    };

    // filter by tag or content type
    var filterBy = c.req.query.filterBy || c.req.body.filterBy;
    if (filterBy) {
        if (!isNaN(parseInt(filterBy, 10))) {
            cond = {
                tags: filterBy
            }
        } else if (filterBy !== 'all') {
            cond.type = filterBy;
        }
    }

    var query = c.req.query;
    var limit = parseInt(query.iDisplayLength || query.limit || 10, 10);
    var offset = parseInt(query.iDisplayStart || query.offset || 0, 10);
    var colNames = ['', 'title', 'tagNames', 'createdAt', 'score', ''];
    var search = query.sSearch || c.req.body.search;
    var orderBy = query.iSortCol_0 > 0 ?
        (colNames[query.iSortCol_0] + ' ' + query.sSortDir_0.toUpperCase()) :
        null;

    // count the total number of records so that we can show count before filter
    c.Content.count({ groupId: c.req.group.id }, function(err, count) {
        if (err) {
            return callback(err);
        }

        c.Content.all({
            future: true,
            where: cond,
            order: orderBy,
            offset: offset,
            limit: limit,
            fulltext: search
        }, function(err, posts) {
            posts.count = count;
            callback(err, posts);
        });
    });
}

// finds the content record for this function
function findContent (c) {
    var self = this;
    var id = c.req.params.id || c.req.body.id || c.req.query.id;
    var type = (c.req.params.type || c.req.body.type || c.req.query.type || 'Content').toLowerCase();

    if (id) {
        // find the comment or content item for this action
        if (type === 'comment' || type === 'comments') {
            c.Comment.find(id, function (err, post) {
                this.post = c.locals.post = post;
                c.next();
            })
        } else {
            c.Content.find(id, function (err, post) {
                this.post = c.locals.post = post;
                c.next();
            });
        }
    } else {
        c.next();
    }
}

/**
 * Show the content list for this group.
 *
 * @param  {HttpContext} c - http context
 *                       c.limit  - limit to n records
 *                       c.offset - offset to nth record
 *                       c.search - search filter
 */
ContentController.prototype.index = function index(c) {
    c.req.session.adminSection = 'content';
    this.filterBy = c.req.query.filterBy || c.req.params.filterBy || 'all';
    var suffix = 'string' === typeof this.filterBy ? '-' + this.filterBy : '';
    this.pageName = 'content' + suffix;

    c.respondTo(function(format) {
        format.html(function() {
            c.render();
        });
        format.json(function() {
            loadContent(c, function(err, posts) {
                if (err) {
                    return c.send({
                        status: 'error',
                        error: err
                    });
                }

                c.send({
                    sEcho: c.req.query.sEcho || 1,
                    iTotalRecords: posts.count,
                    iTotalDisplayRecords: posts.countBeforeLimit || 0,
                    aaData: posts
                });
            });
        });
    });
};

/**
 * Return only the IDs for a search query. This is used when a user clicks the
 * 'select all' checkbox so that we can get ALL of the ids of the content rather
 * than just the ids of the content on the current page of results.
 *
 * @param  {HttpContext} c - http context
 *                       c.filterBy - filter by type or tag
 *                       c.search   - search filter
 */
ContentController.prototype.ids = function ids(c) {
    c.req.query.limit = 1000000;
    c.req.query.offset = 0;

    loadContent(c, function(err, posts) {
        c.send({
            ids: _.map(posts, function (post) { return parseInt(post.id); })
        });
    });
};

/**
 * Show the new content input form.
 *
 * @param  {HttpContext} c - http context
 *                       c.type - content type
 */
ContentController.prototype.new = function(c) {
    this.post = new c.Content();
    this.post.type = c.req.params.type;
    this.pageName = 'new-' + this.post.type;

    renderInputForm(c, function () {
        c.render();
    });
};

/**
 * Show the edit content input form.
 *
 * @param  {HttpContext} c - http context
 *                       c.id - content item id
 */
ContentController.prototype.edit = function edit(c) {
    renderInputForm(c, function () {
        c.render();
    });
};

/**
 * Create a new content record with the data from the form body.
 *
 * @param  {HttpContext} c - http context
 *                       c.Content - content params
 */
ContentController.prototype.create = function create(c) {
    var group = this.group;
    var data = c.body.Content || c.req.body;

    // set the constructor
    data.constructor = c.Content;

    // set the groupId and authorId for the new post
    data.groupId = group.id;
    data.authorId = c.req.user.id;

    // if there is no date, set to now. otherwise parse with moment to fix format
    if (!data.createdAt) {
        data.createdAt = new Date();
    } else {
        data.createdAt = moment(data.createdAt, c.app.get('datetimeformat')).toDate();
    }

    data.updatedAt = new Date();

    // assign tags to the new object and then save after that
    c.Tag.assignTagsForObject(data, data.Content_tags || data.tags, function () {
        c.Content.create(data, function(err, content) {
            if (err) {
                err.message = 'One or more fields have errors'
                c.sendError(err);
            } else {
                c.flash('info', c.t('models.Content.messages.saved'));
                return c.redirect(c.pathTo.content);
            }
        });
    });
};

/**
 * Update an existing content record with the data from the form body.
 *
 * @param  {HttpContext} c - http context
 *                       c.Content - content params
 */
ContentController.prototype.update = function update(c) {
    var Content = c.Content;
    var id = c.params.id;
    var group = c.req.group;
    var data = c.body.Content || c.req.body;
    var post = this.post;

    // parse the date format with moment
    data.createdAt = moment(data.createdAt, c.app.get('datetimeformat')).toDate();
    data.updatedAt = new Date();

    c.Tag.assignTagsForObject(post, data.Content_tags || data.tags, function () {
        delete data.tags;

        // update the keys manually
        Object.keys(data).forEach(function(key) {
            post[key] = data[key];
        });

        post.save(function (err, content) {
            if (err) {
                var HelperSet = c.compound.helpers.HelperSet;
                var helpers = new HelperSet(c);
                c.send({
                    code: 500,
                    errors: content.errors || err,
                    html: helpers.errorMessagesFor(content)
                });
            } else {
                c.flash('info', c.t('post.saved'));
                c.redirect(c.pathTo.content);
            }
        });
    });
};

/**
 * Delete a single content record.
 *
 * @param  {HttpContext} c - http context
 *                       c.id - content item id
 */
ContentController.prototype.destroy = function(c) {
    var group = c.req.group;

    post.destroy(function(err) {
        // finally, update the group tag counts
        c.Tag.updateCountsForObject(post);
        c.send('ok');
    });
};

/**
 * Delete multiple content records.
 *
 * @param  {HttpContext} c - http context
 *                       c.selectedContent - ids of the content items to delete
 */
ContentController.prototype.destroyAll = function(c) {
    var Content = c.Content;
    var group = c.req.group;
    var selectedContent = c.body.selectedContent || [];
    var count = 0;
    var type = (c.req.params.type || c.req.body.type || c.req.query.type || 'Content').toLowerCase();

    if (type === 'comment' || type === 'comments') {
        async.forEach(selectedContent, function(id, next) {
            Comment.find(id, function(err, comment) {
                if (!comment) {
                    return next();
                }

                comment.destroy(function(err) {
                    count++;
                    next();
                });
            });
        }, function () {
            c.send({
                message: count + ' comments deleted',
                status: 'success',
                icon: 'ok'
            });
        });
    } else {
        async.forEach(selectedContent, function(id, next) {
            Content.find(id, function(err, content) {
                if (!content) {
                    return next();
                }

                content.destroy(function(err) {
                    count++;
                    next();
                });
            });
        }, function() {
            // finally, update the group tag counts
            c.locals.tags.forEach(function (tag) {
                tag.updateCount();
            });

            c.send({
                message: count + ' posts deleted',
                status: 'success',
                icon: 'ok'
            });
        });
    }
};

/**
 * Remove flags from the specified content.
 *
 * @param  {HttpContext} c - http context
 *                       c.id - content item id to unflag
 */
ContentController.prototype.clearFlags = function (c) {
    post.clearFlags(function (err, post) {
        c.send({
            message: 'Flags removed',
            status: 'success',
            icon: 'ok'
        });
    });
};

/**
 * Delete a flagged content item and ban it's author.
 *
 * @param  {HttpContext} c - http context
 *                       c.id - content item id to delete and ban author
 */
ContentController.prototype.deleteAndBan = function (c) {
    post.destroyAndBan(function (err, post) {
        c.send({
            message: 'Content deleted and user banned',
            status: 'success',
            icon: 'ok'
        });
    });
};
