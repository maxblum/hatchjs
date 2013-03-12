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

var yaml = require('js-yaml');
var fs = require('fs');
var fsTools = require('fs-tools');
var path = require('path');
var restore = require('../util/restore');

module.exports = function (api, container) {
    return function (req, res, next) {
        //just continue if we find a group
        if(req.group) return next();

        //check to see if any groups have been created
        api.db.models.Group.all({ limit: 1}, function(err, groups) {
            //if there are groups in the db, proceed to default 404 route
            if(groups.length > 0) {
                console.log('groups found. Aborting setup');

                return next();
            }
            else {
                console.log('setup new group for: ' + req.headers.host);

                //check to see if we are processing the response
                if(req.method == 'POST') {
                    //upload a file?
                    if(req.query.qqfile) {
                        var filename = req.query.qqfile;
                        var file = req.files[filename];

                        var uploadPath = api.app.config.paths.upload;
                        var fullPath = path.join(uploadPath, filename);

                        fsTools.move(file.path, fullPath, function(err) {
                            res.contentType('text/html');
                            res.send({ success: 'success', url: fullPath });
                        });

                        return;
                    }

                    //import data
                    if(req.body.dataFilename) {
                        restore.run({ req: req, res: res, api: api }, req.body.dataFilename, req.body.domain, function() {
                            //redirect to the newly restored group
                            return res.send({ redirect: '//' + req.body.domain });                        
                        });

                        return;
                    }

                    //standard application setup
                    var fields = ['username', 'email', 'password', 'confirm', 'name', 'url'];

                    //validate
                    for(var f in fields) {
                        var field = fields[f];
                        if(!req.body[field]) {
                            res.statusCode = 500;
                            return res.send({ status: 'error', message: 'Please fill in all fields!' });
                        }
                    }

                    //validate password
                    if(req.body.password != req.body.confirm) {
                        res.statusCode = 500;
                        return res.send({ status: 'error', message: 'Password and confirmation do not match!' });
                    }

                    //load the seed data and modify
                    var seeds = yaml.load(fs.readFileSync(__dirname + '/../seed/data.yml'));
                    
                    seeds[0].Group.name = req.body.name;
                    seeds[0].Group.url = req.body.url;
                    seeds[0].Group.homepage.url = req.body.url + '/';
                    seeds[0].Group.pagesCache[0].url = req.body.url + '/';

                    seeds[1].Page.url = req.body.url + '/';

                    seeds[2].User.username = req.body.username;
                    seeds[2].User.email = req.body.email;
                    seeds[2].User.password = req.body.password;

                    //create the group and administrator user
                    (function next(seeds) {
                        var seed = seeds.shift();
                        if (!seed) return done && done();
                        var model = Object.keys(seed)[0];
                        api.db.models[model].upsert(seed[model], next.bind(null, seeds));
                    })(seeds);

                    //done function - redirects to the newly created default group
                    function done() {
                        //log the user in
                        req.session.userId = 1;

                        //redirect to the newly created group
                        return res.send({ redirect: '//' + req.body.url });
                    }
                }
                else {
                    //there are no groups in the db - start setup
                    res.render(__dirname + '/../views/setup.ejs', { req: req });
                }
            }
        })
    }
};