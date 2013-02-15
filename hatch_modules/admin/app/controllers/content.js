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

var Application = require('./application');
var _ = require('underscore');
var async = require('async');
var moment = require('moment');

module.exports = ContentController;

function ContentController(init) {
    Application.call(this, init);
}

require('util').inherits(ContentController, Application);

/**
 * GET /group/:group_id/content.format
 * respond to JSON, HTML
 */
ContentController.prototype.index = function index(c) {
    c.req.session.adminSection = 'content';
    this.filter = c.req.query.filter;
    var suffix = 'string' === typeof this.filter ? '-' + this.filter : '';
    this.pageName = 'content' + suffix;

    c.respondTo(function(format) {
        format.html(function() {
            c.render();
        });
        format.json(function() {
            loadContent(c, function(posts) {
                posts.forEach(function(post) {
                    post.createdAt = moment(post.createdAt || new Date()).fromNow();
                });

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

ContentController.prototype.new = function(c) {
    this.post = new c.Content;
    c.render();
};

// Show the edit blog post form
ContentController.prototype.edit = function edit(c) {
    this.pageName = 'content';
    var post = {};

    if (c.req.params.id) {
        c.Content.find(c.params.id, function(err, content) {
            post = content;
            post.createdAt = moment(post.createdAt ||
                new Date().toString()).format("D-MMM-YYYY HH:mm:ss");
            done();
        });
    } else {
        done();
    }

    function done() {
        c.locals._ = _;
        c.locals.post = post;
        c.render();
    }
};

ContentController.prototype.create = function create(c) {
    var group = this.group;
    var data = c.body.Content;

    // TODO: move to model hook (beforeSave)
    data.updatedAt = new Date();

    // set the groupId and authorId for the new post
    data.groupId = group.id;
    data.authorId = c.req.user.id;
    data.score = 0;

    c.Content.create(data, function(err, content) {
        c.respondTo(function(format) {
            format.json(function () {
                console.log(err);
                console.log(content.errors);
                if (err) {
                    var HelperSet = c.compound.helpers.HelperSet;
                    var helpers = new HelperSet(c);
                    c.send({
                        code: 500,
                        errors: content.errors,
                        html: helpers.errorMessagesFor(content)
                    });
                } else {
                    c.send({
                        code: 200,
                        html: c.t('models.Content.messages.saved')
                    });
                }
            });
        });
        group.recalculateTagContentCounts(c);

    });

    function done() {
        c.send({
            message: 'Post saved successfully',
            status: 'success',
            icon: 'ok'
        });
    }
};

// Saves a content record
// TODO: move validation and date parse logic to model
ContentController.prototype.update = function save(c) {
    var Content = c.Content;
    var id = c.req.body.id;
    var group = c.req.group;
    var post = null;
    var data = c.body;

    data.createdAt = data.createdAt;
    data.updatedAt = new Date();

    // validate dates
    if (!data.createdAt) {
        return c.send({
            message: 'Please enter a valid publish date',
            status: 'error',
            icon: 'warning-sign'
        });
    }

    // validate title and text
    if (!data.title || !data.text) {
        return c.send({
            message: 'Please enter a title and some text',
            status: 'error',
            icon: 'warning-sign'
        });
    }

    // build the tags json
    var tags = data.tags || [];
    data.tags = [];

    tags.forEach(function(tag) {
        data.tags.push({
            tagId: group.getTag(tag).id,
            name: tag,
            createdAt: new Date(),
            score: 0
        });
    });

    // build the tag string
    data.tagString = _.pluck(data.tags, 'name').join(', ');

    Content.find(id, function(err, content) {
        post = content;

        // merge tag scores/createdAt from the existing post
        tags.forEach(function(tag) {
            var existing = _.find(content.tags, function(existingTag) {
                return existingTag.name == tag.name
            });
            if (existing) {
                tag.createdAt = existing.createdAt;
                tag.score = existing.score;
            }
        });

        // update the keys manually
        Object.keys(data).forEach(function(key) {
            content[key] = data[key];
        });

        content.save(function (err, content) {
            done();
        });
    });

    function done() {
        // finally, update the group tag counts
        group.recalculateTagContentCounts(c);

        c.send({
            post: post,
            message: 'Post saved successfully',
            status: 'success',
            icon: 'ok'
        });
    }
};

// Delete a content record
ContentController.prototype.destroy = function(c) {
    var group = c.req.group;

    c.Content.find(c.params.id, function(err, content) {
        content.destroy(function(err) {
            // finally, update the group tag counts
            group.recalculateTagContentCounts(c);

            c.send('ok');
        });
    });
};

// Delete multiple content records
// TODO: rename to destroyAll
ContentController.prototype.destroyAll = function(c) {
    var Content = c.Content;
    var group = c.req.group;
    var selectedContent = c.body.selectedContent || [];
    var unselectedContent = c.body.unselectedContent || [];
    var count = 0;

    if (selectedContent.indexOf('all') > -1) {
        loadContent(c, function(posts) {
            selectedContent = _.pluck(posts, 'id');
            selectedContent = _.filter(selectedContent, function(id) {
                return unselectedContent.indexOf(id) == -1;
            });

            deleteSelectedContent(selectedContent);
        });
    } else {
        deleteSelectedContent(selectedContent);
    }

    function deleteSelectedContent(selectedContent) {
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
            group.recalculateTagContentCounts(c);

            c.send({
                message: count + ' posts deleted',
                status: 'success',
                icon: 'ok'
            });
        });
    }
};


// TODO: move streams to another resource controller

// Show the import streams
// TODO: rename to index
ContentController.prototype.streams = function(c) {
    var ImportStream = c.ImportStream;

    ImportStream.all({ where: { groupId: c.req.group.id }}, function(err, streams) {
        this.streams = streams;
        this.importers = c.compound.hatch.importStream.getImporters();
        c.render();
    }.bind(this));
};

// Edit an import stream
// TODO: rename to edit
ContentController.prototype.editStream = function(c) {
    var importStream = c.compound.hatch.importStream;

    if (c.params.id) {
        c.ImportStream.find(c.params.id, function(err, stream) {
            c.locals.stream = stream;
            c.locals.importers = importStream.getImporters();
            c.render();
        });
    } else {
        c.locals.stream = {};
        c.locals.importers = importStream.getImporters();
        c.render();
    }
};

// Save a stream
// TODO: refactor controller method (too big)
// TODO: rename to update
ContentController.prototype.saveStream = function(c) {
    var ImportStream = c.ImportStream;

    // validate
    if (!c.body.title || !c.body.query) {
        return c.send({
            message: 'Please enter a title and a query',
            status: 'error',
            icon: 'warning-sign'
        });
    }

    // create stream data
    var stream = {};

    // TODO: WTF? next if looks unnecessary (never works)
    if (!stream) {
        if (!group.importStreams) {
            group.importStreams = [];
        }
        stream = {
            id: group.importStreams.length,
            contentCount: 0,
            enabled: true
        };
        group.importStreams.push(stream);
    }

    // update stream
    stream.id = c.body.id;
    stream.groupId = c.req.group.id;
    stream.type = c.body.type;
    stream.title = c.body.title;
    stream.query = c.body.query;
    stream.interval = c.body.interval;
    stream.tags = [];

    // new streams should be enabled by default
    if (!stream.id) {
        stream.enabled = true;
    }

    (c.body.tags || []).forEach(function(tag) {
        stream.tags.push({
            tagId: c.req.group.getTag(tag).id,
            name: tag,
            createdAt: new Date(),
            score: 0
        });
    });

    //save the stream
    if (stream.id) {
        ImportStream.find(stream.id, function(err, existing) {
            existing.updateAttributes(stream, done);
        });
    } else {
        ImportStream.create(stream, done);
    }
    
    function done() {
        c.send({
            message: 'Import stream saved successfully',
            status: 'success',
            icon: 'ok'
        });
    }
};

// Delete a stream from the group
// TODO: rename to destroy
ContentController.prototype.deleteStream = function(c) {
    c.ImportStream.find(c.params.id, function(err, stream) {
        stream.destroy(function() {
            c.send({ redirect: c.pathTo.groupContentStreams(c.req.group) });
        });
    });
};

// Pause or unpauses a stream
// TODO: rename to toggle
ContentController.prototype.toggleStream = function(c) {
    c.ImportStream.find(c.params.id, function(err, stream) {
        stream.enabled = !stream.enabled;
        stream.save(function() {
            c.send({ redirect: c.pathTo.groupContentStreams(c.req.group) });
        });
    });
};
