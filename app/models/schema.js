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

var WidgetInstance = require('../widget').WidgetInstance;

module.exports = function (db) {

    var User = db.define('User', {
        username:   { type: String, index: true, sort: true },
        email:      { type: String, index: true },
        type:       { type: String, index: true },
        password:   String,
        hasPassword:Boolean,
        avatar:     String,
        name:       String,
        firstname:  String,
        lastname:   { type: String, sort: true },
        lastnameLetter:   { type: String, index: true },
        displayName: { type: String, sort: true },
        oneLiner:   String,
        membership: db.JSON,
        customListIds: { type: db.JSON, index: true },
        ifollow:    db.JSON, // array of ids of user who followed by user
        otherFields:db.JSON,
        mailSettings:db.JSON,
        fulltext:   String
    }, {safe: true});

    db.adapter.defineFulltextIndex('User', 'fulltext');

    db.adapter.defineNestedIndex('User', 'membership:groupId', Number, 'groupId');
    db.adapter.defineNestedIndex('User', 'membership:state', String, 'groupId');
    db.adapter.defineNestedIndex('User', 'membership:role', String, 'groupId');
    db.adapter.defineNestedIndex('User', 'membership:joinedAt', Date, 'groupId');
    db.adapter.defineNestedIndex('User', 'membership:invitationCode', String, 'groupId');

    var Group = db.define('Group', {
        name: { type: String, fulltext: true, sort: true },
        pagesCache: db.JSON,
        homepage: db.JSON,
        modules: db.JSON,
        joinPermissions: String,
        favicon: String,
        metaKeywords: String,
        metaDescription: String,
        navBarType: String,
        navBarStyle: String,
        hideSearch: Boolean,
        headerHtml: String,
        footerHtml: String,
        cssVersion: String,
        googleAnalyticsId: String,
        customProfileFields: db.JSON,
        memberLists: db.JSON,
        tags: db.JSON,
        importStreams: db.JSON
    });

    var Stylesheet = db.define('Stylesheet', {
        groupId: { type: Number, index: true },
        css: String,
        version: Number,
        lastUpdate: Date,
        less: db.JSON
    });

    var Page = db.define('Page', {
        title: { type: String, fulltext: true },
        url: { type: String, index: true },
        customUrl: Boolean,
        grid: String,
        columns: db.JSON, // JSON [ {size: 6, widgets: [1,2,3]}, {size: 6, widgets: [4,5,6]}]
        widgets: [WidgetInstance],
        metaTitle: String,
        metaDescription: String,
        metaKeywords: String,
        type: { type: String, index: true },
        tags: String,
        hideFromNavigation: Boolean,
        order: Number,
        templateId: Number,
        parentId: { type: Number, index: true },
        groupId: { type: Number, index: true }
    });

    var Content = db.define('Content', {
        type: { type: String, index: true },
        imported: { type: Boolean, index: true },
        title: { type: String, index: true },
        text: String,
        excerpt: String,
        previewImage: String,
        attachment: db.JSON,
        poll: db.JSON,
        location: db.JSON,
        comments: { type: [], fulltext: true },
        repliesTotal: { type: Number, index: true, sort: true },
        likes: [],
        dislikes: [],
        likesTotal: { type: Number, index: true, sort: true },
        views: { type: Number, index: true, sort: true },
        score: { type: Number, index: true, sort: true },
        groupId: { type: Number, index: true },
        replyToId: { type: Number, index: true },
        tags: db.JSON,
        tagString: { type: String, index: true },
        authorId: { type: Number, index: true },
        privacy: { type: String, index: true },
        createdAt: { type: Date, index: true, sort: true },
        updatedAt: { type: Date, index: true },
        timestamp: { type: Number, index: true, sort: true },
        priority: { type: Number, index: true, sort: true },
        url: { type: String, index: true },
        fulltext: String,
        importData: db.JSON
    });

    db.adapter.defineFulltextIndex('Content', 'fulltext');
    db.adapter.defineNestedIndex('Content', 'tags:tagId', Number, 'tagId');

    var ContentFeedItem = db.define('ContentFeedItem', {
        userId: { type: Number, index: true },
        contentId: { type: Number },
        createdAt: { type: Date, index: true }
    });

    var Media = db.define('Media', {
        type: { type: String, index: true },
        userId: { type: Number, index: true },
        createdAt: { type: Date, index: true, sort: true },
        url: String
    });

    var Notification = db.define('Notification', {
        userId: { type: Number, index: true },
        createdAt: { type: Date, index: true, sort: true },
        isRead: { type: Boolean, index: true },
        isActioned: Boolean,
        url: String,
        html: String
    });

    var ImportStream = db.define('ImportStream', {
        groupId: { type: Number, index: true },
        type: { type: String, index: true },
        title: String,
        query: String,
        source: String,
        tags: [],
        interval: Number,
        enabled: { type: Boolean, index: true },
        lastRun: Date
    });
};

