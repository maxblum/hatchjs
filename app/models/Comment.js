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

module.exports = function (compound, Comment) {
    var Content = compound.models.Content;

    // validation
    Comment.validatesPresenceOf('contentId', 'authorId', 'text');

    /**
     * Get whether this comment has been flagged.
     * 
     * @return {Boolean}
     */
    Comment.getter.hasFlag = function () {
        return this.flags.length > 0;
    };

    /**
     * Set the date automatically if we don't have one.
     * 
     * @param  {Function} next - callback function
     */
    Content.beforeSave = function (next) {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
        next();
    };

    /**
     * After a comment is saved, update the parent content item.
     * 
     * @param  {Function} next - callback function
     */
    Comment.afterSave = function (next) {
        Content.updateComments(this.contentId);
    };

    /**
     * After a comment is deleted, update the parent content item.
     * 
     * @param  {Function} next - callback function
     */
    Comment.afterDestroy = function (next) {
        Content.updateComments(this.contentId);
    };
};