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

var _ = require('underscore');
var knox = require('knox');
var im = require('imagemagick');
var fs = require('fs');
var path = require('path');
var async = require('async');
var mime = require('mime');

/**
 * hook to intercept uploads and send them to Amazon S3
 * 
 * @param  {[context]}   c      [http context]
 * @param  {[params]}    params [hook params]
 * @param  {Function}    next   [continuation function]
 */
exports.upload = function upload(c, params, next) {
    var module = c.req.group.getModule('s3');
    var filename = c.req.query.qqfile, file, filepath;
    var defaultSizes = '32,48,64,80,160,320,480';

    //the s3 upload path should include the database prefix and group.id (if available)
    var s3Path = path.join(
        module.contract.defaultPath || '',
        c.api.app.config.database.prefix || '',
        c.req.group ? c.req.group.id : '',
        new Date().getTime() + '-');

    //get the file that was uploaded
    if(!filename) { //IE
        file = c.req.files.qqfile;
    } else {
        file = c.req.files[filename];
    }

    filename = file.name;
    filepath = file.path;

    //check we have the correct settings
    if(module.contract.key && module.contract.secret && module.contract.bucket) {
        var client = knox.createClient({
            key: module.contract.key,
            secret: module.contract.secret,
            bucket: module.contract.bucket,
            region: module.contract.region || 'eu-west-1'
        });

        if(['jpg', 'jpeg', 'png', 'gif'].indexOf(filename.split('.').pop().toLowerCase()) > -1) {
            //get the image sizes that we will upload
            var imageSizes = _.union(['0'], (module.contract.imageSizes || defaultSizes).split(','));
            var urls = [];

            //upload each size 
            async.forEach(imageSizes, function(size, next) {
                //skip blanks
                if(size == '') return next();

                var width = parseInt(size.split('x')[0]);
                var height = parseInt(size.split('x')[1] || 0);
                var resizeFilename = filepath.substring(0, filepath.lastIndexOf('/') +1) + filename.substring(0, filename.lastIndexOf('.')) + '_' + width + 'x' + height + filename.substring(filename.lastIndexOf('.'));

                //if no resize is required, upload directly
                if(width == 0 && height == 0) return uploadToS3(client, filepath, filename, function(err, url) {
                    urls.push(url);
                    next(err);
                });

                //resize and upload each file
                im.resize({
                    srcPath: filepath,
                    dstPath: resizeFilename,
                    width: width,
                    height: height
                }, function(err, stdout, stderr){
                    if (err) return next(err);

                    //upload to S3
                    uploadToS3(client, resizeFilename, resizeFilename.split('/').pop(), function(err, url) {
                        urls.push(url);
                        next(err);
                    });
                });
            }, function(err) {
                done(err, urls);
            });
        } else {
            //just upload the original file to S3
            uploadToS3(client, filepath, filename, function(err, url) {
                urls.push(url);
                done(err, urls);
            });
        }
    } else {
        next();
    }

    //continuation function - run once all of the uploads have completed
    function done(err, results) {
        if(err) console.log(err);

        //sort by length
        results = _.sortBy(results, 'length');

        var url = results[0];

        //get rid of the 'https'
        url = url.substring(url.indexOf('//'));

        //if we're using a domain bucket, fix the url
        if(module.contract.bucket.indexOf('.') > -1) {
            url = '//' + module.contract.bucket + url.substring(url.indexOf('/', 3));
        }

        //send back the url of the first image
        c.res.contentType('text/html');
        c.send({ success: 'success', url: url });
    }

    /**
     * uploads a file to S3
     *
     * @param  {S3}       client [amazon s3 client]
     * @param  {[file]}   file   [file to upload]
     * @param  {Function} done   [continuation function]
     */
    function uploadToS3(client, path, filename, done) {
        console.log('uploading "' + filename + '" to S3');

        client.putFile(path, s3Path + slugify(filename), { 'x-amz-acl': 'public-read', 'cache-control': 'public,max-age=31536000', 'Content-Type': mime.lookup(filename) }, function(err, res) {
            if(err) console.log(err);

            //delete the original file
            fs.unlink(path);

            //get the url of the uploaded file
            var url = res.client._httpMessage.url;
            done(err, url);
        });
    }

    //makes filename url-compatible
    function slugify(text) {
        text = text.toLowerCase();
        text = text.replace(/[^_-a-zA-Z0-9\.\s]+/ig, '');
        text = text.replace(/\s/gi, "-");
        return text;
    }
};
