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
var chrono = require('chrono-node');

module.exports = ContentController;

function ContentController(init) {
    Application.call(this, init);
}

require('util').inherits(ContentController, Application);

ContentController.prototype.index = function (c) {
    c.render();
};


exports._initialize = function () {
    this.extendWith('baseController');
    this.before(function setup(c, next) { c.locals._ = _; next(); });
};

//loads content based on the current filter/critera
function loadContent(c, next) {
    var Content = c.model('Content');

    var cond = {
        groupId: c.group().id
    };

    var limit = parseInt(c.req.query.iDisplayLength || 0, 10);
    var offset = parseInt(c.req.query.iDisplayStart || 0, 10);
    var orderBy = c.req.query.iSortCol_0 > 0 ? (['', 'title', 'tagString', 'createdAt', 'score', ''][c.req.query.iSortCol_0] + ' ' + c.req.query.sSortDir_0.toUpperCase()) : 'createdAt DESC';
    var search = c.req.query.sSearch || c.req.body.search;
    var filter = c.req.query.filter || c.req.body.filter;

    if(filter === 'imported') {
        cond.imported = true;
    } else if(typeof filter === 'string' && filter.indexOf("[native code]") === -1) {
        //filter by tag
        if(!isNaN(filter)) cond['tags:tagId'] = filter;
        //filter by content type
        else cond.type = filter;
    }

    Content.count(cond, function(err, count) {
        //redis fulltext search
        if(search) {
            Content.all({where: cond, fulltext: search, order: orderBy, offset: offset, limit: limit}, function(err, posts) {
                posts.count = count;
                next(posts);
            });
        }
        //no filter, standard query
        else {
            Content.all({where: cond, order: orderBy, offset: offset, limit: limit}, function(err, posts) {
                posts.count = count;
                next(posts);
            });
        }
    });
}

//TODO: show content
exports.index = function(c) {
    c.req.session.adminSection = 'content';
    c.locals.filter = c.params.filter;
    c.render('content/index');
};

//loads all of the content and returns json
exports.load = function(c) {
    loadContent(c, function(posts) {
        posts = fixDates(posts);

        //json response
        c.send({
            sEcho: c.req.query.sEcho || 1,
            iTotalRecords: posts.count,
            iTotalDisplayRecords: posts.countBeforeLimit || 0,
            aaData: posts
        });
    });

    //nicely formats the dates
    function fixDates(posts) {
        posts.forEach(function(post) {
            post.createdAt = moment(post.createdAt || new Date()).fromNow();
        });

        return posts;
    }
}

//shows the edit blog post form
exports.edit = function(c) {
    var Content = c.model('Content');
    var post = {};

    if(c.req.params.id) {
        Content.find(c.params.id, function(err, content) {
            post = content;
            post.createdAt = moment(post.createdAt || new Date().toString()).format("D-MMM-YYYY HH:mm:ss");
            done();
        });
    }
    else {
        done();
    }

    function done() {
        c.locals._ = _;
        c.locals.post = post;
        c.render('content/edit');
    }
};

//saves a content record
exports.save = function(c) {
    var Content = c.model('Content');
    var id = c.req.body.id;
    var group = c.req.group;
    var post = null;
    var data = c.body;
    var createdAt = null;

    //parse the date
    if(data.createdAt && ['now', 'immediately'].join(',').indexOf((data.createdAt || '').toString().toLowerCase()) > -1) createdAt = new Date();
    else {
        createdAt = new Date(data.createdAt);
        if(createdAt.toString() == new Date('invalid').toString()) createdAt = chrono.parseDate(data.createdAt);
    }
    data.createdAt = createdAt;
    data.updatedAt = new Date();

    //validate dates
    if(!data.createdAt) {
        return c.send({
            message: 'Please enter a valid publish date',
            status: 'error',
            icon: 'warning-sign'
        });
    }

    //validate title and text
    if(!data.title || !data.text) {
        return c.send({
            message: 'Please enter a title and some text',
            status: 'error',
            icon: 'warning-sign'
        });
    }

    //build the tags json
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

    //build the tag string
    data.tagString = _.pluck(data.tags, 'name').join(', ');

    //update existing content
    if(id) {
        Content.find(id, function(err, content) {
            post = content;

            //merge tag scores/createdAt from the existing post
            tags.forEach(function(tag) {
                var existing = _.find(content.tags, function(existingTag) { return existingTag.name == tag.name });
                if(existing) {
                    tag.createdAt = existing.createdAt;
                    tag.score = existing.score;
                }
            });

            //update the keys manually
            Object.keys(data).forEach(function(key) {
                content[key] = data[key];
            });

            content.save(function (err, content) {
                done();
            });
        });
    }
    //create new content
    else {
        //set the groupId and authorId for the new post
        data.groupId = group.id;
        data.authorId = c.req.user.id;
        data.score = 0;

        Content.create(data, function(err, content) {
            post = content;

            done();
        });
    }

    function done() {
        //finally, update the group tag counts
        group.recalculateTagContentCounts(c);

        c.send({
            post: post,
            message: 'Post saved successfully',
            status: 'success',
            icon: 'ok'
        });
    }
};

