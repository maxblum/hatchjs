//
// Hatch.js is a CMS and social website building framework built in Node.js 
// Copyright (C) 2013 Inventures Software Ltd
// 
// This file is part of Hatch.js
// 
// Hatch.js is free software: you can redistribute it and/or modify it under
// the terms of the GNU General Public License as published by the Free
// Software Foundation, version 3
// 
// Hatch.js is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
// FOR A PARTICULAR PURPOSE.
// 
// See the GNU General Public License for more details. You should have
// received a copy of the GNU General Public License along with Hatch.js. If
// not, see <http://www.gnu.org/licenses/>.
// 
// Authors: Marcus Greenwood, Anatoliy Chakkaev and others
//

var fs = require('fs');
var fsTools = require('fs-tools');
var path = require('path');
var restore = require('./restore');

module.exports = function hatchSetup(compound) {
    return function (req, res, next) {
        // just continue if we find a group
        if (req.group) {
            return next();
        }

        var Group = compound.models.Group;

        // check to see if any groups have been created
        Group.all({limit: 1}, function(err, groups) {
            // if there are groups in the db, proceed to default 404 route
            if (groups.length > 0) {
                return next();
            }

            // check to see if we are processing the response
            if (req.method == 'POST') {
                if (req.query.qqfile) {
                    uploadFile();
                } else if (req.body.dataFilename) {
                    importData();
                } else {
                    setupGroup();
                }
            } else {
                renderView();
            }
        })

        function renderView() {
            res.render(path.join(__dirname, '../views/setup.ejs'), {req: req});
        }

        function uploadFile() {
            var filename = req.query.qqfile;
            var file = req.files[filename];

            var uploadPath = compound.app.get('upload path');
            var fullPath = path.join(uploadPath, filename);

            fsTools.move(file.path, fullPath, function(err) {
                res.contentType('text/html');
                res.send({ success: 'success', url: fullPath });
            });

        }

        function importData() {
            restore.run({
                req: req,
                res: res,
                compound: compound
            }, req.body.dataFilename, req.body.domain, function() {
                // redirect to the restored group
                res.send({ redirect: '//' + req.body.domain });
            });
        }

        function setupGroup() {

            // standard application setup
            var fields = ['username', 'email', 'password', 'confirm', 'name',
                'url'];

            // validate
            for (var f in fields) {
                var field = fields[f];
                if (!req.body[field]) {
                    res.statusCode = 500;
                    return res.send({
                        status: 'error',
                        message: 'Please fill in all fields!'
                    });
                }
            }

            // validate password
            if (req.body.password !== req.body.confirm) {
                res.statusCode = 500;
                return res.send({
                    status: 'error',
                    message: 'Password and confirmation do not match!'
                });
            }

            // load the seed data and modify
            var seeds = require('../seed.yml');

            seeds[0].Group.name = req.body.name;
            seeds[0].Group.url = req.body.url;
            seeds[0].Group.homepage.url = req.body.url + '/';
            seeds[0].Group.pagesCache[0].url = req.body.url + '/';

            seeds[1].Page.url = req.body.url + '/';

            seeds[2].User.username = req.body.username;
            seeds[2].User.email = req.body.email;
            seeds[2].User.password = req.body.password;

            // create the group and administrator user
            (function next(seeds) {
                var seed = seeds.shift();
                if (!seed) return done && done();
                var model = Object.keys(seed)[0];
                compound.models[model].upsert(seed[model], next.bind(null, seeds));
            })(seeds);

            // done function - redirects to the newly created default group
            function done() {
                //log the user in
                req.session.userId = 1;

                //redirect to the newly created group
                res.send({redirect: '//' + req.body.url});
            }
        }
    }
};
