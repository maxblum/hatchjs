require('should');

var app, compound;

before(function (done) {
    app = require('../')();
    compound = app.compound;
    compound.on('ready', done);
});

describe('tags', function() {

    it('should get all content tagged with "popular" sorted by "score desc"', function (done) {
        var Content = compound.models.Content;
        var Tag = compound.models.Tag;

        //setup
        var popular = new Tag({
            type: 'Content',
            name: 'popular',
            title: 'Most popular posts',
            sortOrder: 'createdAt'
        });

        popular.updateModel();

        Content.create({ createdAt: new Date(), title: 'test 1', text: 'blah blah', groupId: 1, url: 'one', score: 7, tags: [ 'popular', 'test' ] }, function (err, content) {
            Content.create({ createdAt: new Date(), title: 'test 1', text: 'blah blah', groupId: 1, url: 'three', score: 9, tags: [ 'popular' ] }, function () {
                Content.create({ createdAt: new Date(), title: 'test 1', text: 'blah blah', url: 'two', score: 8, tags: [ 'popular' ] }, function () {
                    Content.all({where: {tags: 'popular'}, reverse: false}, function (e, c) {
                        
                        c.length.should.equal(3);
                        c[0].url.should.equal('one');
                        c[1].url.should.equal('two');
                        c[2].url.should.equal('three');
                        
                        done();
                    });
                });
            });
        });
    });

    it('should automatically tag content based on a tag filter', function (done) {
        var Content = compound.models.Content;
        var Tag = compound.models.Tag;

        var moreThan5Likes = new Tag({
            type: 'Content',
            name: 'more-5-likes',
            title: 'Content with more than 5 likes',
            sortOrder: 'likesTotal',
            filter: 'filter = function(content) { return content.likesTotal > 5; };'
        });

        moreThan5Likes.save(function() {
            var content = new Content({ createdAt: new Date(), title: 'likes 5', text: 'blah blah', groupId: 1, url: 'hey', numberOfLikes: 10 });
            Tag.applyMatchingTags(content, function() {
                content.tags.should.equal(['more-5-likes']);

                Content.create(content, function (err, content) {
                    Content.all({where: {tags: 'more-5-likes'}}, function (err, posts) {

                        c.length.should.equal(1);
                        c[0].url.should.equal('hey');

                        done();

                    });
                });     
            });            
        })
    });

});