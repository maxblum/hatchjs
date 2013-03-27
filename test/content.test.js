var app, compound, Content;

describe('Content', function() {

    before(function (done) {
        app = require('../')();
        compound = app.compound;
        compound.on('ready', function () {
            Content = compound.models.Content;
            Content.destroyAll(done);
        });
    });

    it('should create content with some score', function(done) {
        Content.create({
            createdAt: new Date,
            title: 'Hello',
            text: 'World',
            likes: Array(4)
        }, function(err, content) {
            Content.all(function(err, c) {
                c.length.should.equal(1);
                c[0].score.should.equal(2);
                done();
            });
        });
    });

});
