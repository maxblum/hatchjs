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
var async = require('async');
var moment = require('moment');
var chrono = require('chrono-node');

module.exports = TagsController;

function TagsController(init) {
    Application.call(this, init);
    init.before(function setup(c) {
        this.sectionName = 'content';
        this.pageName = c.actionName;
        c.next();
    });
}

require('util').inherits(TagsController, Application);

// Show the manage tags screen
TagsController.prototype.index = function(c) {
    c.render();
};

// Edit a tag
TagsController.prototype.edit = function(c) {
    c.locals.tag = c.params.id ? _.find(c.req.group.tags, function(tag) {
        return tag.id == c.params.id;
    }) : {};
    c.locals.defaultFilter = 'filter = function(content) {\n\treturn false; //add your filter criteria here\n};';
    c.render();
};

// Save a tag
TagsController.prototype.update = function(c) {
    // validate
    if (!c.body.name) {
        return c.send({
            message: 'Please enter a tag name',
            status: 'error',
            icon: 'warning-sign'
        });
    }

    var group = c.req.group;
    var tag = _.find(group.tags, function(tag) {
        return tag.id.toString() === c.body.id.toString();
    });

    if (!tag) {
        if (!group.tags) {
            group.tags = [];
        }
        tag = { id: group.tags.length, contentCount: 0 };
        group.tags.push(tag);
    }

    // update tag
    tag.name = c.body.name;
    tag.description = c.body.description;
    tag.filter = c.body.filterEnabled ? c.body.filter : null;

    // save the group
    group.save(function() {
        // add the existing content async
        if (c.body.filterExisting) {
            group.getContentForTag(tag, function(posts) {
                async.forEach(posts, function(content, next) {
                    if (!content.tags) {
                        content.tags = [];
                    }

                    // if not already in this tag, add it
                    if (!_.find(content.tags, function(t) {
                        return t.tagId == tag.id;
                    })) {
                        content.tags.push({
                            tagId: tag.id,
                            name: tag.name,
                            createdAt: new Date(),
                            score: 0
                        });

                        // save and forget
                        content.save(next);
                    }
                }, function() {
                    // recalc tag counts
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

// Show how many posts match this filter
TagsController.prototype.count = function(c) {
    var group = c.group();
    var tag = group.tags[c.params.id];
    if (!tag) tag = {};

    if (c.body.filter) {
        tag.filter = c.body.filter;
    }

    // count the number of posts matched
    group.getContentForTag(tag, function(posts) {
        c.send(posts.length.toString());
    });
};

// Delete a tag from the group
TagsController.prototype.destroy = function(c) {
    c.req.group.deleteTag(c.params.id);
    c.send({ redirect: c.pathTo.manageTags() });
};

// Add a tag to the specified posts
TagsController.prototype.create = function(c) {
    var Content = c.Content;
    var group = c.req.group;
    var selectedContent = c.body.selectedContent || [];
    var unselectedContent = c.body.unselectedContent || [];
    var count = 0;

    if (selectedContent.indexOf('all') > -1) {
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
                if (!content) {
                    return next();
                }

                if (!content.tags) {
                    content.tags = [];
                }
                if (!_.find(content.tags, function(tag) {
                    return tag.tagId == c.params.id;
                })) {
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

// Remove a tag from the specified posts
TagsController.prototype.destroyAll = function(c) {
    var Content = c.Content;
    var group = c.req.group;
    var selectedContent = c.body.selectedContent || [];
    var unselectedContent = c.body.unselectedContent || [];
    var count = 0;

    if (selectedContent.indexOf("all") > -1) {
        loadContent(c, function(posts) {
            selectedContent = _.pluck(posts, 'id');
            selectedContent = _.filter(selectedContent, function(id) {
                return unselectedContent.indexOf(id) == -1;
            });

            removeTag(selectedContent);
        });
    } else {
        removeTag(selectedContent);
    }

    function removeTag(selectedContent) {
        async.forEach(selectedContent, function(id, next) {
            Content.find(id, function(err, content) {
                if (!content) {
                    return next();
                }

                if (!content.tags) {
                    content.tags = [];
                }
                if (_.find(content.tags, function(tag) {
                    return tag.tagId.toString() == c.params.id.toString();
                })) {
                    // remove the specified tag
                    content.tags = _.reject(content.tags, function(tag) {
                        return tag.tagId.toString() == c.params.id.toString();
                    });

                    content.save(function(err) {
                        count++;
                        next();
                    });
                }
                else next();
            });
        }, function() {
            // finally, update the group tag counts
            group.recalculateTagContentCounts(c);

            c.send({
                message: count + ' posts un-tagged',
                status: 'success',
                icon: 'ok'
            });
        });
    }
};
