var app, compound, Media;

describe('Media', function() {

    before(function (done) {
        app = require('../')();
        compound = app.compound;
        compound.on('ready', function () {
            Media = compound.models.Media;
            Media.destroyAll(done);
        });
    });

    it('should download an image file, put in upload dir and resize', function (done) {
        // create a fake request
        var req = {
            body: {
                file: 'http://eofdreams.com/data_images/dreams/mountain/mountain-02.jpg'
            }
        };

        Media.createWithRequest(req, function (err, media) {
            media.resized.length.should.equal(4);

            var url = media.getUrl('100x0');
            url.should.match(/128x0/);

            done();
        });
    });

    it('should upload an image to S3', function (done) {
        // set the s3 settings
        Media.s3 = {
            key: 'AKIAJ6KXH3G5Q6LLWVRQ',
            secret: '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',
            bucket: 's3.hatchcdn.com',
            path: 'upload'
        }

        Media.uploadToCDN = Media.uploadToS3;

        // create a fake request
        var req = {
            body: {
                file: 'http://eofdreams.com/data_images/dreams/mountain/mountain-02.jpg'
            }
        };

        Media.createWithRequest(req, function (err, media) {
            media.resized.length.should.equal(4);

            var url = media.getUrl('100x0');
            url.should.match(/128x0/);

            console.log(url);

            done();
        });
    });

});
