var should = require('./');
var app, hatch;

describe('api/specialpage', function() {

    before(function(done) {
        app = getApp(done);
        hatch = app.compound.hatch;
    });

    describe('path', function() {

        var profile;
        var group = {
            pagesCache: [{type: 'profile', url: 'example.com/account/:username'}],
            homepage: {url: 'example.com'}
        };

        before(function() {
            profile = hatch.page.get('profile');
        });

        it('should produce default path for special page', function() {
            profile.path().should.equal('/profile');
        });

        it('should produce path for special page in group', function() {
            profile.path(group).should.equal('/account');
        });

        it('should produce path for special page in group', function() {
            profile.path(group, {
                fullPath: true
            }).should.equal('http://example.com/account/');
        });

        it('should add params to url', function() {
            profile.path(group, {
                username: 'admin'
            }).should.equal('/account/admin');
        });

        it('should add query params to url', function() {
            profile.path(group, {
                short: true
            }).should.equal('/account/?short=true');
        });

        it('should be matched', function() {
            var params = profile.matchRoute(group, '/account');
            params.should.be.ok;
            params.username.should.equal('');
        });

        it('should be matched with params', function() {
            var params = profile.matchRoute(group, '/account/anatoliy');
            params.should.be.ok;
            params.username.should.equal('anatoliy');
        });

        it('should be matched with query params', function() {
            var params = profile.matchRoute(group, '/account/?username=anatoliy');
            params.should.be.ok;
            params.username.should.equal('anatoliy');
        });

    });
});
