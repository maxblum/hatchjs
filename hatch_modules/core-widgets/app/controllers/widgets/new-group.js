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

exports.createGroup = function (c) {
    c.req.group.clone(c.req.body, function (err, newGroup) {
        if (err) {
            //send the error message
            c.error({
                status: 'error',
                icon: 'warning-sign',
                message: err.message
            });
        } else {
            // add user to members of new group to be able to edit it
            c.req.user.membership.push({
                groupId: newGroup.id,
                role: 'owner',
                joinedAt: new Date,
                state: 'approved'
            });

            c.req.user.save(function () {
                c.send({ redirect: '//' + newGroup.homepage.url });
            });
        }
    });
};

