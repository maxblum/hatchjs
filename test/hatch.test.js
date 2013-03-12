describe('hatch', function() {
    it('should work', function(done) {
        var app = require('../')();
        app.compound.on('ready', done);
    });
});
