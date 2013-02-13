
var Application = require('./application');

module.exports = UsersController;

function UsersController(init) {
    Application.call(this, init);
    init.before(function setup(c) {
        this.sectionName = 'community';
        c.next();
    });
}

require('util').inherits(UsersController, Application);

UsersController.prototype.index = function (c) {
    c.render();
};
