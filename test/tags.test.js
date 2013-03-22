require('should');

var app, compound;

before(function (done) {
    app = require('../')();
    compound = app.compound;
    compound.on('ready', done);
});

describe('tags', function() {

    //standard tag query with tag-specified sort order
    it('should get all content tagged with "popular" sorted by "score desc"', function(done) {
        var Content = compound.models.Content;

        console.log(compound.models.Tag.schema.adapter)

        //setup
        var popular = new compound.models.Tag({
            type: 'Content',
            name: 'popular',
            title: 'Most popular posts',
            sortOrder: 'createdAt'
        });

        popular.updateModel();

        Content.create({ createdAt: new Date().toString(), title: 'test 1', text: 'blah blah', groupId: 1, url: 'one', score: 7, tags: [ 'popular', 'test' ] }, function (err, content) {
            Content.create({ createdAt: new Date().toString(), title: 'test 1', text: 'blah blah', groupId: 1, url: 'three', score: 9, tags: [ 'popular' ] }, function () {
                Content.create({ createdAt: new Date().toString(), title: 'test 1', text: 'blah blah', url: 'two', score: 8, tags: [ 'popular' ] }, function () {
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

});