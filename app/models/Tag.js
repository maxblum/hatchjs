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

module.exports = function (compound, Tag) {
    var api = compound.hatch.api;

    Tag.validatesPresenceOf('title', {message: 'Please enter a title'});
    Tag.validatesUniquenessOf('name', {message: 'This tag name is taken'});

    /**
     * updates the compound model for this tag to make sure the custom sort 
     * order is defined for the specified tag
     * 
     * @param  {[Tag]} tag [tag to check for]
     */
    Tag.updateModel = function (tag) {
        if(!tag.sortOrder) return;

        if(!compound.models[tag.type].customSort['tags.' + tag.name]) {
            compound.models[tag.type].customSort['tags.' + tag.name] = tag.sortOrder;
        }
    };

    /**
     * rebuilds the index for this tag
     */
    Tag.prototype.rebuildIndex = function () {
        Tag.rebuildIndex(this);
    };

    /**
     * rebuilds the index for the specified tag
     * 
     * @param  {[Tag]} tag [tag to rebuild index for]
     */
    Tag.rebuildIndex = function (tag) {
        //make sure the custom sort is correct in the schema
        Tag.updateModel(tag);

        //re-save every object
        compound.models[tag.type].all({ where: { tags: tag.name }}, function (err, data) {
            data.forEach(function (data) {
                data.save();
            });
        });
    };

    /**
     * gets the filter function for this tag
     * 
     * @return {[Function]} [the filter function (if any)]
     */
    Tag.getter.filterFn = function () {
        if(this.filter) return eval(this.filter);
        else return null;
    };

    /**
     * gets whether an object matches this tag's filter
     * 
     * @param  {[object]}   obj  [object to test]
     * @return {[Boolean]}       [true or false]
     */
    Tag.prototype.matchFilter = function (obj) {
        if(this.filterFn) {
            return this.filterFn(obj);
        }
        else {
            return false;
        }
    };

    /**
     * gets all of the matching tags for the specified object
     * 
     * @param  {[object]}   obj      [object to get matching tags for]
     * @param  {Function}   callback [callback function]
     */
    Tag.getMatchingTags = function (obj, callback) {
        Tag.all({ where: { type: typeof obj }}, function (err, tags) {
            var matchingTags = [];

            tags.forEach(function (tag) {
                //skip group specific tags for other groups
                if(tag.groupId && tag.groupId != obj.groupId) return;

                if(tag.matchFilter(obj)) matchingTags.push(tag);
            });

            callback(err, matchingTags);
        });
    };

    /**
     * applies matching tags to this object
     * 
     * @param  {[object]}   obj      [object to apply matching tags for]
     * @param  {Function}   callback [callback function]
     */
    Tag.applyMatchingTags = function (obj, callback) {
        Tag.getMatchingTags(obj, function(err, tags) {
            tags.forEach(function (tag) {
                if(!obj.tags[tag.name]) obj.tags.push(tag.name);
            });

            callback(err, obj);
        });
    };
};