//deletes a content record
exports.delete = function(c) {
    var group = c.req.group;
    var Content = c.model('Content');

    Content.find(c.params.id, function(err, content) {
        content.destroy(function(err) {
            //finally, update the group tag counts
            group.recalculateTagContentCounts(c);

            c.send('ok');
        });
    });
};

//deletes multiple content records
exports.deleteMulti = function(c) {
    var Content = c.model('Content');
    var group = c.req.group;
    var selectedContent = c.body.selectedContent || [];
    var unselectedContent = c.body.unselectedContent || [];
    var count = 0;

    if(selectedContent.indexOf("all") > -1) {
        loadContent(c, function(posts) {
            selectedContent = _.pluck(posts, 'id');
            selectedContent = _.filter(selectedContent, function(id) { return unselectedContent.indexOf(id) == -1; });

            deleteSelectedContent(selectedContent);
        });
    }
    else {
        deleteSelectedContent(selectedContent);
    }

    function deleteSelectedContent(selectedContent) {
        async.forEach(selectedContent, function(id, next) {
            Content.find(id, function(err, content) {
                if(!content) return next();

                content.destroy(function(err) {
                    count++;
                    next();
                });
            });
        }, function() {
            //finally, update the group tag counts
            group.recalculateTagContentCounts(c);

            c.send({
                message: count + ' posts deleted',
                status: 'success',
                icon: 'ok'
            });
        });
    }
};

//shows the manage tags screen
exports.manageTags = function(c) {
    c.render('content/managetags');
};

//edits a tag
exports.editTag = function(c) {
    c.locals.tag = c.params.id ? _.find(c.req.group.tags, function(tag) { return tag.id == c.params.id; }) : {};
    c.locals.defaultFilter = 'filter = function(content) {\n\treturn false; //add your filter criteria here\n};';
    c.render('content/edittag');
};

//saves a tag
exports.saveTag = function(c) {
    //validate
    if(!c.body.name) {
        return c.send({
            message: 'Please enter a tag name',
            status: 'error',
            icon: 'warning-sign'
        });
    }

    var group = c.req.group;
    var tag = _.find(group.tags, function(tag) { return tag.id.toString() === c.body.id.toString(); });

    if(!tag) {
        if(!group.tags) group.tags = [];
        tag = { id: group.tags.length, contentCount: 0 };
        group.tags.push(tag);
    }

    //update tag
    tag.name = c.body.name;
    tag.description = c.body.description;
    tag.filter = c.body.filterEnabled ? c.body.filter : null;

    //save the group
    group.save(function() {
        //add the existing content async
        if(c.body.filterExisting) {
            group.getContentForTag(tag, function(posts) {
                async.forEach(posts, function(content, next) {
                    if(!content.tags) content.tags = [];

                    //if not already in this tag, add it
                    if(!_.find(content.tags, function(t) { return t.tagId == tag.id; })) {
                        content.tags.push({
                            tagId: tag.id,
                            name: tag.name,
                            createdAt: new Date(),
                            score: 0
                        });

                        //save and forget
                        content.save(next);
                    }
                }, function() {
                    //recalc tag counts
                    group.recalculateTagContentCounts();
                });
            });
        }

        c.send({
            message: 'Tag saved successfully',
            status: 'success',
            icon: 'ok'
        });
    });
};

//shows how many posts match this filter
exports.tagFilterCount = function(c) {
    var group = c.group();
    var tag = group.tags[c.params.id];
    if(!tag) tag = {};

    if(c.body.filter) tag.filter = c.body.filter;

    //count the number of posts matched
    group.getContentForTag(tag, function(posts) {
        c.send(posts.length.toString());
    });
};

//deletes a tag from the group
exports.deleteTag = function(c) {
    c.req.group.deleteTag(c.params.id);
    c.send({ redirect: c.pathTo.manageTags() });
};

//adds a tag to the specified posts
exports.addTags = function(c) {
    var Content = c.model('Content');
    var group = c.req.group;
    var selectedContent = c.body.selectedContent || [];
    var unselectedContent = c.body.unselectedContent || [];
    var count = 0;

    if(selectedContent.indexOf("all") > -1) {
        loadContent(c, function(posts) {
            selectedContent = _.pluck(posts, 'id');
            selectedContent = _.filter(selectedContent, function(id) { return unselectedContent.indexOf(id) == -1; });

            addTag(selectedContent);
        });
    }
    else {
        addTag(selectedContent);
    }

    function addTag(selectedContent) {
        async.forEach(selectedContent, function(id, next) {
            Content.find(id, function(err, content) {
                if(!content) return next();

                if(!content.tags) content.tags = [];
                if(!_.find(content.tags, function(tag) { return tag.tagId == c.params.id; })) {
                    var tag = _.find(group.tags, function(tag) { return tag.id == c.params.id; });
                    content.tags.push({
                        tagId: tag.id,
                        name: tag.name,
                        createdAt: new Date(),
                        score: 0
                    });

                    content.save(function(err) {
                        count++;
                        next();
                    });
                }
                else next();
            });
        }, function() {
            //finally, update the group tag counts
            group.recalculateTagContentCounts(c);

            c.send({
                message: count + ' posts tagged',
                status: 'success',
                icon: 'ok'
            });
        });
    }
};

//removes a tag from the specified posts
exports.removeTags = function(c) {
    var Content = c.model('Content');
    var group = c.req.group;
    var selectedContent = c.body.selectedContent || [];
    var unselectedContent = c.body.unselectedContent || [];
    var count = 0;

    if(selectedContent.indexOf("all") > -1) {
        loadContent(c, function(posts) {
            selectedContent = _.pluck(posts, 'id');
            selectedContent = _.filter(selectedContent, function(id) { return unselectedContent.indexOf(id) == -1; });

            removeTag(selectedContent);
        });
    }
    else {
        removeTag(selectedContent);
    }

    function removeTag(selectedContent) {
        async.forEach(selectedContent, function(id, next) {
            Content.find(id, function(err, content) {
                if(!content) return next();

                if(!content.tags) content.tags = [];
                if(_.find(content.tags, function(tag) { return tag.tagId.toString() == c.params.id.toString(); })) {
                    //remove the specified tag
                    content.tags = _.reject(content.tags, function(tag) { return tag.tagId.toString() == c.params.id.toString(); });

                    content.save(function(err) {
                        count++;
                        next();
                    });
                }
                else next();
            });
        }, function() {
            //finally, update the group tag counts
            group.recalculateTagContentCounts(c);

            c.send({
                message: count + ' posts un-tagged',
                status: 'success',
                icon: 'ok'
            });
        });
    }
};

//shows the import streams
exports.streams = function(c) {
    var ImportStream = c.model('ImportStream');

    ImportStream.all({ where: { groupId: c.req.group.id }}, function(err, streams) {
        c.locals.streams = streams;
        c.locals.importers = c.api.importStream.getImporters();
        c.render('content/streams');
    });
};

//edits an import stream
exports.editStream = function(c) {
    var ImportStream = c.model('ImportStream');

    if(c.params.id) {
        ImportStream.find(c.params.id, function(err, stream) {
            c.locals.stream = stream;
            c.locals.importers = c.api.importStream.getImporters();
            c.render('content/editstream');
        });
    }
    else {
        c.locals.stream = {};
        c.locals.importers = c.api.importStream.getImporters();
        c.render('content/editstream');
    }
};

//saves a stream
exports.saveStream = function(c) {
    var ImportStream = c.model('ImportStream');

    //validate
    if(!c.body.title || !c.body.query) {
        return c.send({
            message: 'Please enter a title and a query',
            status: 'error',
            icon: 'warning-sign'
        });
    }

    //create stream data
    var stream = {}

    if(!stream) {
        if(!group.importStreams) group.importStreams = [];
        stream = { id: group.importStreams.length, contentCount: 0, enabled: true };
        group.importStreams.push(stream);
    }

    //update stream
    stream.id = c.body.id;
    stream.groupId = c.req.group.id;
    stream.type = c.body.type;
    stream.title = c.body.title;
    stream.query = c.body.query;
    stream.interval = c.body.interval;
    stream.tags = [];

    //new streams should be enabled by default
    if(!stream.id) stream.enabled = true;

    (c.body.tags || []).forEach(function(tag) {
        stream.tags.push({
            tagId: c.req.group.getTag(tag).id,
            name: tag,
            createdAt: new Date(),
            score: 0
        });
    });

    //save the stream
    if(stream.id) {
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

//deletes a stream from the group
exports.deleteStream = function(c) {
    var ImportStream = c.model('ImportStream');
    ImportStream.find(c.params.id, function(err, stream) {
        stream.destroy(function() {
            c.send({ redirect: c.pathTo.streams() });
        });
    });
};

//pauses or unpauses a stream
exports.toggleStream = function(c) {
    var ImportStream = c.model('ImportStream');
    ImportStream.find(c.params.id, function(err, stream) {
        stream.enabled = !stream.enabled;
        stream.save(function() {
            c.send({ redirect: c.pathTo.streams() });
        });
    });
};
